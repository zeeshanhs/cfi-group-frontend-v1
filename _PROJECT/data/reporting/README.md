# Local reporting data

This directory contains a repository-local SQLite database built from the three supplied Gold-layer CSV reporting extracts. It is intended for local analysis and downstream report-generation tasks. It is a static snapshot, not a live warehouse connection, and it must not be described as exhaustive or current beyond the recorded source coverage.

Consult [`semantic_layer.yaml`](semantic_layer.yaml) before selecting a table, writing SQL, or presenting results. It contains field-level meanings, aliases, date rules, coverage, candidate relationships, example SQL, and known business-definition gaps.

## Artifacts

| Purpose | Repository-relative path |
| --- | --- |
| SQLite database | `_PROJECT/data/reporting/cfi_reporting.sqlite` |
| Semantic layer | `_PROJECT/data/reporting/semantic_layer.yaml` |
| Database loader | `_PROJECT/scripts/build_reporting_database.py` |
| Loader tests | `_PROJECT/tests/test_reporting_database.py` |
| Source inputs | `_PROJECT/tasks/BOOT-000/input/` |

## Choosing a table

| Question type | Table | Grain | Preferred date field |
| --- | --- | --- | --- |
| Account-manager sales, receivables, projections, or source-provided last-seven-days values | `account_manager_summary` | One row per `project_class_id` in the supplied snapshot | `report_period_start` and `report_period_end` provide report context; they do not define the exact `sales_last_7_days` window |
| Change-order counts or income adjustments | `job_cost_change_orders` | One row per `job_id`, `co_number` pair | `co_date`; use `modified_on` only for explicit modification-time questions |
| Newly opened job counts, locations, customers, or original contract values | `rpt_new_jobs_opened` | One row per `job_id` | `opened_date` |

The candidate semantic link `rpt_new_jobs_opened.sales_id -> account_manager_summary.project_class_id` matches the current data, including the literal `NONE` category, but is not enforced as a foreign key or guaranteed as an enterprise relationship.

## Build and test

Run from the repository root:

```bash
python3 -m unittest _PROJECT.tests.test_reporting_database
python3 _PROJECT/scripts/build_reporting_database.py
```

The default build reads `_PROJECT/tasks/BOOT-000/input/` and atomically creates or replaces `_PROJECT/data/reporting/cfi_reporting.sqlite`.

To build from another directory or write to a temporary database:

```bash
python3 _PROJECT/scripts/build_reporting_database.py \
  --input-dir /absolute/path/to/input-directory \
  --output /absolute/path/to/reporting.sqlite
```

The selected input directory must contain exactly one `.csv` file for each prefix:

- `account_manager_summary_`
- `job_cost_change_orders_`
- `rpt_new_jobs_opened_`

The loader validates exact ordered headers, parses and normalizes every field, creates all three tables in a temporary database, checks row counts and SQLite integrity, closes the database, and only then replaces the destination. If parsing, constraints, validation, or publication fails, a pre-existing valid destination is left unchanged.

For a future refresh, place one new extract for each prefix in a separate input directory and use `--input-dir`. Do not add a second matching file to the default input directory. The loader rebuilds a complete snapshot; it does not append history.

## Query with sqlite3

Open the database read-only:

```bash
sqlite3 -readonly _PROJECT/data/reporting/cfi_reporting.sqlite
```

List its user tables:

```bash
sqlite3 -readonly _PROJECT/data/reporting/cfi_reporting.sqlite ".tables"
```

Account-manager example:

```bash
sqlite3 -readonly -header -column \
  _PROJECT/data/reporting/cfi_reporting.sqlite \
  "SELECT project_class_id, project_class_name, sales_last_7_days FROM account_manager_summary ORDER BY project_class_name;"
```

Change-order example using the business date:

```bash
sqlite3 -readonly -header -column \
  _PROJECT/data/reporting/cfi_reporting.sqlite \
  "SELECT co_date, COUNT(*) AS change_orders, ROUND(SUM(total_income_adj), 2) AS amount FROM job_cost_change_orders WHERE co_date BETWEEN '2026-08-01' AND '2026-09-30' GROUP BY co_date ORDER BY co_date;"
```

New-jobs example:

```bash
sqlite3 -readonly -header -column \
  _PROJECT/data/reporting/cfi_reporting.sqlite \
  "SELECT opened_date, city, COUNT(*) AS jobs, ROUND(SUM(original_contract), 2) AS contract_value FROM rpt_new_jobs_opened GROUP BY opened_date, city ORDER BY opened_date, city;"
```

Check database integrity:

```bash
sqlite3 -readonly _PROJECT/data/reporting/cfi_reporting.sqlite "PRAGMA integrity_check;"
```

## Current coverage

| Table/field | Loaded coverage |
| --- | --- |
| `account_manager_summary.report_period_start` | `2026-01-01` |
| `account_manager_summary.report_period_end` | `2026-12-31` |
| Account-manager filename snapshot | `2026-09-14` |
| `job_cost_change_orders.co_date` | `2026-08-12` through `2026-09-09` |
| `job_cost_change_orders.modified_on` | `2026-09-08 07:51:00` through `2026-09-09 19:48:00` |
| `rpt_new_jobs_opened.opened_date` | `2026-09-09` through `2026-09-10` |

The change-order filename says `2026-09-07` through `2026-09-13`, but that is not its actual `co_date` coverage. Never substitute the filename range for a `co_date` filter.

The four new-job rows contain only two opened dates, so this extract cannot establish a complete weekly or monthly trend. For any wider requested period, report that the result is partial.

## Normalization and limitations

- `[NULL]` and empty/whitespace-only fields become SQL `NULL`.
- `NONE` remains a literal category and must not be treated as missing data.
- Dates are stored as ISO `YYYY-MM-DD` text; `modified_on` is stored as `YYYY-MM-DD HH:MM:SS` text with no source timezone.
- Monetary values are stored in SQLite `REAL` columns after exact decimal parsing. Round displayed aggregates to two decimal places.
- The source currency is not explicitly confirmed; do not label amounts as USD without separate evidence.
- `sales_last_7_days` is supplied as a pre-aggregated value. The exact seven-day boundary is absent, so tie answers to this extract/snapshot and disclose that limitation.
- Meanings for change-order status `A`, `bd_linked`, fiscal/calendar rules, similarly named sales fields, and variance formulas are not confirmed.
- There is no snapshot key in the business tables. Do not append multiple extracts into this schema.
- Do not hand-edit the SQLite file. Change the loader when needed and rebuild it.
