import type { StepInspectorItem, StepInspectorTone, StepInspectorValue } from "../algorithms/types";

function formatValue(value: StepInspectorValue) {
  if (value === null) return "--";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function toneClass(tone: StepInspectorTone | undefined) {
  switch (tone) {
    case "accent":
      return "text-sky-300";
    case "success":
      return "text-emerald-300";
    case "warning":
      return "text-amber-300";
    case "danger":
      return "text-red-400";
    default:
      return "text-zinc-100";
  }
}

export function StepInspector({ items }: { items?: StepInspectorItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Details
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={`${item.label}:${String(item.value)}`}
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
          >
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              {item.label}
            </div>
            <div className={`mt-1 text-sm font-medium ${toneClass(item.tone)}`}>
              {formatValue(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
