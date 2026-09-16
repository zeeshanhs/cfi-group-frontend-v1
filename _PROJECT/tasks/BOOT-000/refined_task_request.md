# BOOT-000 — Create the local reporting database and semantic layer

## Objective

Create a reproducible, repository-local SQLite reporting database from the three supplied Gold-layer CSV extracts. Add a YAML semantic layer and concise repository guidance so future Codex tasks can discover the database, choose the correct table and date field, understand the available dimensions and measures, and query the data without reverse-engineering the CSV files.

This is a data-foundation task. Do not build a report, API, AI agent, or user interface in this task.

## Source files

Treat these files as read-only inputs:

| Source file | Logical table | Observed rows | Primary business date guidance |
| --- | --- | ---: | --- |
| `_PROJECT/tasks/BOOT-000/input/account_manager_summary_20260914.csv` | `account_manager_summary` | 26 | `report_period_start` and `report_period_end`; `sales_last_7_days` is a source-provided metric, not a value to derive by filtering these annual period columns |
| `_PROJECT/tasks/BOOT-000/input/job_cost_change_orders_20260907_20260913.csv` | `job_cost_change_orders` | 6 | `co_date` for change-order reporting; retain `modified_on` as a separate timestamp |
| `_PROJECT/tasks/BOOT-000/input/rpt_new_jobs_opened_20260907_20260913.csv` | `rpt_new_jobs_opened` | 4 | `opened_date` |

Observed source facts that must remain visible in the documentation and semantic layer:

- CSV dates use unpadded US formats such as `9/9/2026`; `modified_on` also contains hours and minutes.
- Numeric and monetary values may contain commas and decimal points and may be negative.
- `[NULL]` is the explicit source null marker. Convert it to SQL `NULL`.
- `NONE` is a literal source value/category. Do not convert it to SQL `NULL`.
- The change-order filename has the nominal range `2026-09-07` through `2026-09-13`, but the actual `co_date` values span `2026-08-12` through `2026-09-09`. Its `modified_on` values span `2026-09-08 07:51` through `2026-09-09 19:48`. Do not infer business-date coverage from the filename.
- The account-manager extract uses `report_period_start = 2026-01-01` and `report_period_end = 2026-12-31` for every current row. The filename indicates a `2026-09-14` snapshot, but the exact start and end of the source-provided “last 7 days” measure are not present in the CSV.
- The new-jobs rows currently span `opened_date` values from `2026-09-09` through `2026-09-10`. This extract cannot support a full-month trend by itself.

Do not alter, rename, relocate, or rewrite the input CSV files.

## Required deliverables

Create these repository artifacts:

1. `_PROJECT/data/reporting/cfi_reporting.sqlite`
   - Generated SQLite database containing the three typed reporting tables defined below.
   - This is a repository-local data artifact for downstream tasks; do not add a rule that ignores it.
2. `_PROJECT/data/reporting/semantic_layer.yaml`
   - Human- and machine-readable semantic description of the database, tables, fields, measures, relationships, date behavior, coverage, sentinels, limitations, and example query mappings.
3. `_PROJECT/data/reporting/README.md`
   - Short discovery and operations guide: database purpose and path, source paths, table-selection guidance, build command, test command, direct `sqlite3` examples, refresh behavior, and known limitations.
4. `_PROJECT/scripts/build_reporting_database.py`
   - Deterministic command-line loader implemented with the Python 3 standard library (`csv`, `sqlite3`, `decimal`, `datetime`, and related standard modules). Do not add a runtime package solely for CSV or SQLite handling.
5. `_PROJECT/tests/test_reporting_database.py`
   - Focused `unittest` coverage for parsing, type normalization, null/sentinel behavior, schema, row counts, representative aggregates, repeat builds, and failure safety. Tests must build only into a temporary directory and must not mutate the checked-in database or source CSVs.
6. A concise `Local reporting data` section in the root `AGENTS.md`.
   - Point future Codex sessions to the database, semantic layer, README, loader, and source directory.
   - State that the semantic layer is the first reference for table/date selection and that coverage limitations must be disclosed in downstream reports.
   - Preserve all existing `AGENTS.md` content, including the generated Next.js block and repository guidance.

Create missing parent directories as needed. Keep all data-foundation artifacts under `_PROJECT/`; do not place data-loading logic in the Next.js `app/` tree.

## Loader interface and behavior

The following command, run from the repository root, must build the documented output by default:

```bash
python3 _PROJECT/scripts/build_reporting_database.py
```

Also support explicit overrides so tests and later refreshes can use temporary locations:

```bash
python3 _PROJECT/scripts/build_reporting_database.py \
  --input-dir <directory> \
  --output <database-file>
```

