export function PseudocodePanel(props: { pseudocode: string[]; activeLine: number }) {
  return (
    <div>
      <div className="mb-2 text-sm text-zinc-300">Pseudocode</div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 font-mono text-sm">
        {props.pseudocode.map((line, i) => {
          const isActive = i === props.activeLine;
          return (
            <div
              key={i}
              className={[
                "flex gap-3 rounded-md px-2 py-1",
                isActive ? "bg-zinc-800 text-zinc-100" : "text-zinc-300",
              ].join(" ")}
            >
              <span className="w-6 text-right text-zinc-500">{i + 1}</span>
              <span>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
