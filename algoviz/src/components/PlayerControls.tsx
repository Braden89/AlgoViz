import { useEffect } from "react";
import { usePlayerStore } from "../state/playerStore";

export function PlayerControls() {
  const steps = usePlayerStore((s) => s.steps);
  const index = usePlayerStore((s) => s.index);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const speedMs = usePlayerStore((s) => s.speedMs);

  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const reset = usePlayerStore((s) => s.reset);

  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setSpeedMs = usePlayerStore((s) => s.setSpeedMs);

  useEffect(() => {
    if (!isPlaying) return;
    const t = window.setInterval(() => {
      const last = steps.length - 1;
      if (index >= last) {
        setPlaying(false);
        return;
      }
      next();
    }, speedMs);

    return () => window.clearInterval(t);
  }, [isPlaying, speedMs, index, steps.length, next, setPlaying]);

  const atStart = index <= 0;
  const atEnd = steps.length ? index >= steps.length - 1 : true;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900 disabled:opacity-50"
        onClick={() => setPlaying(!isPlaying)}
        disabled={steps.length === 0}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900 disabled:opacity-50"
        onClick={prev}
        disabled={atStart}
      >
        Step Back
      </button>

      <button
        className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900 disabled:opacity-50"
        onClick={next}
        disabled={atEnd}
      >
        Step
      </button>

      <button
        className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900 disabled:opacity-50"
        onClick={reset}
        disabled={steps.length === 0}
      >
        Reset
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-zinc-400">Speed</span>
        <select
          className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-2 text-sm"
          value={speedMs}
          onChange={(e) => setSpeedMs(Number(e.target.value))}
        >
          <option value={800}>Slow</option>
          <option value={400}>Normal</option>
          <option value={150}>Fast</option>
        </select>

        <div className="text-xs text-zinc-500">
          {steps.length ? `${index + 1}/${steps.length}` : "0/0"}
        </div>
      </div>
    </div>
  );
}
