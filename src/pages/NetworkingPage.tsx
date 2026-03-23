import { Link } from "react-router-dom";

const networkingAlgorithms = [
  {
    name: "Paxos",
    description: "Consensus with proposers, acceptors, and learners. Great for visualizing quorum and safety.",
    to: "/algorithms/networking/paxos",
    status: "ready" as const,
  },
];

export default function NetworkingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Networking Algorithms</h1>
            <p className="mt-2 text-zinc-300">Protocols, distributed systems, and consensus visualizations.</p>
          </div>

          <Link
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm hover:bg-zinc-900"
            to="/"
          >
            &larr; Home
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {networkingAlgorithms.map((algorithm) => (
            <Link
              key={algorithm.to}
              to={algorithm.to}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium">{algorithm.name}</div>
                <span className="rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-[10px] text-zinc-300">
                  {algorithm.status === "ready" ? "READY" : "SOON"}
                </span>
              </div>

              <div className="mt-2 text-xs text-zinc-400">{algorithm.description}</div>
              <div className="mt-3 text-xs text-zinc-300">Open &rarr;</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
