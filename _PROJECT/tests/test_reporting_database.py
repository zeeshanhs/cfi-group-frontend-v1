from __future__ import annotations

import csv
import hashlib
import shutil
import sqlite3
import tempfile
import unittest
from pathlib import Path
from typing import Callable

from _PROJECT.scripts import build_reporting_database as loader


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = REPOSITORY_ROOT / "_PROJECT" / "tasks" / "BOOT-000" / "input"
SOURCE_FILES = tuple(sorted(SOURCE_DIR.glob("*.csv")))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65_536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_csv(path: Path) -> list[list[str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.reader(handle))


def write_csv(path: Path, rows: list[list[str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        csv.writer(handle).writerows(rows)


class ReportingDatabaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source_hashes = {path: sha256(path) for path in SOURCE_FILES}
        cls.temporary_directory = tempfile.TemporaryDirectory()
        cls.output_path = Path(cls.temporary_directory.name) / "reporting.sqlite"
        cls.row_counts = loader.build_database(SOURCE_DIR, cls.output_path)

    @classmethod
    def tearDownClass(cls) -> None:
        try:
            for path, expected_hash in cls.source_hashes.items():
                if sha256(path) != expected_hash:
                    raise AssertionError(f"Source CSV changed during tests: {path}")
        finally:
            cls.temporary_directory.cleanup()

    def connect(self, path: Path | None = None) -> sqlite3.Connection:
        return sqlite3.connect(path or self.output_path)

    def copy_sources(self, destination: Path) -> None:
        destination.mkdir(parents=True)
        for source in SOURCE_FILES:
            shutil.copy2(source, destination / source.name)

    def source_copy_for_prefix(self, directory: Path, prefix: str) -> Path:
        matches = list(directory.glob(f"{prefix}*.csv"))
        self.assertEqual(1, len(matches))
        return matches[0]

    def mutated_input_dir(
        self,
        prefix: str,
        mutate: Callable[[list[list[str]]], None],
    ) -> tuple[tempfile.TemporaryDirectory[str], Path]:
        temporary_directory = tempfile.TemporaryDirectory()
        input_dir = Path(temporary_directory.name) / "input"
        self.copy_sources(input_dir)
        source_path = self.source_copy_for_prefix(input_dir, prefix)
        rows = read_csv(source_path)
        mutate(rows)
        write_csv(source_path, rows)
        return temporary_directory, input_dir

    def assert_build_error(
        self,
        input_dir: Path,
        expected_fragments: tuple[str, ...],
    ) -> str:
        output_path = input_dir.parent / "output.sqlite"
        with self.assertRaises(loader.BuildError) as caught:
            loader.build_database(input_dir, output_path)
        message = str(caught.exception)
        for fragment in expected_fragments:
            self.assertIn(fragment, message)
        return message

    def test_schema_primary_keys_and_indexes(self) -> None:
        expected_columns = {
            spec.table_name: [
                (column.name, column.sqlite_type, int(not column.nullable))
                for column in spec.columns
            ]
            for spec in loader.TABLE_SPECS
        }
        expected_indexes = {
            spec.table_name: {index.name for index in spec.indexes}
            for spec in loader.TABLE_SPECS
        }

        with self.connect() as connection:
            tables = {
                row[0]
                for row in connection.execute(
                    "SELECT name FROM sqlite_master "
                    "WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
                )
            }
            self.assertEqual(set(expected_columns), tables)

            for spec in loader.TABLE_SPECS:
                table_info = connection.execute(
                    f'PRAGMA table_info("{spec.table_name}")'
                ).fetchall()
                actual_columns = [(row[1], row[2], row[3]) for row in table_info]
                self.assertEqual(expected_columns[spec.table_name], actual_columns)
                primary_key = tuple(
                    name
                    for _, name in sorted(
                        (row[5], row[1]) for row in table_info if row[5] > 0
                    )
                )
                self.assertEqual(spec.primary_key, primary_key)

                actual_indexes = {
                    row[1]
                    for row in connection.execute(
                        f'PRAGMA index_list("{spec.table_name}")'
                    )
                }
                self.assertTrue(
                    expected_indexes[spec.table_name].issubset(actual_indexes)
                )

    def test_row_counts_and_integrity(self) -> None:
        self.assertEqual(
            {
                "account_manager_summary": 26,
                "job_cost_change_orders": 6,
                "rpt_new_jobs_opened": 4,
            },
            self.row_counts,
        )
        with self.connect() as connection:
            for table_name, expected_count in self.row_counts.items():
                actual_count = connection.execute(
                    f'SELECT COUNT(*) FROM "{table_name}"'
                ).fetchone()[0]
                self.assertEqual(expected_count, actual_count)
            self.assertEqual(
                [("ok",)],
                connection.execute("PRAGMA integrity_check").fetchall(),
            )

    def test_null_and_literal_sentinel_handling(self) -> None:
        with self.connect() as connection:
            for spec in loader.TABLE_SPECS:
                for column in spec.columns:
                    if column.sqlite_type == "TEXT":
                        count = connection.execute(
                            f'SELECT COUNT(*) FROM "{spec.table_name}" '
                            f'WHERE "{column.name}" = ?',
                            ("[NULL]",),
                        ).fetchone()[0]
                        self.assertEqual(0, count)

            null_owner_count, owner_three_count = connection.execute(
                "SELECT "
                "SUM(owner_co_number IS NULL), "
                "SUM(owner_co_number = 3) "
                "FROM job_cost_change_orders"
            ).fetchone()
            self.assertEqual(5, null_owner_count)
            self.assertEqual(1, owner_three_count)

            self.assertEqual(
                1,
                connection.execute(
                    "SELECT COUNT(*) FROM account_manager_summary "
                    "WHERE project_class_id = 'NONE'"
                ).fetchone()[0],
            )
            self.assertEqual(
                1,
                connection.execute(
                    "SELECT COUNT(*) FROM rpt_new_jobs_opened WHERE sales_id = 'NONE'"
                ).fetchone()[0],
            )
            self.assertEqual(
                4,
                connection.execute(
                    "SELECT COUNT(*) FROM rpt_new_jobs_opened WHERE bd_linked = 'NONE'"
                ).fetchone()[0],
            )

    def test_normalized_date_ranges(self) -> None:
        queries = {
            "account_manager_summary.report_period_start": (
                "SELECT MIN(report_period_start), MAX(report_period_start) "
                "FROM account_manager_summary",
                ("2026-01-01", "2026-01-01"),
            ),
            "account_manager_summary.report_period_end": (
                "SELECT MIN(report_period_end), MAX(report_period_end) "
                "FROM account_manager_summary",
                ("2026-12-31", "2026-12-31"),
            ),
            "job_cost_change_orders.co_date": (
                "SELECT MIN(co_date), MAX(co_date) FROM job_cost_change_orders",
                ("2026-08-12", "2026-09-09"),
            ),
            "job_cost_change_orders.modified_on": (
                "SELECT MIN(modified_on), MAX(modified_on) FROM job_cost_change_orders",
                ("2026-09-08 07:51:00", "2026-09-09 19:48:00"),
            ),
            "rpt_new_jobs_opened.opened_date": (
                "SELECT MIN(opened_date), MAX(opened_date) FROM rpt_new_jobs_opened",
                ("2026-09-09", "2026-09-10"),
            ),
        }
        with self.connect() as connection:
            for label, (query, expected) in queries.items():
                with self.subTest(label=label):
                    self.assertEqual(expected, connection.execute(query).fetchone())

    def test_representative_aggregates_and_queries(self) -> None:
        aggregate_queries = (
            (
                "SELECT SUM(sales_last_7_days) FROM account_manager_summary",
                441_271.42,
            ),
            (
                "SELECT SUM(sales_reporting_year_ytd) FROM account_manager_summary",
                32_225_435.34,
            ),
            (
                "SELECT SUM(total_income_adj) FROM job_cost_change_orders",
                73_274.76,
            ),
            (
                "SELECT SUM(original_contract) FROM rpt_new_jobs_opened",
                188_125.00,
            ),
        )
        with self.connect() as connection:
            for query, expected in aggregate_queries:
                with self.subTest(query=query):
                    actual = connection.execute(query).fetchone()[0]
                    self.assertEqual(round(expected, 2), round(actual, 2))

            drew_sales = connection.execute(
                "SELECT sales_last_7_days FROM account_manager_summary "
                "WHERE project_class_id = 'DB'"
            ).fetchone()[0]
            self.assertEqual(95_862.50, round(drew_sales, 2))

            dallas_count, dallas_value = connection.execute(
                "SELECT COUNT(*), SUM(original_contract) "
                "FROM rpt_new_jobs_opened WHERE city = 'Dallas'"
            ).fetchone()
            self.assertEqual(3, dallas_count)
            self.assertEqual(169_000.00, round(dallas_value, 2))

    def test_rebuild_is_idempotent(self) -> None:
        with self.connect() as connection:
            before = {
                spec.table_name: connection.execute(
                    f'SELECT * FROM "{spec.table_name}" ORDER BY rowid'
                ).fetchall()
                for spec in loader.TABLE_SPECS
            }

        counts = loader.build_database(SOURCE_DIR, self.output_path)

        self.assertEqual(self.row_counts, counts)
        with self.connect() as connection:
            after = {
                spec.table_name: connection.execute(
                    f'SELECT * FROM "{spec.table_name}" ORDER BY rowid'
                ).fetchall()
                for spec in loader.TABLE_SPECS
            }
        self.assertEqual(before, after)

    def test_renamed_header_is_rejected(self) -> None:
        temporary, input_dir = self.mutated_input_dir(
            "account_manager_summary_",
            lambda rows: rows[0].__setitem__(0, "renamed_project_class_id"),
        )
        self.addCleanup(temporary.cleanup)
        self.assert_build_error(
            input_dir,
            ("account_manager_summary_20260914.csv", "unexpected CSV header"),
        )

    def test_duplicate_header_is_rejected(self) -> None:
        def add_duplicate_header(rows: list[list[str]]) -> None:
            rows[0].append(rows[0][0])
            for row in rows[1:]:
                row.append(row[0])

        temporary, input_dir = self.mutated_input_dir(
            "account_manager_summary_", add_duplicate_header
        )
        self.addCleanup(temporary.cleanup)
        self.assert_build_error(
            input_dir,
            ("account_manager_summary_20260914.csv", "duplicate CSV header"),
        )

    def test_invalid_date_is_rejected_with_context(self) -> None:
        def invalidate_date(rows: list[list[str]]) -> None:
            column_index = rows[0].index("co_date")
            rows[1][column_index] = "2026-99-99"

        temporary, input_dir = self.mutated_input_dir(
            "job_cost_change_orders_", invalidate_date
        )
        self.addCleanup(temporary.cleanup)
        self.assert_build_error(
            input_dir,
            ("job_cost_change_orders_20260907_20260913.csv", "row 2", "co_date", "invalid date"),
        )

    def test_invalid_timestamp_is_rejected_with_context(self) -> None:
        def invalidate_timestamp(rows: list[list[str]]) -> None:
            column_index = rows[0].index("modified_on")
            rows[1][column_index] = "not-a-timestamp"

        temporary, input_dir = self.mutated_input_dir(
            "job_cost_change_orders_", invalidate_timestamp
        )
        self.addCleanup(temporary.cleanup)
        self.assert_build_error(
            input_dir,
            ("job_cost_change_orders_20260907_20260913.csv", "row 2", "modified_on", "invalid timestamp"),
        )

    def test_invalid_money_is_rejected_with_context(self) -> None:
        def invalidate_money(rows: list[list[str]]) -> None:
            column_index = rows[0].index("original_contract")
            rows[1][column_index] = "not-money"

        temporary, input_dir = self.mutated_input_dir(
            "rpt_new_jobs_opened_", invalidate_money
        )
        self.addCleanup(temporary.cleanup)
        self.assert_build_error(
            input_dir,
            ("rpt_new_jobs_opened_20260907_20260913.csv", "row 2", "original_contract", "invalid monetary value"),
        )

    def test_invalid_integer_is_rejected_with_context(self) -> None:
        def invalidate_integer(rows: list[list[str]]) -> None:
            column_index = rows[0].index("co_number")
            rows[1][column_index] = "2.5"

        temporary, input_dir = self.mutated_input_dir(
            "job_cost_change_orders_", invalidate_integer
        )
        self.addCleanup(temporary.cleanup)
        self.assert_build_error(
            input_dir,
            ("job_cost_change_orders_20260907_20260913.csv", "row 2", "co_number", "invalid integer"),
        )

    def test_required_null_is_rejected_with_context(self) -> None:
        def null_required_field(rows: list[list[str]]) -> None:
            column_index = rows[0].index("city")
            rows[1][column_index] = "[NULL]"

        temporary, input_dir = self.mutated_input_dir(
            "rpt_new_jobs_opened_", null_required_field
        )
        self.addCleanup(temporary.cleanup)
        self.assert_build_error(
            input_dir,
            ("rpt_new_jobs_opened_20260907_20260913.csv", "row 2", "city", "required value is null"),
        )

    def test_missing_source_is_rejected(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        input_dir = Path(temporary.name) / "input"
        self.copy_sources(input_dir)
        missing = self.source_copy_for_prefix(input_dir, "rpt_new_jobs_opened_")
        missing.unlink()
        self.assert_build_error(input_dir, ("Missing source CSV", "rpt_new_jobs_opened_"))

    def test_ambiguous_source_is_rejected(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        input_dir = Path(temporary.name) / "input"
        self.copy_sources(input_dir)
        source = self.source_copy_for_prefix(input_dir, "account_manager_summary_")
        shutil.copy2(source, input_dir / "account_manager_summary_duplicate.csv")
        self.assert_build_error(input_dir, ("Ambiguous source CSVs", "account_manager_summary_"))

    def test_duplicate_primary_key_is_rejected(self) -> None:
        def duplicate_first_row(rows: list[list[str]]) -> None:
            rows.append(list(rows[1]))

        temporary, input_dir = self.mutated_input_dir(
            "rpt_new_jobs_opened_", duplicate_first_row
        )
        self.addCleanup(temporary.cleanup)
        self.assert_build_error(
            input_dir,
            ("Database constraint failed", "rpt_new_jobs_opened", "UNIQUE constraint"),
        )

    def test_failed_build_preserves_existing_destination(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        input_dir = root / "input"
        self.copy_sources(input_dir)
        output_path = root / "existing.sqlite"
        loader.build_database(input_dir, output_path)
        valid_hash = sha256(output_path)

        source = self.source_copy_for_prefix(input_dir, "job_cost_change_orders_")
        rows = read_csv(source)
        rows[1][rows[0].index("co_date")] = "invalid"
        write_csv(source, rows)

        with self.assertRaises(loader.BuildError):
            loader.build_database(input_dir, output_path)
        self.assertEqual(valid_hash, sha256(output_path))
        with sqlite3.connect(output_path) as connection:
            self.assertEqual(
                [("ok",)],
                connection.execute("PRAGMA integrity_check").fetchall(),
            )


if __name__ == "__main__":
    unittest.main()
