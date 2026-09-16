# BOOT-000 — Implementation plan

## Outcome

Implement the local reporting-data foundation specified in `refined_task_request.md`: a deterministic standard-library Python loader, a generated three-table SQLite database, a machine-readable semantic YAML file, operational documentation, focused tests, and a small discovery entry in the repository's root `AGENTS.md`.

The work is complete when a new Codex session can locate the database from `AGENTS.md`, consult the semantic layer, select the correct table/date column, execute read-only SQLite queries, and understand the extract's coverage limitations without inspecting loader internals.

## Scope boundaries

- Work only on the data foundation under `_PROJECT/` plus the required discovery addition to root `AGENTS.md`.
- Do not edit any CSV input, Next.js application file, stylesheet, brand-kit file, dependency manifest, or lockfile.
- Do not add third-party Python or JavaScript dependencies.
- Do not build a report, API, natural-language-to-SQL agent, scheduled refresh, or UI.
- Preserve all unrelated working-tree changes. In particular, inspect the existing `AGENTS.md` diff before editing and make only a narrow additive change.

## Planned file changes

| Path | Action | Purpose |
| --- | --- | --- |
| `_PROJECT/scripts/build_reporting_database.py` | Create | Validate and transform the three CSV extracts, create the SQLite schema, load rows, validate the result, and atomically publish the database |
| `_PROJECT/tests/test_reporting_database.py` | Create | Standard-library `unittest` coverage for transformations, schemas, data invariants, idempotence, malformed inputs, and atomic failure behavior |
| `_PROJECT/data/reporting/cfi_reporting.sqlite` | Generate | Checked-in/local queryable SQLite artifact containing the three required reporting tables |
| `_PROJECT/data/reporting/semantic_layer.yaml` | Create | Stable machine- and human-readable description of sources, tables, columns, relationships, query guidance, and limitations |
| `_PROJECT/data/reporting/README.md` | Create | Entry point for future humans and Codex tasks, with build/test/query/refresh instructions |
| `AGENTS.md` | Modify narrowly | Add a compact `Local reporting data` discovery section pointing to the reporting README and semantic layer |

The source request, refined request, and CSV inputs remain unchanged.

## Phase 1 — Preflight and source protection

1. Re-read root `AGENTS.md` and `refined_task_request.md` immediately before implementation.
2. Record the current working-tree status and inspect the existing `AGENTS.md` diff so user-authored changes are not overwritten.
3. Compute SHA-256 hashes for the three CSV inputs and retain them for the final unchanged-source check.
4. Confirm the three input files are the only matches for their required prefixes and capture their exact ordered headers.
5. Confirm `python3` and `sqlite3` are available. Inspect whether a real YAML parser is already available for final validation, without installing an application dependency.
6. Create only the required parent directories under `_PROJECT/data/reporting`, `_PROJECT/scripts`, and `_PROJECT/tests`.

Gate: do not start implementation if an input is missing, ambiguous, unreadable, or has drifted from the schema in the refined request. Report the mismatch rather than adapting silently.

## Phase 2 — Implement the loader

Create `_PROJECT/scripts/build_reporting_database.py` as both an importable module and a CLI. Use only Python standard-library modules.

### 2.1 Central schema specification

Define each source/table once in a typed internal specification so header validation, conversion, DDL, insertion, and validation do not drift apart. A small frozen `dataclass` or equivalent named structure should contain:

- filename prefix;
- destination table name;
- exact ordered source columns;
- converter for every column;
- SQLite DDL, primary key, and indexes;
- expected table grain/key;
- required nullability.

Keep the three table specifications near the top of the module and use named constants for repository-relative default paths.

### 2.2 Path and source resolution

Implement these behaviors:

- derive the repository root from `Path(__file__).resolve()`, not the process working directory;
- default the input directory and destination exactly as specified;
- accept `--input-dir` and `--output` overrides through `argparse`;
- create the destination's parent directory when needed;
- find files using the three required prefixes and a `.csv` suffix;
- require exactly one match per prefix and return a clear missing/ambiguous-source error;
- use deterministic ordering for source resolution, table creation, indexes, and insertion.

### 2.3 Conversion helpers

Implement focused conversion functions that accept source context (filename, physical CSV row number, and column name) so errors are actionable.

- Null handling:
  - return `None` for empty/whitespace-only input and the exact `[NULL]` marker;
  - preserve `NONE` and all other non-null text;
  - do not broadly strip or normalize meaningful descriptions, labels, names, or identifiers.
