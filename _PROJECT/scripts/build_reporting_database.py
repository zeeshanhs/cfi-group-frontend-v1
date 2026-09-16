#!/usr/bin/env python3
"""Build the local CFI reporting SQLite database from the supplied CSV extracts."""

from __future__ import annotations

import argparse
import csv
import sqlite3
import sys
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Callable, Sequence


SCRIPT_PATH = Path(__file__).resolve()
REPOSITORY_ROOT = SCRIPT_PATH.parents[2]
DEFAULT_INPUT_DIR = REPOSITORY_ROOT / "_PROJECT" / "tasks" / "BOOT-000" / "input"
DEFAULT_OUTPUT_PATH = (
    REPOSITORY_ROOT / "_PROJECT" / "data" / "reporting" / "cfi_reporting.sqlite"
)


class BuildError(Exception):
    """Raised when source data or database creation fails in an expected way."""


@dataclass(frozen=True)
class ParseContext:
    source_file: Path
    row_number: int
    column_name: str

    def describe(self) -> str:
        return f"{self.source_file.name}: row {self.row_number}, column {self.column_name}"


Converter = Callable[[str, ParseContext], object | None]


@dataclass(frozen=True)
class ColumnSpec:
    name: str
    sqlite_type: str
    nullable: bool
    converter: Converter


@dataclass(frozen=True)
class IndexSpec:
    name: str
    columns: tuple[str, ...]


@dataclass(frozen=True)
class TableSpec:
    filename_prefix: str
    table_name: str
    columns: tuple[ColumnSpec, ...]
    primary_key: tuple[str, ...]
    indexes: tuple[IndexSpec, ...]

    @property
    def header(self) -> tuple[str, ...]:
        return tuple(column.name for column in self.columns)


def _null_normalized(value: str) -> str | None:
    if value.strip() == "" or value == "[NULL]":
        return None
    return value


def parse_text(value: str, _context: ParseContext) -> str | None:
    return _null_normalized(value)


def parse_integer(value: str, context: ParseContext) -> int | None:
    normalized = _null_normalized(value)
    if normalized is None:
        return None
    candidate = normalized.strip()
    digits = candidate[1:] if candidate[:1] in {"+", "-"} else candidate
    if not digits or any(character < "0" or character > "9" for character in digits):
        raise BuildError(f"{context.describe()}: invalid integer {value!r}")
    return int(candidate, 10)


def parse_money(value: str, context: ParseContext) -> str | None:
    normalized = _null_normalized(value)
    if normalized is None:
        return None
    candidate = normalized.strip().replace(",", "")
    try:
        parsed = Decimal(candidate)
    except InvalidOperation as error:
        raise BuildError(f"{context.describe()}: invalid monetary value {value!r}") from error
    if not parsed.is_finite():
        raise BuildError(f"{context.describe()}: invalid monetary value {value!r}")
    return format(parsed, "f")


def _parse_temporal(
    value: str,
    context: ParseContext,
    source_format: str,
    output_format: str,
    label: str,
) -> str | None:
    normalized = _null_normalized(value)
    if normalized is None:
        return None
    candidate = normalized.strip()
    try:
        parsed = datetime.strptime(candidate, source_format)
    except ValueError as error:
        raise BuildError(f"{context.describe()}: invalid {label} {value!r}") from error
    return parsed.strftime(output_format)


def parse_date(value: str, context: ParseContext) -> str | None:
    return _parse_temporal(value, context, "%m/%d/%Y", "%Y-%m-%d", "date")


def parse_timestamp(value: str, context: ParseContext) -> str | None:
    return _parse_temporal(
        value,
        context,
        "%m/%d/%Y %H:%M",
        "%Y-%m-%d %H:%M:%S",
        "timestamp",
    )


def column(
    name: str,
    sqlite_type: str,
    converter: Converter,
    *,
    nullable: bool = False,
) -> ColumnSpec:
    return ColumnSpec(name, sqlite_type, nullable, converter)


