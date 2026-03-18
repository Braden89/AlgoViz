import type { AlgorithmDefinition, Step, StepInspectorItem } from "../types";

function clone(arr: number[]) {
  return arr.slice();
}

function pushStep(
  steps: Step[],
  arr: number[],
  line: number,
  metrics: Step["metrics"],
  active?: number[],
  note?: string,
  swap?: [number, number],
  inspector?: StepInspectorItem[]
) {
  steps.push({
    array: clone(arr),
    line,
    active,
    metrics: { ...metrics },
    note,
    swap,
    inspector,
  });
}

function isSortedWithSteps(
  arr: number[],
  steps: Step[],
  metrics: Step["metrics"],
  attempts: number,
  maxAttempts: number
): boolean {
  const inspector = (i?: number, j?: number): StepInspectorItem[] => [
    { label: "Attempts", value: attempts, tone: "warning" },
    { label: "Max Attempts", value: maxAttempts, tone: "danger" },
    { label: "Check Left", value: i ?? null, tone: "accent" },
    { label: "Check Right", value: j ?? null, tone: "accent" },
    { label: "Array Length", value: arr.length },
    { label: "Sorted", value: i === undefined && j === undefined ? true : false, tone: "success" },
  ];

  for (let i = 0; i < arr.length - 1; i++) {
    pushStep(steps, arr, 1, metrics, [i, i + 1], `Check A[${i}] <= A[${i + 1}]`, undefined, inspector(i, i + 1));
    metrics.comparisons += 1;

    if (arr[i] > arr[i + 1]) {
      pushStep(steps, arr, 1, metrics, [i, i + 1], "Not sorted yet", undefined, inspector(i, i + 1));
      return false;
    }
  }
  pushStep(steps, arr, 1, metrics, undefined, "Array is sorted", undefined, inspector());
  return true;
}

function shuffleWithSteps(
  arr: number[],
  steps: Step[],
  metrics: Step["metrics"],
  attempts: number,
  maxAttempts: number
) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const inspector: StepInspectorItem[] = [
      { label: "Attempts", value: attempts, tone: "warning" },
      { label: "Max Attempts", value: maxAttempts, tone: "danger" },
      { label: "Shuffle i", value: i, tone: "accent" },
      { label: "Shuffle j", value: j, tone: "warning" },
      { label: "Array Length", value: arr.length },
      { label: "Phase", value: "shuffle", tone: "accent" },
    ];

    pushStep(steps, arr, 2, metrics, [i, j], `Shuffle: swap ${i} and ${j}`, [i, j], inspector);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    metrics.swaps += 1;
    pushStep(steps, arr, 2, metrics, [i, j], "Shuffled", [i, j], inspector);
  }
}

export const BogoSort: AlgorithmDefinition = {
  id: "bogo-sort",
  name: "Bogo Sort",
  category: "sorting",
  pseudocode: [
    "attempts = 0",
    "while A is not sorted:",
    "  shuffle(A)",
    "  attempts = attempts + 1",
    "  if attempts >= MAX_ATTEMPTS: break",
    "return A",
  ],
  generateSteps: (input: number[]) => {
    const A = clone(input);
    const steps: Step[] = [];
    const metrics = { comparisons: 0, swaps: 0 };

    const MAX_ATTEMPTS = 200;
    let attempts = 0;

    const attemptInspector = (phase: string): StepInspectorItem[] => [
      { label: "Attempts", value: attempts, tone: "warning" },
      { label: "Max Attempts", value: MAX_ATTEMPTS, tone: "danger" },
      { label: "Phase", value: phase, tone: "accent" },
      { label: "Array Length", value: A.length },
    ];

    pushStep(steps, A, 0, metrics, undefined, "Start", undefined, attemptInspector("start"));

    while (!isSortedWithSteps(A, steps, metrics, attempts, MAX_ATTEMPTS)) {
      shuffleWithSteps(A, steps, metrics, attempts, MAX_ATTEMPTS);

      attempts += 1;
      pushStep(steps, A, 3, metrics, undefined, `attempts = ${attempts}`, undefined, attemptInspector("attempt"));

      if (attempts >= MAX_ATTEMPTS) {
        pushStep(
          steps,
          A,
          4,
          metrics,
          undefined,
          `Stopped at MAX_ATTEMPTS (${MAX_ATTEMPTS})`,
          undefined,
          attemptInspector("stopped")
        );
        break;
      }
    }

    pushStep(steps, A, 5, metrics, undefined, "Done", undefined, attemptInspector("done"));
    return steps;
  },
};
