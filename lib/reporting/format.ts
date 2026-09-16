const fullAmountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactAmountFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function roundToCents(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function sumMoney(values: readonly number[]) {
  const cents = values.reduce(
    (total, value) => total + Math.round((value + Number.EPSILON) * 100),
    0,
  );

  return cents / 100;
}

export function calculatePercentChange(current: number, prior: number) {
  if (prior === 0) {
    return null;
  }

  return ((current / prior) - 1) * 100;
}

export function formatAmount(value: number, zeroAsDash = true) {
  const rounded = roundToCents(value);

  if (zeroAsDash && rounded === 0) {
    return "—";
  }

  if (rounded < 0) {
    return `(${fullAmountFormatter.format(Math.abs(rounded))})`;
  }

  return fullAmountFormatter.format(rounded);
}

export function formatCompactAmount(value: number) {
  const rounded = roundToCents(value);

  if (rounded < 0) {
    return `(${compactAmountFormatter.format(Math.abs(rounded))})`;
  }

  return compactAmountFormatter.format(rounded);
}

export function formatInteger(value: number) {
  return integerFormatter.format(value);
}

export function formatAmountAccessibleLabel(value: number) {
  const rounded = roundToCents(value);
  const absoluteValue = fullAmountFormatter.format(Math.abs(rounded));

  if (rounded < 0) {
    return `Negative ${absoluteValue} source currency units`;
  }

  return `${absoluteValue} source currency units`;
}

export function formatPercentChange(value: number | null) {
  if (value === null) {
    return "—";
  }

  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(1)}%`;
}

export function formatIsoDate(isoDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

  if (!match) {
    return isoDate;
  }

  const [, year, month, day] = match;
  return `${Number(month)}/${Number(day)}/${year}`;
}

export function stripJobIdPrefix(jobId: string, jobLabel: string) {
  const prefix = `${jobId} - `;
  return jobLabel.startsWith(prefix) ? jobLabel.slice(prefix.length) : jobLabel;
}