ACCOUNT_MANAGER_COLUMNS = (
    column("project_class_id", "TEXT", parse_text),
    column("project_class_name", "TEXT", parse_text),
    column("sort_order", "INTEGER", parse_integer, nullable=True),
    column("sales_prior_year", "REAL", parse_money),
    column("sales_current_year", "REAL", parse_money),
    column("sales_reporting_year", "REAL", parse_money),
    column("sales_last_7_days", "REAL", parse_money),
    column("sales_reporting_year_ytd", "REAL", parse_money),
    column("sales_prior_year_ytd", "REAL", parse_money),
    column("ar_outstanding", "REAL", parse_money),
    column("pending_contract", "REAL", parse_money),
    column("eoy_projected_sales", "REAL", parse_money),
    column("contract_value_closed_current", "REAL", parse_money),
    column("contract_value_closed_prior", "REAL", parse_money),
    column("var_sales_ytd_actual", "REAL", parse_money),
    column("var_sales_projected", "REAL", parse_money),
    column("report_period_start", "TEXT", parse_date),
    column("report_period_end", "TEXT", parse_date),
)

CHANGE_ORDER_COLUMNS = (
    column("job_id", "TEXT", parse_text),
    column("job_description", "TEXT", parse_text),
    column("co_number", "INTEGER", parse_integer),
    column("co_date", "TEXT", parse_date),
    column("co_status", "TEXT", parse_text),
    column("owner_co_number", "INTEGER", parse_integer, nullable=True),
    column("total_income_adj", "REAL", parse_money),
    column("modified_on", "TEXT", parse_timestamp),
)

NEW_JOB_COLUMNS = (
    column("job_id", "TEXT", parse_text),
    column("job_label", "TEXT", parse_text),
    column("customer_name", "TEXT", parse_text),
    column("sales_id", "TEXT", parse_text),
    column("original_contract", "REAL", parse_money),
    column("city", "TEXT", parse_text),
    column("state", "TEXT", parse_text),
    column("opened_date", "TEXT", parse_date),
    column("bd_linked", "TEXT", parse_text),
)

TABLE_SPECS = (
    TableSpec(
        filename_prefix="account_manager_summary_",
        table_name="account_manager_summary",
        columns=ACCOUNT_MANAGER_COLUMNS,
        primary_key=("project_class_id",),
        indexes=(
            IndexSpec(
                "idx_account_manager_summary_project_class_name",
                ("project_class_name",),
            ),
        ),
    ),
    TableSpec(
        filename_prefix="job_cost_change_orders_",
        table_name="job_cost_change_orders",
        columns=CHANGE_ORDER_COLUMNS,
        primary_key=("job_id", "co_number"),
        indexes=(
            IndexSpec("idx_job_cost_change_orders_co_date", ("co_date",)),
            IndexSpec("idx_job_cost_change_orders_modified_on", ("modified_on",)),
        ),
    ),
    TableSpec(
        filename_prefix="rpt_new_jobs_opened_",
        table_name="rpt_new_jobs_opened",
        columns=NEW_JOB_COLUMNS,
        primary_key=("job_id",),
        indexes=(
            IndexSpec("idx_rpt_new_jobs_opened_opened_date", ("opened_date",)),
            IndexSpec("idx_rpt_new_jobs_opened_sales_id", ("sales_id",)),
            IndexSpec("idx_rpt_new_jobs_opened_state_city", ("state", "city")),
        ),
    ),
)


def resolve_source_files(input_dir: Path) -> dict[str, Path]:
    if not input_dir.is_dir():
        raise BuildError(f"Input directory does not exist: {input_dir}")

    resolved: dict[str, Path] = {}
    for spec in TABLE_SPECS:
        matches = sorted(
            path
            for path in input_dir.glob(f"{spec.filename_prefix}*.csv")
            if path.is_file()
        )
        if not matches:
            raise BuildError(
                f"Missing source CSV for prefix {spec.filename_prefix!r} in {input_dir}"
            )
        if len(matches) > 1:
            names = ", ".join(path.name for path in matches)
            raise BuildError(
                f"Ambiguous source CSVs for prefix {spec.filename_prefix!r}: {names}"
            )
        resolved[spec.table_name] = matches[0]
    return resolved


