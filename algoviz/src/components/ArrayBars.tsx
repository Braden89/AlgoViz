import type { Step } from "../algorithms/types";

export function ArrayBars({ step }: { step: Step | undefined }) {
  const arr = step?.array ?? [];
  const max = arr.length ? Math.max(...arr) : 1;

  const swapA = step?.swap?.[0];
  const swapB = step?.swap?.[1];
  const pivotIndex = step?.pivotIndex;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-zinc-300">Array</div>
        <div className="text-xs text-zinc-400">{step?.note ?? ""}</div>
      </div>

      <div className="flex h-56 items-end gap-1 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 overflow-hidden">
        {arr.map((v, idx) => {
          const h = Math.max(2, Math.round((v / max) * 200));

          const isActive = step?.active?.includes(idx) ?? false;
          const isPivot = pivotIndex === idx;

          // swap nudge animation
          let translate = "";
          if (swapA === idx) translate = "translate-x-2";
          if (swapB === idx) translate = "-translate-x-2";

          // color priority: pivot overrides active overrides default
          let color = "bg-zinc-500";
          if (isActive) color = "bg-emerald-300";
          if (isPivot) color = "bg-red-400";

          return (
            <div
              key={idx}
              title={`A[${idx}] = ${v}${isPivot ? " (pivot)" : ""}`}
              className={[
                "flex-1 rounded-md transition-all duration-200 ease-in-out",
                color,
                translate,
              ].join(" ")}
              style={{ height: `${h}px` }}
            />
          );
        })}
      </div>

      <div className="mt-3 text-xs text-zinc-400">
        <span className="mr-3">🟢 active compare/swap</span>
        <span>🔴 pivot</span>
      </div>
    </div>
  );
}
