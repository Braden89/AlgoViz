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

export const InsertionSort: AlgorithmDefinition = {
  id: "insertion-sort",
  name: "Insertion Sort",
  category: "sorting",
  pseudocode: [
    "for i = 1..n-1",
    "  key = A[i]",
    "  j = i - 1",
    "  while j >= 0 and A[j] > key",
    "    A[j+1] = A[j]",
    "    j = j - 1",
    "  A[j+1] = key",
  ],
  generateSteps: (input: number[]) => {
    const A = clone(input);
    const steps: Step[] = [];
    const metrics = { comparisons: 0, swaps: 0 }; // swaps = shifts + final insert (simple metric)

    const insertionInspector = (i?: number, j?: number, key?: number): StepInspectorItem[] => [
      { label: "i", value: i ?? null, tone: "accent" },
      { label: "j", value: j ?? null, tone: "warning" },
      { label: "Key", value: key ?? null, tone: "danger" },
      { label: "Insert Index", value: j !== undefined ? j + 1 : null, tone: "success" },
      { label: "Sorted Prefix End", value: i !== undefined ? i - 1 : null, tone: "success" },
      { label: "Array Length", value: A.length },
    ];

    pushStep(steps, A, 0, metrics, undefined, "Start");

    for (let i = 1; i < A.length; i++) {
      pushStep(steps, A, 0, metrics, [i], `i = ${i}`, insertionInspector(i));

      const key = A[i];
      pushStep(steps, A, 1, metrics, [i], `key = A[${i}]`, insertionInspector(i, undefined, key));

      let j = i - 1;
      pushStep(steps, A, 2, metrics, [i - 1, i], `j = ${j}`, insertionInspector(i, j, key));

      // We count comparisons each time we check A[j] > key (while condition second part)
      while (j >= 0) {
        pushStep(steps, A, 3, metrics, [j, i], `Compare A[${j}] to key`, insertionInspector(i, j, key));
        metrics.comparisons += 1;

        if (A[j] > key) {
          pushStep(steps, A, 4, metrics, [j, j + 1], "Shift right", insertionInspector(i, j, key));
          A[j + 1] = A[j];
          metrics.swaps += 1; // treating shifts as swaps/moves for now
          pushStep(steps, A, 4, metrics, [j, j + 1], "Shifted", insertionInspector(i, j, key));

          j = j - 1;
          pushStep(
            steps,
            A,
            5,
            metrics,
            j >= 0 ? [j] : undefined,
            "j--",
            insertionInspector(i, j, key)
          );
        } else {
          break;
        }
      }

      pushStep(steps, A, 6, metrics, [j + 1], "Insert key", insertionInspector(i, j, key));
      A[j + 1] = key;
      metrics.swaps += 1;
      pushStep(steps, A, 6, metrics, [j + 1], "Inserted", insertionInspector(i, j, key));
    }

    pushStep(steps, A, 0, metrics, undefined, "Done");
    return steps;
  },
};
