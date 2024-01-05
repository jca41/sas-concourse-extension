import { describe, expect, it } from "vitest";
import FUNCTIONAL_FAIL_1 from "./test-data/functional-fail-1.txt?raw";
import FUNCTIONAL_FAIL_2 from "./test-data/functional-fail-2.txt?raw";
import FUNCTIONAL_OOM from "./test-data/functional-oom.txt?raw";
import {
  parseRows,
  parseResultsTable,
  getSorryCypressUrl,
  isOOM,
  parseCypressTasks,
} from "./parser";

const FUNCTIONAL_FAIL_1_ROWS = parseRows(FUNCTIONAL_FAIL_1);
const FUNCTIONAL_FAIL_2_ROWS = parseRows(FUNCTIONAL_FAIL_2);
const FUNCTIONAL_OOM_ROWS = parseRows(FUNCTIONAL_OOM);

describe("CMD parser", () => {
  describe("parseRows", () => {
    it("should split by line break", () => {
      expect(FUNCTIONAL_FAIL_1_ROWS).toHaveLength(355);
    });

    it("should remove start timestamp and extra spaces", () => {
      expect(
        FUNCTIONAL_FAIL_1_ROWS[0].startsWith("selected worker")
      ).toBeTruthy();
    });
  });

  describe("parseCypressTasks", () => {
    it("should extract test tasks", () => {
      expect(parseCypressTasks(FUNCTIONAL_FAIL_1_ROWS)).toMatchInlineSnapshot(`
        [
          {
            "domIndex": 273,
            "duration": "03:19",
            "failing": 2,
            "passing": 2,
            "pending": 2,
            "scenarios": 6,
            "skipped": 0,
            "status": "failed",
            "test": "paypal.feature",
          },
        ]
      `);

      expect(parseCypressTasks(FUNCTIONAL_FAIL_2_ROWS)).toMatchInlineSnapshot(`
        [
          {
            "domIndex": 272,
            "duration": "05:22",
            "failing": 2,
            "passing": 20,
            "pending": 0,
            "scenarios": 22,
            "skipped": 0,
            "status": "failed",
            "test": "d2c-partial-customers.feature",
          },
          {
            "domIndex": 353,
            "duration": "00:36",
            "failing": 0,
            "passing": 9,
            "pending": 0,
            "scenarios": 9,
            "skipped": 0,
            "status": "passed",
            "test": "device-activation-otp.feature",
          },
          {
            "domIndex": 420,
            "duration": "00:12",
            "failing": 0,
            "passing": 2,
            "pending": 2,
            "scenarios": 4,
            "skipped": 0,
            "status": "passed",
            "test": "elevated-security-already-enrolled.feature",
          },
          {
            "domIndex": 516,
            "duration": "01:33",
            "failing": 0,
            "passing": 18,
            "pending": 0,
            "scenarios": 18,
            "skipped": 0,
            "status": "passed",
            "test": "flex-form-ssr.feature",
          },
          {
            "domIndex": 592,
            "duration": "01:25",
            "failing": 0,
            "passing": 14,
            "pending": 0,
            "scenarios": 14,
            "skipped": 0,
            "status": "passed",
            "test": "forgotten-password.feature",
          },
          {
            "domIndex": 682,
            "duration": "00:54",
            "failing": 1,
            "passing": 2,
            "pending": 0,
            "scenarios": 3,
            "skipped": 0,
            "status": "failed",
            "test": "mvpd-rtp.feature",
          },
          {
            "domIndex": 756,
            "duration": "00:17",
            "failing": 0,
            "passing": 2,
            "pending": 0,
            "scenarios": 2,
            "skipped": 0,
            "status": "passed",
            "test": "prospect-email-sign-up.feature",
          },
          {
            "domIndex": 828,
            "duration": "00:45",
            "failing": 0,
            "passing": 10,
            "pending": 0,
            "scenarios": 10,
            "skipped": 0,
            "status": "passed",
            "test": "reset-password-via-query.feature",
          },
          {
            "domIndex": 894,
            "duration": "00:56",
            "failing": 0,
            "passing": 4,
            "pending": 0,
            "scenarios": 4,
            "skipped": 0,
            "status": "passed",
            "test": "resilience-ssr.feature",
          },
          {
            "domIndex": 1174,
            "duration": "05:11",
            "failing": 1,
            "passing": 15,
            "pending": 16,
            "scenarios": 34,
            "skipped": 2,
            "status": "failed",
            "test": "threed-secure.feature",
          },
        ]
      `);
    });
  });

  describe("getSorryCypressUrl", () => {
    it("should extract sorry cypress URL", () => {
      expect(getSorryCypressUrl(FUNCTIONAL_FAIL_1_ROWS)).toEqual(
        "https://sorry-cypress-dashboard.tools.cosmic.sky/run/2be6fc32672a8a1d62408f7f7c74930b"
      );
    });

    it("should return null if not found", () => {
      expect(getSorryCypressUrl([])).toBeNull();
    });
  });

  describe("isOOM", () => {
    it("should return true if contains OOM string", () => {
      expect(isOOM(FUNCTIONAL_OOM_ROWS)).toBe(true);
    });
  });

  //   describe("findFeatureTestIndex", () => {
  //     it("should return index for test name", () => {
  //       expect(
  //         findFeatureTestIndex(parseRows(FUNCTIONAL_FAILING), "paypal.feature")
  //       ).toEqual(4);
  //     });
  //   });
});
