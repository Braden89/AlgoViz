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
  note?: string
) {
  steps.push({
    array: clone(arr),
    line,
    active,
    metrics: { ...metrics },
    note,
  });
}

export const BubbleSort: AlgorithmDefinition = {
  id: "bubble-sort",
  name: "Bubble Sort",
  category: "sorting",
  pseudocode: [
    "for i = 0..n-1",
    "  for j = 0..n-i-2",
    "    if A[j] > A[j+1]",
    "      swap(A[j], A[j+1])",
  ],
  generateSteps: (input: number[]) => {
    const A = clone(input);
    const steps: Step[] = [];
    const metrics = { comparisons: 0, swaps: 0 };

    pushStep(steps, A, 0, metrics, undefined, "Start");

    const n = A.length;
    for (let i = 0; i < n; i++) {
      pushStep(steps, A, 0, metrics, [i], `i = ${i}`);

      for (let j = 0; j < n - i - 1; j++) {
        pushStep(steps, A, 1, metrics, [j, j + 1], `Compare A[${j}] and A[${j + 1}]`);
        metrics.comparisons += 1;

        pushStep(steps, A, 2, metrics, [j, j + 1]);

        if (A[j] > A[j + 1]) {
          pushStep(steps, A, 3, metrics, [j, j + 1], "Swap", [j, j + 1]);
          const tmp = A[j];
          A[j] = A[j + 1];
          A[j + 1] = tmp;
          metrics.swaps += 1;
          pushStep(steps, A, 3, metrics, [j, j + 1], "Swapped", [j, j + 1]);
        }
      }
    }

    pushStep(steps, A, 0, metrics, undefined, "Done");
    return steps;
  },
};
