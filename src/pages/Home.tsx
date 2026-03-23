import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold">AlgoViz</h1>
        <p className="mt-2 text-zinc-300">Visualize algorithms step by step.</p>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-sm text-zinc-300">Browse</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm hover:bg-zinc-900"
              to="/algorithms/sorting"
            >
              Sorting &rarr;
            </Link>
            <Link
              className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm hover:bg-zinc-900"
              to="/graphs"
            >
              Graphs &rarr;
            </Link>
            <Link
              className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm hover:bg-zinc-900"
              to="/algorithms/networking"
            >
              Networking &rarr;
            </Link>
          </div>

          <div className="mt-3 text-xs text-zinc-400">
            More algorithms coming soon! (e.g. graph search, dynamic programming, greedy algorithms...)
          </div>
        </div>
      </div>
    </div>
  );
}
