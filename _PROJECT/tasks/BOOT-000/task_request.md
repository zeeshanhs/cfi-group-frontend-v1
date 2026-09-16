We have 3 CSV files available in the following folder: `_PROJECT/tasks/BOOT-000/input/`. Each CSV file is an extract of a table in the **Gold** layer of Medallion Architecture based Data-Warehouse for reporting purposes.

Report and respective date columns:

- **account_manager_summary_20260914.csv**: Usually reported using **report_period_start** & **report_period_end** for desired date range. Mostly `last week` or `Last 7 Days` extracts made.

- **job_cost_change_orders_20260907_20260913.csv**: Usually reported using desired date range on **co_date**. Mostly `last week` or `Last 7 Days` extracts made.

- **rpt_new_jobs_opened_20260907_20260913.csv**: **opened_date**. Mostly `last week` or `Last 7 Days` to full month extracts made.

## Goal:

- Load the data into a local SQL-Lite database, one table for each table data from source.
- Semantic layer in YAML that will be primarily for human and machine use. (in later stages, we will build an AI Agent that will use the semantic layer to translate user's intent into SQL queries with which the data will be retrieved and answer generated for user, e.g., "How much sale did Adam do in last week?", "What is the new jobs trend in Dallas for last one month?")
- New Codex tasks can discover the database and the tables, so that if we run a downstream task to generate HTML template for a report, the Agent would know where to access the data from, which table to pick, and what different columns mean.
