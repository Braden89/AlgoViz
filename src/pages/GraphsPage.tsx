import { Link } from "react-router-dom";

const graphAlgorithms = [
  {
    name: "Depth-First Search (DFS)",
    description: "Explore as deep as possible first using a stack.",
    to: "/graphs/dfs",
    status: "ready" as const,
  },
  {
    name: "Breadth-First Search (BFS)",
    description: "Explore level by level using a queue.",
    to: "/graphs/bfs",
    status: "ready" as const,
  },
  // Later, just add more:
  // { name: "Dijkstra", description: "...", to: "/graphs/dijkstra", status: "soon" },
];

export default function GraphsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Graphs</h1>
            <p className="mt-2 text-zinc-300">Search and traversal algorithms.</p>
          </div>

          <Link
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm hover:bg-zinc-900"
            to="/"
          >
            ← Home
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {graphAlgorithms.map((a) => {
            const disabled = a.status !== "ready";
            return (
              <Link
                key={a.to}
                to={disabled ? "#" : a.to}
                onClick={(e) => {
                  if (disabled) e.preventDefault();
                }}
                className={[
                  "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition",
                  disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-900",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-medium">{a.name}</div>
                  <span className="rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-[10px] text-zinc-300">
                    {a.status === "ready" ? "READY" : "SOON"}
                  </span>
                </div>

                <div className="mt-2 text-xs text-zinc-400">{a.description}</div>
                <div className="mt-3 text-xs text-zinc-300">
                  Open →
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          Add new graph algorithms by inserting one object in <code>graphAlgorithms</code>.
        </div>
      </div>
    </div>
  );
}