The defaults must be:

- `--input-dir _PROJECT/tasks/BOOT-000/input`
- `--output _PROJECT/data/reporting/cfi_reporting.sqlite`

Implementation requirements:

- Resolve defaults relative to the repository/script location, not the caller's current working directory.
- Map input files by these filename prefixes: `account_manager_summary_`, `job_cost_change_orders_`, and `rpt_new_jobs_opened_`.
- Require exactly one CSV for each prefix in the selected input directory. Fail with a clear message if a source is missing or ambiguous.
- Validate each header against the expected ordered column list before loading. Fail rather than silently accepting missing, renamed, duplicate, or unexpected columns.
- Parse CSV with a standards-compliant parser; do not split rows manually on commas.
- Trim neither meaningful free text nor identifiers indiscriminately. Treat an empty/whitespace-only field and the exact marker `[NULL]` as SQL `NULL`; preserve the literal `NONE`.
- Remove thousands separators before converting monetary values. Parse through `Decimal` or an equivalently exact intermediate, then bind normalized numeric values to SQLite. Do not parse money through binary floating point first.
- Normalize dates to ISO `YYYY-MM-DD` text and timestamps to `YYYY-MM-DD HH:MM:SS` text in SQLite. Reject invalid or unparseable non-null dates.
- Reject invalid non-null integers or monetary values and identify the source file, CSV row, column, and bad value in the error.
- Load all three tables in a transaction into a temporary database in the destination directory. Replace the destination only after the full build and validation succeed. A failed build must leave an existing valid destination untouched and remove its temporary file.
- Rebuilding with unchanged inputs must be idempotent: no duplicate rows and the same logical schema and query results.
- Close database/file handles reliably on success and failure.
- Print a compact successful-build summary containing the output path and row count per table. Do not print entire source rows or duplicate the business data into logs.

## SQLite schema

Create exactly these three user data tables. SQLite internal tables do not count. Use the listed names, nullability, and types; use `PRIMARY KEY`/`UNIQUE` constraints where specified.

### `account_manager_summary`

Grain: one row per `project_class_id` in the supplied account-manager snapshot.

| Column | SQLite type | Nullability / constraint |
| --- | --- | --- |
| `project_class_id` | `TEXT` | `NOT NULL PRIMARY KEY` |
| `project_class_name` | `TEXT` | `NOT NULL` |
| `sort_order` | `INTEGER` | nullable |
| `sales_prior_year` | `REAL` | `NOT NULL` |
| `sales_current_year` | `REAL` | `NOT NULL` |
| `sales_reporting_year` | `REAL` | `NOT NULL` |
| `sales_last_7_days` | `REAL` | `NOT NULL` |
| `sales_reporting_year_ytd` | `REAL` | `NOT NULL` |
| `sales_prior_year_ytd` | `REAL` | `NOT NULL` |
| `ar_outstanding` | `REAL` | `NOT NULL` |
| `pending_contract` | `REAL` | `NOT NULL` |
| `eoy_projected_sales` | `REAL` | `NOT NULL` |
| `contract_value_closed_current` | `REAL` | `NOT NULL` |
| `contract_value_closed_prior` | `REAL` | `NOT NULL` |
| `var_sales_ytd_actual` | `REAL` | `NOT NULL` |
| `var_sales_projected` | `REAL` | `NOT NULL` |
| `report_period_start` | `TEXT` | `NOT NULL`, ISO date |
| `report_period_end` | `TEXT` | `NOT NULL`, ISO date |

Add an index on `project_class_name` if it is not already covered by a constraint.

### `job_cost_change_orders`

Grain: one row per job/change-order pair in the supplied extract.

| Column | SQLite type | Nullability / constraint |
| --- | --- | --- |
| `job_id` | `TEXT` | `NOT NULL` |
| `job_description` | `TEXT` | `NOT NULL` |
| `co_number` | `INTEGER` | `NOT NULL` |
| `co_date` | `TEXT` | `NOT NULL`, ISO date |
| `co_status` | `TEXT` | `NOT NULL` |
| `owner_co_number` | `INTEGER` | nullable |
| `total_income_adj` | `REAL` | `NOT NULL` |
| `modified_on` | `TEXT` | `NOT NULL`, ISO timestamp |

Use `PRIMARY KEY (job_id, co_number)`. Add indexes on `co_date` and `modified_on`.

### `rpt_new_jobs_opened`

Grain: one row per newly opened job in the supplied extract.

