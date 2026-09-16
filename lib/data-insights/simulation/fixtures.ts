import type {
  TableCellValue,
  TableColumnDto,
} from "@/lib/data-insights/contracts";

export const FIXTURE_CLOCK = "2026-09-16T12:00:00Z";
export const FIXTURE_QUERY_TIME = "2026-09-16T12:00:04Z";
export const FIXTURE_WATERMARK = "2026-09-15T23:59:59Z";

export const TABLE_COLUMNS: TableColumnDto[] = [
  { key: "bidId", label: "Bid ID", dataType: "identifier" },
  { key: "bidTitle", label: "Bid title", dataType: "text" },
  { key: "createdAt", label: "Created at", dataType: "timestamp" },
  { key: "createdBy", label: "Created by", dataType: "text" },
  { key: "bidOwner", label: "Bid owner", dataType: "text" },
  { key: "status", label: "Status", dataType: "text" },
  { key: "wonAt", label: "Won at", dataType: "timestamp" },
  { key: "wonBy", label: "Won by", dataType: "text" },
  {
    key: "bidAmount",
    label: "Bid amount",
    dataType: "decimal",
    precision: 2,
  },
  { key: "currency", label: "Currency", dataType: "text" },
];

const people = {
  "P-01": "Casey Patel",
  "P-02": "Alex Morgan — Estimating, East",
  "P-03": "Alex Morgan — Commercial Accounts, West",
  "P-04": "Morgan Reed",
  "P-05": "Sam Rivera",
} as const;

const titles = [
  "Demo Alder Court — siding",
  "Demo Maple Court — interior painting",
  "Demo Juniper House — windows and doors",
  "Demo Willow Court — roofing",
  "Demo Cedar House — carpentry",
  "Demo Birch Court — caulking and waterproofing",
  "Demo Aspen House — tenant improvements",
  "Demo Elm Court — renovation",
] as const;

const times = [
  "16:30:00",
  "15:53:00",
  "15:16:00",
  "14:39:00",
  "14:02:00",
  "13:25:00",
  "12:48:00",
  "12:11:00",
  "11:34:00",
  "10:57:00",
] as const;

const winTimes = new Map<number, string>([
  [62, "2026-09-15T19:15:00Z"],
  [59, "2026-09-15T18:30:00Z"],
  [56, "2026-09-15T19:45:00Z"],
  [53, "2026-09-15T18:00:00Z"],
  [50, "2026-09-15T19:15:00Z"],
]);

function personCodeForId(id: number): keyof typeof people {
  if (id >= 47) return "P-01";
  if (id >= 31) return "P-02";
  if (id >= 19) return "P-03";
  if (id >= 9) return "P-04";
  return "P-05";
}

function createdAtForId(id: number): string {
  if (id === 1) return "2026-09-09T00:00:00Z";
  const offset = 64 - id;
  const day = 15 - Math.floor(offset / 10);
  const time = times[offset % 10];
  return `2026-09-${String(day).padStart(2, "0")}T${time}Z`;
}

function amountForId(id: number): string | null {
  if (id === 64) return "124500.00";
  if (id === 63) return "86750.00";
  if (id === 62) return "54000.50";
  if (id === 61) return "23500.28";
  if (id === 57) return null;
  if (id === 54) return "0.00";
  return (24875.35 + (60 - id) * 1375.07).toFixed(2);
}

function baseStatus(owner: keyof typeof people): string {
  return {
    "P-01": "Declined",
    "P-02": "Draft",
    "P-03": "Submitted",
    "P-04": "Submitted",
    "P-05": "In review",
  }[owner];
}

export function canonicalReportRows(): Record<string, TableCellValue>[] {
  return Array.from({ length: 64 }, (_, index) => {
    const id = 64 - index;
    const creator = personCodeForId(id);
    const owners = ["P-04", "P-05", "P-02", "P-01"] as const;
    const owner = owners[index % owners.length];
    const wonAt = winTimes.get(id) ?? null;
    let status = wonAt ? "Won" : baseStatus(owner);
    if (id === 64) status = "In review";
    if (id === 63) status = "Submitted";
    return {
      bidId: String(id).padStart(6, "0"),
      bidTitle: titles[index % titles.length],
      createdAt: createdAtForId(id),
      createdBy: people[creator],
      bidOwner: people[owner],
      status,
      wonAt,
      wonBy: wonAt ? people["P-01"] : null,
      bidAmount: amountForId(id),
      currency: index % 3 === 2 ? "CAD" : "USD",
    };
  });
}

export function cappedReportRows(limit = 5_000) {
  const rows = Array.from({ length: 5_237 }, (_, index) => {
    const id = `CAP-${String(index + 1).padStart(6, "0")}`;
    const createdAt = new Date(
      Date.parse("2026-08-01T00:00:00Z") + index * 60_000,
    )
      .toISOString()
      .replace(".000Z", "Z");
    return {
      bidId: id,
      bidTitle: `Demo capped bid ${id}`,
      createdAt,
      createdBy: people["P-02"],
      bidOwner: people["P-04"],
      status: "Submitted",
      wonAt: null,
      wonBy: null,
      bidAmount: "100.00",
      currency: "USD",
    } satisfies Record<string, TableCellValue>;
  });
  return rows
    .sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.bidId.localeCompare(a.bidId),
    )
    .slice(0, limit);
}

export function monthlyFixtureCounts() {
  const augustIds = Array.from(
    { length: 42 },
    (_, index) => `000${String(index + 101).padStart(3, "0")}`,
  );
  const rawAugustIds = [...augustIds, "000120"];
  const julyIds = Array.from(
    { length: 28 },
    (_, index) => `000${String(index + 201).padStart(3, "0")}`,
  );
  return {
    augustDistinct: new Set(rawAugustIds).size,
    augustRaw: rawAugustIds.length,
    julyDistinct: new Set(julyIds).size,
  };
}
