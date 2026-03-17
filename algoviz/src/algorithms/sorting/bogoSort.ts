import type { AlgorithmDefinition, Step } from "../types";

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
  swap?: [number, number]
) {
  steps.push({
    array: clone(arr),
    line,
    active,
    metrics: { ...metrics },
    note,
    swap,
  });
}

function isSortedWithSteps(
  arr: number[],
  steps: Step[],
  metrics: Step["metrics"]
): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    pushStep(steps, arr, 1, metrics, [i, i + 1], `Check A[${i}] <= A[${i + 1}]`);
    metrics.comparisons += 1;

    if (arr[i] > arr[i + 1]) {
      pushStep(steps, arr, 1, metrics, [i, i + 1], "Not sorted yet");
      return false;
    }
  }
  pushStep(steps, arr, 1, metrics, undefined, "Array is sorted");
  return true;
}

function shuffleWithSteps(
  arr: number[],
  steps: Step[],
  metrics: Step["metrics"]
) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    pushStep(steps, arr, 2, metrics, [i, j], `Shuffle: swap ${i} and ${j}`, [i, j]);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    metrics.swaps += 1;
    pushStep(steps, arr, 2, metrics, [i, j], "Shuffled", [i, j]);
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

    pushStep(steps, A, 0, metrics, undefined, "Start");

    while (!isSortedWithSteps(A, steps, metrics)) {
      shuffleWithSteps(A, steps, metrics);

      attempts += 1;
      pushStep(steps, A, 3, metrics, undefined, `attempts = ${attempts}`);

      if (attempts >= MAX_ATTEMPTS) {
        pushStep(steps, A, 4, metrics, undefined, `Stopped at MAX_ATTEMPTS (${MAX_ATTEMPTS})`);
        break;
      }
    }

    pushStep(steps, A, 5, metrics, undefined, "Done");
    return steps;
  },
};
