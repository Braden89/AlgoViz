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
  inspector?: StepInspectorItem[]
) {
  steps.push({
    array: clone(arr),
    line,
    active,
    metrics: { ...metrics },
    note,
    inspector,
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
    const n = A.length;

    const bubbleInspector = (i?: number, j?: number): StepInspectorItem[] => [
      { label: "Pass", value: i ?? null, tone: "accent" },
      { label: "j", value: j ?? null, tone: "warning" },
      { label: "Left Index", value: j ?? null, tone: "warning" },
      { label: "Right Index", value: j !== undefined ? j + 1 : null, tone: "warning" },
      { label: "Sorted Tail Starts", value: i !== undefined ? n - i : null, tone: "success" },
      { label: "Array Length", value: n },
    ];

    pushStep(steps, A, 0, metrics, undefined, "Start");
    for (let i = 0; i < n; i++) {
      pushStep(steps, A, 0, metrics, [i], `i = ${i}`, bubbleInspector(i));

      for (let j = 0; j < n - i - 1; j++) {
        pushStep(
          steps,
          A,
          1,
          metrics,
          [j, j + 1],
          `Compare A[${j}] and A[${j + 1}]`,
          bubbleInspector(i, j)
        );
        metrics.comparisons += 1;

        pushStep(steps, A, 2, metrics, [j, j + 1], undefined, bubbleInspector(i, j));

        if (A[j] > A[j + 1]) {
          pushStep(steps, A, 3, metrics, [j, j + 1], "Swap", bubbleInspector(i, j));
          const tmp = A[j];
          A[j] = A[j + 1];
          A[j + 1] = tmp;
          metrics.swaps += 1;
          pushStep(steps, A, 3, metrics, [j, j + 1], "Swapped", bubbleInspector(i, j));
        }
      }
    }

    pushStep(steps, A, 0, metrics, undefined, "Done");
    return steps;
  },
};