- Integer handling:
  - accept valid base-10 integer text;
  - reject decimals or non-numeric values;
  - let required-field validation reject `None` for non-null columns.
- Monetary handling:
  - remove comma thousands separators;
  - parse first with `Decimal`;
  - reject malformed and non-finite values;
  - bind a canonical decimal string so SQLite `REAL` affinity performs numeric storage without first parsing through Python binary floating point.
- Date handling:
  - parse source dates with `%m/%d/%Y`;
  - store ISO `YYYY-MM-DD` text.
- Timestamp handling:
  - parse `modified_on` with `%m/%d/%Y %H:%M`;
  - store ISO `YYYY-MM-DD HH:MM:SS` text.
- Text handling:
  - preserve source values exactly except for null detection;
  - reject null values for required columns.

Use one custom exception type for expected data/build failures so the CLI can print a concise error to stderr and return a non-zero status without a noisy traceback. Unexpected programming errors should still surface during tests.

### 2.4 CSV validation and row parsing

For each source:

1. Open with `encoding="utf-8-sig"` and `newline=""`.
2. Parse with `csv.DictReader`.
3. Check that the header exists, contains no duplicate names, and exactly equals the expected ordered list.
4. Detect malformed rows with missing or extra fields.
5. Convert fields through the table specification.
6. Track the physical CSV row number beginning at 2 for the first data record.
7. Keep only the converted row values in memory; do not log full business rows.

Fail the entire build on the first invalid row. Never partially publish a database.

### 2.5 Database creation and atomic publication

Implement a top-level function similar to:

```python
build_database(input_dir: Path, output_path: Path) -> dict[str, int]
```

The function should:

1. resolve and fully parse/validate all three inputs;
2. create a uniquely named temporary SQLite file in the destination directory with `tempfile`;
3. connect to the temporary file and explicitly begin a transaction;
4. create only the three required business tables and required indexes;
5. insert rows with parameterized `executemany` statements in a deterministic order;
6. run internal post-load validation before committing:
   - expected user table set;
   - row counts matching parsed records;
   - primary-key uniqueness through database constraints;
   - `PRAGMA integrity_check` equals `ok`;
7. commit and close the SQLite connection;
8. atomically replace the requested destination with `os.replace` only after every validation passes;
9. delete the temporary file in all failure paths without touching an existing destination.

Do not open or truncate the destination before the temporary database has passed validation. Ensure the temporary file is removed if connection, DDL, insert, commit, validation, or replacement fails.

### 2.6 CLI behavior

The CLI entry point should:

- parse the two optional path arguments;
- call the importable build function;
- return exit code `0` on success and non-zero for a controlled build failure;
- print one compact success line with the final path;
- print one row-count line per table;
- avoid logging source records or monetary details.

Gate: manually build to a temporary output and inspect `.tables`, `PRAGMA table_info`, `PRAGMA index_list`, row counts, normalized dates, nulls, literal `NONE` values, and representative aggregates before generating the final database.

## Phase 3 — Build the test suite

Create `_PROJECT/tests/test_reporting_database.py` with `unittest`, `tempfile`, `csv`, `hashlib`, `sqlite3`, and other standard-library modules only.

### 3.1 Test setup

- Import the loader's public functions without executing its CLI.
- Use the real three source files for happy-path integration tests, but always write the database to a temporary directory.
- For negative tests, copy all sources to a temporary input directory and mutate only the copy with the `csv` module.
- Capture source hashes before and after the suite to verify the repository inputs remain unchanged.
- Add small query helpers to reduce duplicated connection/cleanup logic.

### 3.2 Happy-path tests

Cover:

- exact user-table set;
- complete column names, SQLite declared types, nullability, primary keys, and required indexes;
- row counts of 26, 6, and 4;
- ISO-normalized date and timestamp ranges;
- `[NULL]` conversion and exact `NONE` preservation;
- 5 null `owner_co_number` values and one integer value of `3`;
- all representative aggregates from the refined request, rounded to two decimal places;
- Drew Bell's last-seven-days value and the Dallas new-job count/value;
- `PRAGMA integrity_check` result;
- a second build to the same output path with no duplicated rows or changed logical results.

### 3.3 Failure-path tests

Create isolated tests for:

