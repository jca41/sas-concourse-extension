export function parseRows(input: string) {
  return input
    .split(/\r?\n|\r|\n/g)
    .map((r) => r.slice(8).trim().replace(/\s+/g, " "));
}

function parseStringAsNumber(s: string) {
  const parsed = parseInt(s);

  return !isNaN(parsed) ? parsed : 0;
}

export type ResultsTable = {
  test?: string;
  status: "failed" | "passed" | "running";
  duration?: string;
  scenarios?: number;
  passing?: number;
  failing?: number;
  pending?: number;
  skipped?: number;
};

export function parseResultsTable(rows: string[]): Omit<ResultsTable, "test"> {
  const runFinishedIndex = rows.findIndex((r) =>
    r.startsWith("(Run Finished)")
  );

  if (runFinishedIndex === -1) {
    return { status: "running" };
  }

  const entries = rows[runFinishedIndex + 5]
    .replace(/│/g, "")
    .trim()
    .split(" ");

  return {
    status: entries[0] === "✖" ? "failed" : "passed",
    duration: entries[2],
    scenarios: parseStringAsNumber(entries[3]),
    passing: parseStringAsNumber(entries[4]),
    failing: parseStringAsNumber(entries[5]),
    pending: parseStringAsNumber(entries[6]),
    skipped: parseStringAsNumber(entries[7]),
  };
}

export function parseCypressRuns(rows: string[], data: ResultsTable[] = []) {
  const startRegex = new RegExp(/Running:\s+([^\s\/]+)\.feature/);

  const runStartIndex = rows.findIndex((r) => startRegex.test(r));

  if (runStartIndex === -1) {
    return data;
  }

  const subRows = rows.slice(runStartIndex + 1);

  const testName = rows[runStartIndex].match(startRegex)?.[1] as string;

  const currentTest = {
    test: `${testName}.feature`,
    ...parseResultsTable(subRows),
  };

  return parseCypressRuns(subRows, [...data, currentTest]);
}

export function getSorryCypressUrl(rows: string[]) {
  const row = rows.find((r) => r.includes("🎥 Run URL: "));

  if (!row) {
    return null;
  }

  const match = row.match(/https?:\/\/[^\s]+/);

  return match ? match?.[0] : null;
}

export function isOOM(rows: string[]) {
  return rows.some((r) =>
    r.includes(
      "FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory"
    )
  );
}
