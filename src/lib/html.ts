import { get } from "svelte/store";
import { tabIdStore } from "./stores";
import { parseRows } from "./parser";

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

export type BuildStep = "functionals" | "visual-regression";

export async function identityBuildStep(): Promise<BuildStep | null> {
  return executeScript(() => {
    const STEPS: BuildStep[] = ["functionals", "visual-regression"];

    const stepName = document.querySelector(".build-name")?.textContent;

    if (!stepName) {
      return null;
    }

    return STEPS.includes(stepName as BuildStep)
      ? (stepName as BuildStep)
      : null;
  });
}

export async function getTasksByType(type: BuildStep) {
  const TYPE_TO_STEP: Record<BuildStep, string> = {
    functionals: "functional",
    "visual-regression": "visual-regression",
  };
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

        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 200);
        });

        const statusDiv = el.querySelector<HTMLDivElement>(
          ".header > *:last-child > *"
        );

        return {
          title: el.dataset.stepName as string,
          status: statusDiv?.dataset.stepState ?? "running",
          body: el.querySelector(".step-body")?.textContent as string,
        };
      })
    );
  }, TYPE_TO_STEP[type]);

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