def _duplicate_headers(fieldnames: Sequence[str]) -> list[str]:
    return sorted({name for name in fieldnames if fieldnames.count(name) > 1})


def _convert_row(
    row: dict[str | None, str | list[str] | None],
    spec: TableSpec,
    source_file: Path,
    row_number: int,
) -> tuple[object | None, ...]:
    if None in row:
        raise BuildError(f"{source_file.name}: row {row_number}: unexpected extra field(s)")

    converted: list[object | None] = []
    for column_spec in spec.columns:
        raw_value = row.get(column_spec.name)
        if raw_value is None or isinstance(raw_value, list):
            raise BuildError(
                f"{source_file.name}: row {row_number}, column {column_spec.name}: "
                "missing field"
            )
        context = ParseContext(source_file, row_number, column_spec.name)
        value = column_spec.converter(raw_value, context)
        if value is None and not column_spec.nullable:
            raise BuildError(f"{context.describe()}: required value is null")
        converted.append(value)
    return tuple(converted)


def read_source_rows(source_file: Path, spec: TableSpec) -> list[tuple[object | None, ...]]:
    try:
        with source_file.open(encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            if reader.fieldnames is None:
                raise BuildError(f"{source_file.name}: missing CSV header")
            duplicates = _duplicate_headers(reader.fieldnames)
            if duplicates:
                raise BuildError(
                    f"{source_file.name}: duplicate CSV header(s): {', '.join(duplicates)}"
                )
            actual_header = tuple(reader.fieldnames)
            if actual_header != spec.header:
                raise BuildError(
                    f"{source_file.name}: unexpected CSV header; "
                    f"expected {list(spec.header)!r}, got {list(actual_header)!r}"
                )
            return [
                _convert_row(row, spec, source_file, row_number)
                for row_number, row in enumerate(reader, start=2)
            ]
    except UnicodeError as error:
        raise BuildError(f"Unable to decode source CSV {source_file}: {error}") from error
    except OSError as error:
        raise BuildError(f"Unable to read source CSV {source_file}: {error}") from error


def _create_table_sql(spec: TableSpec, *, table_name: str | None = None) -> str:
    definitions: list[str] = []
    for item in spec.columns:
        nullability = "" if item.nullable else " NOT NULL"
        definitions.append(f'"{item.name}" {item.sqlite_type}{nullability}')
    primary_key = ", ".join(f'"{name}"' for name in spec.primary_key)
    definitions.append(f"PRIMARY KEY ({primary_key})")
    body = ",\n    ".join(definitions)
    resolved_name = table_name or spec.table_name
    return f'CREATE TABLE "{resolved_name}" (\n    {body}\n)'


def _create_index_sql(table_name: str, index: IndexSpec) -> str:
    columns = ", ".join(f'"{name}"' for name in index.columns)
    return f'CREATE INDEX "{index.name}" ON "{table_name}" ({columns})'


def _insert_sql(spec: TableSpec) -> str:
    column_names = ", ".join(f'"{item.name}"' for item in spec.columns)
    placeholders = ", ".join("?" for _ in spec.columns)
    return f'INSERT INTO "{spec.table_name}" ({column_names}) VALUES ({placeholders})'


def _validate_reporting_tables(
    connection: sqlite3.Connection,
    expected_counts: dict[str, int],
    table_names: dict[str, str] | None = None,
) -> None:
    resolved_names = table_names or {
        spec.table_name: spec.table_name for spec in TABLE_SPECS
    }
    actual_tables = {
        row[0]
        for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
        )
    }
    expected_tables = set(resolved_names.values())
    missing_tables = expected_tables - actual_tables
    if missing_tables:
        raise BuildError(
            f"Missing reporting table(s): {sorted(missing_tables)!r}"
        )

    for logical_name, expected_count in expected_counts.items():
        table_name = resolved_names[logical_name]
        actual_count = connection.execute(
            f'SELECT COUNT(*) FROM "{table_name}"'
        ).fetchone()[0]
        if actual_count != expected_count:
            raise BuildError(
                f"Unexpected row count for {logical_name}: "
                f"expected {expected_count}, got {actual_count}"
            )

    integrity_rows = [row[0] for row in connection.execute("PRAGMA integrity_check")]
    if integrity_rows != ["ok"]:
        raise BuildError(f"SQLite integrity check failed: {integrity_rows!r}")


