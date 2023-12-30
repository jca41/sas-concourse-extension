import type { BuildStep } from "./types";

export const PPTS = ["peacock", "skyshowtime", "showmax"] as const;
export type PPT = (typeof PPTS)[number];

const CYPRESS_STEPS: BuildStep[] = ["functionals", "visual-regression", "e2e"];

export function isE2eStep(step: string) {
  return step.endsWith("-e2e");
}

export function isCypressStep(step: BuildStep | null) {
  return step ? CYPRESS_STEPS.includes(step) : false;
}
