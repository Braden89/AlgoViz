import type { Step } from "../algorithms/types";

export function ArrayBars({ step }: { step: Step | undefined }) {
  const arr = step?.array ?? [];
  const max = arr.length ? Math.max(...arr) : 1;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-zinc-300">Array</div>
        <div className="text-xs text-zinc-400">{step?.note ?? ""}</div>
      </div>

      <div className="flex h-56 items-end gap-1 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
        {arr.map((v, idx) => {
          const h = Math.max(2, Math.round((v / max) * 200));
          const active = step?.active?.includes(idx);
          return (
            <div
              key={idx}
              title={`A[${idx}] = ${v}`}
              className={[
                "flex-1 rounded-md transition-all duration-150",
                active ? "bg-zinc-200" : "bg-zinc-500",
              ].join(" ")}
              style={{ height: `${h}px` }}
            />
          );
        })}
      </div>

      <div className="mt-3 text-xs text-zinc-400">
        Active bars = the indices being compared/swapped.
      </div>
    </div>
  );
}
