import { get } from "svelte/store";
import { tabIdStore } from "./stores";
import { parseRows } from "./parser";
import type { BuildStep } from "./types";
import { PPTS, type PPT } from "./utils";

export async function executeScript<F extends (...args: any[]) => any>(
  func: F,
  ...args: Parameters<F>
): Promise<ReturnType<F>> {
  const tabId = get(tabIdStore);

  if (!tabId) throw new Error("tabId missing");

  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func,
        args,
      },
      (res) => {
        return resolve(res?.[0].result as ReturnType<F>);
      }
    );
  });
}

export async function identityBuildStep(): Promise<BuildStep | null> {
  return executeScript(() => {
    const stepName = document.querySelector(".build-name")?.textContent ?? null;

    if (!stepName) {
      return null;
    }

    const STATIC_STEPS: BuildStep[] = [
      "functionals",
      "visual-regression",
      "deployment",
    ];

    if (STATIC_STEPS.includes(stepName as BuildStep)) {
      return stepName as BuildStep;
    }

    if (stepName.endsWith("-e2e")) {
      return "e2e";
    }

    return null;
  });
}

export async function identityPPT(): Promise<PPT | null> {
  return executeScript(() => {
    const stepName = document.querySelector(".build-name")?.textContent ?? null;

    if (!stepName) {
      return null;
    }

    const match = stepName.match(/^(peacock|skyshowtime|showmax)-(.+)$/);

    return match ? (match[1] as PPT) : null;
  });
}

export async function getTasksByType(type: BuildStep) {
  const STATIC_TYPE_TO_STEP: Partial<Record<BuildStep, string>> = {
    functionals: "functional",
    e2e: "e2e-tests",
    deployment: "npm-publish-prerelease",
  };

  let stepKey = STATIC_TYPE_TO_STEP?.[type] ?? type;

  const data = await executeScript(async (_type: string) => {
    const els = document.querySelectorAll<HTMLDivElement>(
      `[data-step-name|="${_type}"]`
    );

    if (!els.length) return [];

    return Promise.all(
      Array.from(els).map(async (el) => {
        if (!el.querySelector(".step-body")) {
          el.querySelector<HTMLButtonElement>(".header")?.click?.();
        }

        const activeWebStaticUploadEl =
          el.parentElement?.parentElement?.querySelector?.(
            '.children  [data-step-name="web-static-upload"]:not(.inactive)'
          );

        if (
          activeWebStaticUploadEl &&
          !activeWebStaticUploadEl.querySelector(".step-body")
        ) {
          activeWebStaticUploadEl
            .querySelector<HTMLButtonElement>(".header")
            ?.click?.();
        }

        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 200);
        });

        // NOTE: parsing web-static-upload table
        const webStaticUploads = Array.from(
          activeWebStaticUploadEl
            ?.querySelectorAll?.(".step-body table a")
            .values?.() ?? []
        ).map((el) => (el as HTMLAnchorElement).href);

        const statusDiv = el.querySelector<HTMLDivElement>(
          ".header > *:last-child > *"
        );

        return {
          title: el.dataset.stepName as string,
          status: statusDiv?.dataset.stepState ?? "running",
          body: el.querySelector(".step-body")?.textContent as string,
          webStaticUploads,
        };
      })
    );
  }, stepKey);

  return data.map((step) => {
    return {
      ...step,
      body: parseRows(step.body),
    };
  });
}

export type TaskData = Awaited<ReturnType<typeof getTasksByType>>;

export async function scrollToTimestamp(
  timestampIndex: number,
  taskId: string
) {
  return executeScript(
    (index: number, id: string) => {
      const els = document.querySelectorAll<HTMLTableRowElement>(
        `[data-step-name="${id}"] .timestamped-line`
      );

      const target = els[index];

      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    timestampIndex,
    taskId
  );
}
