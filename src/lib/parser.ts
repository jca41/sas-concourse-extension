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
  domIndex: number;
};

export function parseResultsTable(
  rows: string[],
  offset: number
): Omit<ResultsTable, "test"> {
  const runFinishedIndex = rows.findIndex((r) =>
    r.startsWith("(Run Finished)")
  );

  if (runFinishedIndex === -1) {
    return { status: "running", domIndex: offset };
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
    domIndex: offset + runFinishedIndex,
  };
}

export function parseCypressTasks(
  rows: string[],
  data: ResultsTable[] = [],
  offset: number = 0
) {
  const startRegex = new RegExp(/Running:\s+([^\s\/]+)\.feature/);

  const runStartIndex = rows.findIndex((r) => startRegex.test(r));

  if (runStartIndex === -1) {
    return data;
  }

  const subRows = rows.slice(runStartIndex + 1);

  const testName = rows[runStartIndex].match(startRegex)?.[1] as string;

  const newOffset = offset + rows.length - subRows.length;

  const currentTest = {
    test: `${testName}.feature`,
    ...parseResultsTable(subRows, newOffset),
  };

  return parseCypressTasks(subRows, [...data, currentTest], newOffset);
}

export function getSorryCypressUrl(rows: string[]) {
  const row = rows.find((r) => r.includes("🎥 Run URL: "));

  if (!row) {
    return null;
  }

  const match = row.match(/https?:\/\/[^\s]+/);

  return match ? match?.[0] : null;
}

export function getPlaywrightUrl(urls: string[]) {
  const found = urls.find((url) => url.includes("playwright-report"));

  return found ? decodeURIComponent(found) : null;
}

export function isOOM(rows: string[]) {
  return rows.some((r) => r.includes("JavaScript heap out of memory"));
}

export type UploadEntry = { url: string; title: string; tags?: string[] };

function detectCypressScreenshotDevice(url: string) {
  let device: string;

  if (url.includes("mobile")) {
    return "mobile";
  } else if (url.includes("tablet")) {
    return "tablet";
  } else if (url.includes("desktop")) {
    return "desktop";
  }

  return null;
}

export function parseCypressScreenshots(urls: string[]) {
  const sections = urls.reduce((acc, url) => {
    if (
      !url.includes("/cypress/screenshots") &&
      !url.includes("/cypress/snapshots")
    ) {
      return acc;
    }

    const split = decodeURIComponent(url).split("/");

    const isCypressDiff = split.at(-2) === "__diff_output__";
    const device = detectCypressScreenshotDevice(split?.at(-1) ?? "");

    const tags = [device, isCypressDiff ? "diff" : null].filter(
      (t): t is string => Boolean(t) && typeof t === "string"
    );

    const entry: UploadEntry = {
      title: split.at(-1)?.replace(" (failed)", "") as string,
      url,
      tags,
    };

    const specName = split.at(isCypressDiff ? -3 : -2) as string;
    const section = specName;

    acc[section] = [...(acc[section] ?? []), entry];

    return acc;
  }, {} as Record<string, UploadEntry[]>);

  return Object.entries(sections);
}

export function detectPreRelease(rows: string[]) {
  const releaseRegex = /info New version: (\S+)/;

  const foundIndex = rows.findIndex((r) => releaseRegex.test(r));

  return foundIndex !== -1 ? rows[foundIndex].match(releaseRegex)?.[1] : null;
}
