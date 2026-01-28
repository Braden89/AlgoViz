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
  swap?: [number, number],
  pivotIndex?: number
) {
  steps.push({
    array: clone(arr),
    line,
    active,
    metrics: { ...metrics },
    note,
    swap,
    pivotIndex,
  });
}

export const QuickSort: AlgorithmDefinition = {
  id: "quick-sort",
  name: "Quick Sort",
  category: "sorting",
  pseudocode: [
    "quicksort(A, lo, hi)",
    "  if lo >= hi: return",
    "  p = partition(A, lo, hi)",
    "  quicksort(A, lo, p-1)",
    "  quicksort(A, p+1, hi)",
    "",
    "partition(A, lo, hi)",
    "  pivot = A[hi]",
    "  i = lo",
    "  for j = lo..hi-1",
    "    if A[j] < pivot",
    "      swap(A[i], A[j]); i++",
    "  swap(A[i], A[hi])",
    "  return i",
  ],
  generateSteps: (input: number[]) => {
    const A = clone(input);
    const steps: Step[] = [];
    const metrics = { comparisons: 0, swaps: 0 };

    pushStep(steps, A, 0, metrics, undefined, "Start");

    function partition(lo: number, hi: number): number {
      // pivot starts at hi for this partition
      let pivotIdx = hi;

      // helper: every partition step includes pivotIdx so pivot stays red
      const ps = (
        line: number,
        active?: number[],
        note?: string,
        swap?: [number, number]
      ) => pushStep(steps, A, line, metrics, active, note, swap, pivotIdx);

      ps(6, [lo, hi], `partition(lo=${lo}, hi=${hi})`);
      ps(7, [hi], `pivot = A[${hi}] = ${A[hi]}`);
      const pivot = A[hi];

      ps(8, [lo, hi], `i = ${lo}`);
      let i = lo;

      for (let j = lo; j <= hi - 1; j++) {
        // Compare A[j] to pivot (keep pivot red)
        ps(9, [j, i], `j = ${j}, compare A[j] to pivot`);
        metrics.comparisons += 1;

        ps(10, [j], `A[${j}] = ${A[j]} < pivot?`);

        if (A[j] < pivot) {
          ps(11, [i, j], `swap A[${i}] and A[${j}]`, [i, j]);

          const tmp = A[i];
          A[i] = A[j];
          A[j] = tmp;
          metrics.swaps += 1;

          ps(11, [i, j], "swapped", [i, j]);

          i++;
          ps(11, [i], `i++ → ${i}`);
        }
      }

      // Place pivot: swap A[i] and A[hi]
      ps(12, [i, hi], `place pivot: swap A[${i}] and A[${hi}]`, [i, hi]);

      const tmp = A[i];
      A[i] = A[hi];
      A[hi] = tmp;
      metrics.swaps += 1;

      // pivot moved from hi to i — keep pivot red at its new location
      pivotIdx = i;

      ps(12, [i], `pivot placed at index ${i}`, [i, hi]);
      ps(13, [i], `return p = ${i}`);
      return i;
    }

    function quicksort(lo: number, hi: number) {
      pushStep(steps, A, 1, metrics, [lo, hi], `quicksort(lo=${lo}, hi=${hi})`);
      if (lo >= hi) {
        pushStep(steps, A, 1, metrics, [lo, hi], "base case return");
        return;
      }

      pushStep(steps, A, 2, metrics, [lo, hi], "partition");
      const p = partition(lo, hi);

      pushStep(steps, A, 3, metrics, [lo, p - 1], `left: lo=${lo}, hi=${p - 1}`);
      quicksort(lo, p - 1);

      pushStep(steps, A, 4, metrics, [p + 1, hi], `right: lo=${p + 1}, hi=${hi}`);
      quicksort(p + 1, hi);
    }

    quicksort(0, A.length - 1);

    pushStep(steps, A, 0, metrics, undefined, "Done");
    return steps;
  },
};