def build_database(input_dir: Path, output_path: Path) -> dict[str, int]:
    input_dir = input_dir.resolve()
    output_path = output_path.resolve()
    source_files = resolve_source_files(input_dir)
    loaded_rows = {
        spec.table_name: read_source_rows(source_files[spec.table_name], spec)
        for spec in TABLE_SPECS
    }
    expected_counts = {name: len(rows) for name, rows in loaded_rows.items()}

    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
    except OSError as error:
        raise BuildError(f"Unable to create output directory {output_path.parent}: {error}") from error

    destination_existed = output_path.exists()
    build_succeeded = False
    connection: sqlite3.Connection | None = None
    try:
        connection = sqlite3.connect(output_path)
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("BEGIN IMMEDIATE")
        staging_names = {
            spec.table_name: f"__reporting_stage_{spec.table_name}"
            for spec in TABLE_SPECS
        }
        for spec in TABLE_SPECS:
            staging_name = staging_names[spec.table_name]
            connection.execute(_create_table_sql(spec, table_name=staging_name))
            try:
                insert_sql = _insert_sql(spec).replace(
                    f'INSERT INTO "{spec.table_name}"',
                    f'INSERT INTO "{staging_name}"',
                    1,
                )
                connection.executemany(insert_sql, loaded_rows[spec.table_name])
            except sqlite3.IntegrityError as error:
                raise BuildError(
                    f"Database constraint failed while loading {spec.table_name}: {error}"
                ) from error

        _validate_reporting_tables(connection, expected_counts, staging_names)

        for spec in TABLE_SPECS:
            connection.execute(f'DROP TABLE IF EXISTS "{spec.table_name}"')
            connection.execute(
                f'ALTER TABLE "{staging_names[spec.table_name]}" '
                f'RENAME TO "{spec.table_name}"'
            )
            for index in spec.indexes:
                connection.execute(_create_index_sql(spec.table_name, index))

        _validate_reporting_tables(connection, expected_counts)
        connection.commit()
        connection.close()
        connection = None
        build_succeeded = True
        return expected_counts
    except BuildError:
        if connection is not None:
            connection.rollback()
        raise
    except (OSError, sqlite3.Error) as error:
        if connection is not None:
            connection.rollback()
        raise BuildError(f"Unable to build database {output_path}: {error}") from error
    finally:
        if connection is not None:
            connection.close()
        if not build_succeeded and not destination_existed and output_path.exists():
            try:
                output_path.unlink()
            except OSError:
                pass


def parse_arguments(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build the repository-local CFI reporting SQLite database."
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=DEFAULT_INPUT_DIR,
        help=f"Directory containing the three CSV extracts (default: {DEFAULT_INPUT_DIR})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_PATH,
        help=f"SQLite database to create or replace (default: {DEFAULT_OUTPUT_PATH})",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    arguments = parse_arguments(argv)
    try:
        counts = build_database(arguments.input_dir, arguments.output)
    except BuildError as error:
        print(f"Build failed: {error}", file=sys.stderr)
        return 1

    print(f"Built reporting database: {arguments.output.resolve()}")
    for spec in TABLE_SPECS:
        print(f"  {spec.table_name}: {counts[spec.table_name]} rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
