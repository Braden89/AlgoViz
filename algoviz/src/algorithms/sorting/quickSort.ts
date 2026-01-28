import type { AlgorithmDefinition, Step } from "../types";

type QuickMeta = {
  pivotIndex: number;
  lo: number;
  hi: number;
  iIndex?: number;
  jIndex?: number;
};

function clone(arr: number[]) {
  return arr.slice();
}

function pushStep(
  steps: Step<QuickMeta>[],
  arr: number[],
  line: number,
  metrics: Step<QuickMeta>["metrics"],
  active?: number[],
  note?: string,
  swap?: [number, number],
  meta?: QuickMeta
) {
  steps.push({
    array: clone(arr),
    line,
    active,
    metrics: { ...metrics },
    note,
    swap,
    meta,
  });
}

export const QuickSort: AlgorithmDefinition<QuickMeta> = {
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
    const steps: Step<QuickMeta>[] = [];
    const metrics = { comparisons: 0, swaps: 0 };

    // start
    pushStep(steps, A, 0, metrics, undefined, "Start");

    function partition(lo: number, hi: number): number {
      // In Lomuto partition, pivot starts at hi (and later moves to i)
      let pivotIdx = hi;

      // Helper that always attaches meta for the current partition frame
      const ps = (
        line: number,
        active?: number[],
        note?: string,
        swap?: [number, number],
        iIndex?: number,
        jIndex?: number
      ) => {
        const meta: QuickMeta = {
          pivotIndex: pivotIdx,
          lo,
          hi,
          iIndex,
          jIndex,
        };
        pushStep(steps, A, line, metrics, active, note, swap, meta);
      };

      ps(6, [lo, hi], `partition(lo=${lo}, hi=${hi})`);
      ps(7, [hi], `pivot = A[${hi}] = ${A[hi]}`);

      const pivot = A[hi];

      let i = lo;
      ps(8, [i], `i = ${i}`, undefined, i);

      for (let j = lo; j <= hi - 1; j++) {
        ps(9, [j], `j = ${j}`, undefined, i, j);

        metrics.comparisons += 1;
        ps(10, [j, hi], `A[${j}] = ${A[j]} < pivot?`, undefined, i, j);

        if (A[j] < pivot) {
          // swap A[i] and A[j]
          ps(11, [i, j], `swap A[${i}] and A[${j}]`, [i, j], i, j);

          const tmp = A[i];
          A[i] = A[j];
          A[j] = tmp;
          metrics.swaps += 1;

          ps(11, [i, j], "swapped", [i, j], i, j);

          i++;
          ps(11, [i], `i++ → ${i}`, undefined, i, j);
        }
      }

      // place pivot by swapping A[i] and A[hi]
      ps(12, [i, hi], `place pivot: swap A[${i}] and A[${hi}]`, [i, hi], i);

      const tmp = A[i];
      A[i] = A[hi];
      A[hi] = tmp;
      metrics.swaps += 1;

      // pivot has moved from hi to i
      pivotIdx = i;

      ps(12, [i], `pivot placed at index ${i}`, [i, hi], i);
      ps(13, [i], `return p = ${i}`, undefined, i);

      return i;
    }

    function quicksort(lo: number, hi: number) {
      // quicksort frame step (no meta needed here — only partition uses meta)
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
