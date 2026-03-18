import type { Step } from "../algorithms/types";
import { StepInspector } from "./StepInspector";

type QuickMetaMaybe = {
  pivotIndex?: number;
  lo?: number;
  hi?: number;
  iIndex?: number;
  jIndex?: number;
};

export function ArrayBars({ step }: { step: Step<any> | undefined }) {
  const arr = step?.array ?? [];
  const max = arr.length ? Math.max(...arr) : 1;

  const swapA = step?.swap?.[0];
  const swapB = step?.swap?.[1];

  // Quick Sort uses these fields to color array bars.
  const meta = (step?.meta as QuickMetaMaybe | undefined) ?? undefined;

  const pivotIndex = meta?.pivotIndex;
  const lo = meta?.lo;
  const hi = meta?.hi;
  const iIndex = meta?.iIndex;
  const jIndex = meta?.jIndex;

  const hasRange =
    meta !== undefined &&
    Number.isFinite(lo) &&
    Number.isFinite(hi);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-zinc-300">Array</div>
        <div className="text-xs text-zinc-400">{step?.note ?? ""}</div>
      </div>

      <div className="flex h-56 items-end gap-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
        {arr.map((v, idx) => {
          const h = Math.max(2, Math.round((v / max) * 200));

          const isActive = step?.active?.includes(idx) ?? false;
          const isPivot = pivotIndex === idx;
          const isI = iIndex === idx;
          const isJ = jIndex === idx;

          const inRange = hasRange ? idx >= (lo as number) && idx <= (hi as number) : true;

          let translate = "";
          if (swapA === idx) translate = "translate-x-2";
          if (swapB === idx) translate = "-translate-x-2";

          let color = "bg-zinc-500";
          if (isActive) color = "bg-emerald-300";
          if (isJ) color = "bg-amber-300";
          if (isI) color = "bg-sky-300";
          if (isPivot) color = "bg-red-400";

          const fade = inRange ? "opacity-100" : "opacity-25";

          return (
            <div
              key={idx}
              title={[
                `A[${idx}] = ${v}`,
                isPivot ? "pivot" : "",
                isI ? "i" : "",
                isJ ? "j" : "",
              ]
                .filter(Boolean)
                .join(" | ")}
              className={[
                "flex-1 rounded-md transition-all duration-200 ease-in-out",
                color,
                translate,
                fade,
              ].join(" ")}
              style={{ height: `${h}px` }}
            />
          );
        })}
      </div>

      <StepInspector items={step?.inspector} />
    </div>
  );
}
