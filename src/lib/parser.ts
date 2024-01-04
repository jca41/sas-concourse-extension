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

export function isOOM(rows: string[]) {
  return rows.some((r) => r.includes("JavaScript heap out of memory"));
}

export type UploadEntry = { url: string; title: string; tags?: string[] };

export function parseUploads(urls: string[]) {
  const { default: defaultSection, ...restSections } = urls.reduce(
    (acc, url) => {
      const split = decodeURIComponent(url).split("/");

      let type: "playwright" | "cypress" =
        split.at(-2) === "playwright-report" ? "playwright" : "cypress";

      let section: string;
      let entry: UploadEntry;

      switch (type) {
        case "cypress": {
          const isCypressDiff = split.at(-2) === "__diff_output__";
          const specName = split.at(isCypressDiff ? -3 : -2) as string;

          section = specName;

          let tags: string[] = [];

          if (isCypressDiff) {
            tags.push("diff");
          }

          entry = {
            title: split.at(-1)?.replace(" (failed)", "") as string,
            url,
            tags,
          };

          break;
        }
        case "playwright": {
          section = "default";
          entry = {
            url,
            title: "Playwright Report",
          };

          break;
        }
      }

      acc[section] = [...(acc[section] ?? []), entry];

      return acc;
    },
    { default: [] } as Record<"default" | (string & {}), UploadEntry[]>
  );

  return [
    ...(defaultSection.length
      ? Object.entries({ default: defaultSection })
      : []),
    ...Object.entries(restSections),
  ];
}