- a renamed/missing header;
- a duplicate or unexpected header;
- an invalid date;
- an invalid timestamp;
- an invalid monetary value;
- an invalid integer;
- a required field containing `[NULL]`;
- a missing prefix match;
- two files matching one prefix;
- a duplicate primary key;
- preservation of an existing valid destination after a later build fails.

For context-rich errors, assert that the message identifies the relevant source file, row/column where applicable, and the reason without echoing an entire source record.

### 3.4 Test command

Prefer the command from the refined request if it works:

```bash
python3 -m unittest _PROJECT.tests.test_reporting_database
```

If namespace-package discovery is unreliable, use and document:

```bash
python3 -m unittest discover -s _PROJECT/tests -p "test_*.py"
```

Gate: all loader tests pass before writing or replacing the final database artifact.

## Phase 4 — Generate and independently inspect the database

1. Run the loader with defaults to create `_PROJECT/data/reporting/cfi_reporting.sqlite`.
2. Run it a second time to exercise real destination replacement.
3. Inspect the final file independently with the `sqlite3` CLI rather than relying only on loader assertions.
4. Verify:
   - the database opens read-only;
   - `PRAGMA integrity_check` returns `ok`;
   - only the three required user tables exist;
   - schemas, primary keys, and indexes match the refined request;
   - exact row counts and source-specific null/sentinel checks pass;
   - date ranges and representative aggregate queries match the acceptance values.
5. Recompute the CSV SHA-256 hashes and compare them to Phase 1.

Do not hand-edit the generated SQLite file. Any discrepancy must be fixed in the loader and resolved by rebuilding.

## Phase 5 — Author the semantic layer

Create `_PROJECT/data/reporting/semantic_layer.yaml` from the final implemented schema and observed source facts.

### 5.1 Top-level contract

Add the required top-level keys in a predictable order:

1. `version`
2. `name`
3. `description`
4. `database`
5. `sources`
6. `null_handling`
7. `tables`
8. `relationships`
9. `query_guidance`
10. `known_limitations`
11. `examples`

Use repository-relative POSIX paths. Quote YAML scalars where automatic YAML typing could change a code, date, sentinel, or identifier.

### 5.2 Source and coverage metadata

For each source, record:

- exact repository-relative filename;
- filename prefix and destination table;
- record count;
- filename-indicated snapshot/range, explicitly labeled as filename metadata;
- actual minimum/maximum business date observed;
- other relevant observed time ranges;
- snapshot/extract limitations.

Call out the change-order filename/`co_date` mismatch and the limited two-day new-job coverage directly.

### 5.3 Table and field semantics

For all 35 source columns across the three tables, document:

- physical SQLite type and nullability;
- semantic role;
- plain-language description no stronger than the evidence supports;
- unit/format;
- useful aliases;
- field-specific caveats.

Do not invent definitions for status `A`, `bd_linked`, source currency, fiscal periods, similar sales measures, or source-provided variance formulas. Mark these as requiring business confirmation.

### 5.4 Query behavior

Encode the required selection rules:

- account manager/name mapping through `project_class_name` and `project_class_id`;
- pre-aggregated handling of `sales_last_7_days` with explicit snapshot caveat;
- `co_date` for change-order business-period filtering and `modified_on` only for explicit modification questions;
- `opened_date` for new-job periods/trends;
- `NONE` as a literal category;
- candidate, non-enforced relationship from new-job `sales_id` to account-manager `project_class_id`;
- refusal to imply coverage outside loaded rows/dates.

Add the three required example question mappings and readable SQL. Each example should include or reference the coverage caveat that applies to its answer.

### 5.5 YAML verification

Validate the file with a real safe YAML parser already present in the environment. Also verify programmatically or with a focused review that:

- every implemented table appears exactly once;
- every source column appears exactly once under its table;
- all database and source paths resolve from the repository root;
- all example SQL parses and executes successfully against the generated SQLite database;
- examples are read-only and return the expected shape.

Do not add PyYAML, an npm YAML package, or another application dependency solely for validation.

## Phase 6 — Write operations and discovery documentation

### 6.1 Reporting README

Create `_PROJECT/data/reporting/README.md` after loader commands and test commands are known to work. Include:

- a concise statement of purpose and non-live/snapshot status;
- artifact/source/script/test paths;
- a table-selection matrix with grain and preferred date field;
- exact build and test commands verified in this implementation;
- `sqlite3` table-listing and read-only query examples for all three tables;
- refresh workflow and exactly-one-prefix-match rule;
- atomic replacement/failure-safety behavior;
- current observed date coverage and semantic limitations;
- a prominent direction to consult `semantic_layer.yaml` before generating SQL or reports.

