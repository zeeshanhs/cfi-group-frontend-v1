export interface DateRange {
  start: string;
  end: string;
}

export type DateRangeErrorCode =
  | "missing"
  | "invalid"
  | "repeated"
  | "reversed";

export type DateRangeResult =
  | { ok: true; range: DateRange }
  | { ok: false; code: DateRangeErrorCode; message: string };

export interface DateRangeSearchValues {
  start?: string | string[];
  end?: string | string[];
}

export const DEFAULT_WEEKLY_SALES_DATE_RANGE: Readonly<DateRange> =
  Object.freeze({
    start: "2026-09-07",
    end: "2026-09-13",
  });

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const errorMessages: Record<DateRangeErrorCode, string> = {
  missing: "Enter both a start date and an end date.",
  invalid: "Enter valid dates in YYYY-MM-DD format.",
  repeated: "Provide one start date and one end date.",
  reversed: "Start date must be on or before end date.",
};

function failure(code: DateRangeErrorCode): DateRangeResult {
  return { ok: false, code, message: errorMessages[code] };
}

function isLeapYear(year: number) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function isValidIsoDate(value: string) {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day <= daysInMonth[month - 1];
}

export function validateDateRange(start: string, end: string): DateRangeResult {
  if (!start || !end) {
    return failure("missing");
  }

  if (!isValidIsoDate(start) || !isValidIsoDate(end)) {
    return failure("invalid");
  }

  if (start > end) {
    return failure("reversed");
  }

  return { ok: true, range: { start, end } };
}

export function resolveDateRangeSearchValues(
  values: DateRangeSearchValues,
): DateRangeResult {
  if (values.start === undefined && values.end === undefined) {
    return {
      ok: true,
      range: { ...DEFAULT_WEEKLY_SALES_DATE_RANGE },
    };
  }

  if (Array.isArray(values.start) || Array.isArray(values.end)) {
    return failure("repeated");
  }

  return validateDateRange(values.start ?? "", values.end ?? "");
}

export function resolveDateRangeSearchParams(
  searchParams: URLSearchParams,
): DateRangeResult {
  const starts = searchParams.getAll("start");
  const ends = searchParams.getAll("end");

  if (starts.length === 0 && ends.length === 0) {
    return {
      ok: true,
      range: { ...DEFAULT_WEEKLY_SALES_DATE_RANGE },
    };
  }

  if (starts.length > 1 || ends.length > 1) {
    return failure("repeated");
  }

  return validateDateRange(starts[0] ?? "", ends[0] ?? "");
}

export function areDateRangesEqual(left: DateRange, right: DateRange) {
  return left.start === right.start && left.end === right.end;
}

export function createDateRangeSearchParams(range: DateRange) {
  return new URLSearchParams([
    ["start", range.start],
    ["end", range.end],
  ]);
}

export function getDateRangeFilename(range: DateRange) {
  return `cfi-weekly-sales-summary-${range.start}-to-${range.end}.pdf`;
}