| Column | SQLite type | Nullability / constraint |
| --- | --- | --- |
| `job_id` | `TEXT` | `NOT NULL PRIMARY KEY` |
| `job_label` | `TEXT` | `NOT NULL` |
| `customer_name` | `TEXT` | `NOT NULL` |
| `sales_id` | `TEXT` | `NOT NULL` |
| `original_contract` | `REAL` | `NOT NULL` |
| `city` | `TEXT` | `NOT NULL` |
| `state` | `TEXT` | `NOT NULL` |
| `opened_date` | `TEXT` | `NOT NULL`, ISO date |
| `bd_linked` | `TEXT` | `NOT NULL` |

Add indexes on `opened_date`, `sales_id`, and `(state, city)`.

Identifiers such as `job_id`, `project_class_id`, and `sales_id` are text, even when all current `job_id` values contain only digits. Do not add ingestion/audit columns to the three business tables in this initial task; record source filenames and observed coverage in the semantic layer instead.

## Semantic layer contract

`semantic_layer.yaml` must be valid YAML encoded as UTF-8 and must not rely on YAML-only executable tags. Use a stable top-level structure with at least:

- `version`
- `name`
- `description`
- `database` (`dialect`, repository-relative `path`, `generated_by`)
- `sources` (repository-relative file, logical table, record count, filename-indicated period/snapshot where applicable, and actual observed date range)
- `null_handling` (including the distinction between `[NULL]` and `NONE`)
- `tables`
- `relationships`
- `query_guidance`
- `known_limitations`
- `examples`

For each table, include:

- description and row grain;
- primary key;
- source file/prefix;
- appropriate default time dimension and other available time fields;
- every column's physical type, nullability, semantic role (`identifier`, `dimension`, `time_dimension`, or `measure`), plain-language description, and units/format when relevant;
- useful dimensions and additive measures;
- aliases/synonyms that help map user terms such as “account manager,” “salesperson,” “sales,” “change order,” “new job,” “contract value,” and “last week” to fields;
- caveats for ambiguous source terminology.

Semantic rules and guardrails:

- Map account-manager names to `project_class_name` and account-manager codes to `project_class_id`.
- Describe `sales_last_7_days` as a pre-aggregated source measure. For questions phrased as “last week” or “last 7 days,” use this measure only when the answer is explicitly tied to this extract/snapshot and disclose that the exact seven-day boundary is unavailable.
- For change-order date filtering, prefer `co_date` as requested by the business source. Keep `modified_on` available for questions explicitly about modification/import activity. Never substitute one silently for the other.
- For new-job trends and period filters, use `opened_date`.
- Treat monetary measures as USD only if the task's business context is documented as USD in the semantic layer; otherwise label the unit `currency (source currency not explicitly confirmed)`. Do not invent a currency code.
- Represent `rpt_new_jobs_opened.sales_id -> account_manager_summary.project_class_id` as a candidate many-to-one semantic relationship verified against the current extract, not as an enforced SQLite foreign key or a guaranteed enterprise master-data relationship. Note that `NONE` is present and matches the current `project_class_id = 'NONE'` row.
- Do not expand the observed `co_status = 'A'` code or `bd_linked` values into business meanings that are not in the source request. Mark their definitions as requiring business confirmation.
- Do not claim that similarly named sales fields are interchangeable. In particular, document that the business distinction among `sales_current_year`, `sales_reporting_year`, and `sales_reporting_year_ytd` is not supplied, even though their values happen to match in this extract.
- Describe `var_sales_ytd_actual` and `var_sales_projected` as source-provided measures; do not assert an official formula without a confirmed definition.
- State clearly that this is snapshot/extract data, not a live warehouse connection, and that answers cannot extend beyond the rows and dates loaded.

Include at least three example question mappings with readable SQLite SQL:

1. account manager “sales last week/last 7 days” by name;
2. change-order amount for an explicit `co_date` range;
3. count and contract-value trend for newly opened jobs by city and `opened_date`.

Examples must demonstrate ISO date predicates, case-insensitive name/city matching where relevant, and coverage disclosure. Do not hard-code an answer that implies unavailable data is complete.

## README and discoverability requirements

The reporting README must let a new Codex session succeed without reading the loader source. Include:

- what the database is and is not;
- exact repository-relative paths to the database, semantic layer, loader, tests, and inputs;
- the three tables, their grain, and the correct date field for each use case;
- build and test commands from the repository root;
- a `sqlite3` command to list tables and at least one safe read-only example query per table;
- refresh instructions explaining the exactly-one-file-per-prefix rule and atomic replacement behavior;
- current observed coverage and the filename-versus-`co_date` discrepancy;
- a warning not to present the extracts as live, exhaustive, or current beyond their recorded coverage;
- an instruction to consult `semantic_layer.yaml` before generating SQL or reports.