Use repository-relative links/paths so the documentation remains portable.

### 6.2 Root AGENTS.md

1. Re-check the current diff immediately before editing.
2. Add a compact `Local reporting data` section in the most relevant stable location without reformatting or replacing other content.
3. Link or point to the reporting README, semantic YAML, SQLite database, loader, tests, and input directory.
4. State the semantic-layer-first and coverage-disclosure rules.
5. Inspect the resulting diff to confirm only the intended lines were added by this task and all pre-existing changes remain intact.

## Phase 7 — Final validation

Run the checks in this order from the repository root:

```bash
python3 -m unittest _PROJECT.tests.test_reporting_database
python3 _PROJECT/scripts/build_reporting_database.py
python3 _PROJECT/scripts/build_reporting_database.py
sqlite3 _PROJECT/data/reporting/cfi_reporting.sqlite "PRAGMA integrity_check;"
npm run lint
npm run build
```

Then run a compact independent SQLite verification covering:

- user table names;
- row counts;
- schema/index metadata;
- min/max date values;
- null and `NONE` counts;
- required representative aggregates and semantic queries.

Finally:

- validate the semantic YAML with a safe parser;
- execute every example SQL statement from the semantic layer against the final database;
- compare final source hashes with the Phase 1 hashes;
- inspect `git status` and diffs for scope creep, accidental input changes, dependency changes, or generated temporary files;
- confirm no UI/brand/browser review is needed because no user-facing application code changed.

If `npm run lint` or `npm run build` fails because of an unrelated pre-existing issue, capture the exact failure and demonstrate that the data-specific checks pass; do not suppress or rewrite unrelated application code.

## Risk controls

| Risk | Mitigation |
| --- | --- |
| Existing database is destroyed by a failed refresh | Build and validate in a same-directory temporary file; call `os.replace` only after close and success |
| Comma-formatted or negative money is loaded as text or parsed incorrectly | Parse with `Decimal`, bind canonical numeric strings to `REAL` columns, and assert cent-rounded aggregates |
| `[NULL]` and `NONE` are conflated | Central null converter plus explicit tests for SQL null counts and literal sentinel counts |
| Filename ranges are mistaken for business-date coverage | Store both filename metadata and actual observed ranges in YAML/README; default queries to the documented business date field |
| Future Codex task cannot discover or interpret the database | Add root `AGENTS.md` pointer, reporting README, full field-level YAML, and executable SQL examples |
| Semantic documentation overclaims unknown business meanings | Label status codes, currency, similar sales fields, and variance formulas as unconfirmed |
| Tests corrupt production artifacts | Require temporary input/output directories for tests and hash source files before/after |
| Existing user changes are overwritten | Inspect diffs before each shared-file edit and patch only the narrow `AGENTS.md` section |

## Completion checklist

- [ ] All six deliverables from the refined request exist at the required paths.
- [ ] Loader uses only the Python standard library and supports default and overridden paths.
- [ ] Input discovery, header validation, typing, normalization, schema, indexes, transaction handling, and atomic replacement are implemented.
- [ ] Happy-path and required failure-path tests pass without modifying inputs or the checked-in database.
- [ ] Final database contains exactly the three required user tables with 26/6/4 rows and passes all data assertions.
- [ ] Semantic layer includes every source column, required guardrails, limitations, candidate relationship, and executable examples.
- [ ] README commands are verified rather than aspirational.
- [ ] Root `AGENTS.md` contains only the intended additive discovery guidance from this task.
- [ ] `PRAGMA integrity_check`, `npm run lint`, and `npm run build` results are recorded accurately.
- [ ] Source hashes match their pre-implementation values.
- [ ] No unintended dependency, application, brand-kit, CSV, or temporary-file changes remain.

## Handoff contents

The implementation handoff should report:

- files created/modified;
- final table row counts and database integrity result;
- key normalization choices (`[NULL]`, `NONE`, monetary parsing, ISO dates);
- the exact test/build/lint commands and outcomes;
- semantic caveats: limited coverage, filename/date mismatch, unavailable last-seven-day boundary, unconfirmed currency/status/variance definitions, and candidate-only relationship;
- any check that could not be completed and the exact reason.
