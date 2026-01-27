import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold">AlgoViz</h1>
        <p className="mt-2 text-zinc-300">Visualize algorithms step by step.</p>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-sm text-zinc-300">Start here</div>
          <Link
            className="mt-2 inline-block rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm hover:bg-zinc-900"
            to="/algorithms/sorting/bubble"
          >
            Bubble Sort →
          </Link>
          <Link
            className="mt-2 inline-block rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm hover:bg-zinc-900"
            to="/algorithms/sorting/insertion"
>
            Insertion Sort →
            </Link>

        </div>
      </div>
    </div>
  );
}