Keep the root `AGENTS.md` addition compact and point to this README instead of duplicating the full schema there.

## Automated tests and acceptance criteria

The task is complete only when all of the following are true.

### Build and schema

- The default loader command succeeds from the repository root and creates `_PROJECT/data/reporting/cfi_reporting.sqlite`.
- `PRAGMA integrity_check;` returns `ok`.
- The database contains the three required user tables and no accidental staging/user tables.
- `PRAGMA table_info(...)`, index inspection, and primary-key inspection match the required schema.
- The semantic YAML exists, is non-empty, contains every table and source column, and is parseable by a real YAML parser available to the validation environment. If no YAML parser is already available, use a one-off non-production validation method; do not add an application runtime dependency solely for this check.

### Loaded data

- Row counts are exactly:
  - `account_manager_summary`: 26
  - `job_cost_change_orders`: 6
  - `rpt_new_jobs_opened`: 4
- No loaded text value is the literal `[NULL]`.
- `job_cost_change_orders.owner_co_number` has 5 SQL `NULL` values and one value of `3`.
- Literal `NONE` values remain present, including `account_manager_summary.project_class_id = 'NONE'`, one `rpt_new_jobs_opened.sales_id = 'NONE'`, and four `rpt_new_jobs_opened.bd_linked = 'NONE'` rows.
- Normalized date ranges are:
  - `account_manager_summary.report_period_start`: `2026-01-01` to `2026-01-01`
  - `account_manager_summary.report_period_end`: `2026-12-31` to `2026-12-31`
  - `job_cost_change_orders.co_date`: `2026-08-12` to `2026-09-09`
  - `job_cost_change_orders.modified_on`: `2026-09-08 07:51:00` to `2026-09-09 19:48:00`
  - `rpt_new_jobs_opened.opened_date`: `2026-09-09` to `2026-09-10`
- Representative aggregates match to the cent:
  - total `account_manager_summary.sales_last_7_days`: `441271.42`
  - total `account_manager_summary.sales_reporting_year_ytd`: `32225435.34`
  - total `job_cost_change_orders.total_income_adj`: `73274.76`
  - total `rpt_new_jobs_opened.original_contract`: `188125.00`
- Representative semantic queries return:
  - Drew Bell (`project_class_id = 'DB'`) `sales_last_7_days = 95862.50`;
  - Dallas has 3 loaded new jobs totaling `169000.00` in `original_contract`.

Use cent-tolerant assertions for SQLite `REAL` aggregates (for example, round to two decimal places); do not require exact binary floating-point equality.

### Reliability and regression checks

- Running the loader twice does not change row counts or create duplicates.
- Tests cover at least one malformed header, malformed date, malformed monetary value, missing input file, and ambiguous prefix match.
- A deliberately failed test build does not replace a previously valid destination database.
- Source CSVs are byte-for-byte unchanged after build and test execution.
- No network access, external database, credentials, or warehouse connection is required.
- No Next.js page, component, route, stylesheet, or visible copy is changed.

Run and report the actual results of:

```bash
python3 -m unittest _PROJECT.tests.test_reporting_database
python3 _PROJECT/scripts/build_reporting_database.py
sqlite3 _PROJECT/data/reporting/cfi_reporting.sqlite "PRAGMA integrity_check;"
npm run lint
npm run build
```

If Python package-style unittest discovery is not possible because `_PROJECT` is not a package, use an equivalent documented `unittest discover` command and place that exact working command in the README.

## Out of scope

- Connecting to the source warehouse or scheduling refreshes.
- Accepting arbitrary user questions or translating natural language into SQL.
- Building an API, report template, dashboard, or other UI.
- Adding authentication, authorization, or multi-user access.
- Inventing business definitions, status-code expansions, currencies, fiscal-calendar rules, or data beyond the supplied extracts.
- Redesigning the repository's application or brand experience.

## Implementation constraints

- Follow the root `AGENTS.md` and preserve unrelated working-tree changes.
- Keep the source CSVs and their values unchanged.
- Prefer the smallest dependency-free implementation described above. Do not introduce an ORM, dataframe library, database server, migration framework, application state library, or test runner.
- Make error messages actionable without dumping full sensitive rows.
- Keep repository-relative paths in committed documentation and YAML so the project remains portable.
- Document observed facts separately from inferred/candidate semantics. Where the source request does not define a business meaning, say so rather than guessing.

## Handoff

Summarize the created artifacts, table row counts, normalization decisions, semantic caveats, and validation commands/results. Explicitly call out the unresolved business definitions and the limited date coverage so a downstream reporting task does not overstate what the local extracts can answer.
