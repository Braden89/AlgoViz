import { Link } from "react-router-dom";

type AlgoItem = {
  name: string;
  path: string;
  description: string;
  tags: string[];
};

const SORTING_ALGORITHMS: AlgoItem[] = [
  {
    name: "Bubble Sort",
    path: "/algorithms/sorting/bubble",
    description: "Simple comparison-based sort. Easy to understand, slow in practice.",
    tags: ["O(n²)", "Stable"],
  },
  {
    name: "Insertion Sort",
    path: "/algorithms/sorting/insertion",
    description: "Builds a sorted prefix. Very fast on nearly-sorted data.",
    tags: ["O(n²) worst", "O(n) best", "Stable"],
  },
  {
    name: "Quick Sort",
    path: "/algorithms/sorting/quick",
    description: "Divide-and-conquer sort using partitioning.",
    tags: ["Avg O(n log n)", "Worst O(n²)", "In-place"],
  },
];

function AlgorithmCard({ algo }: { algo: AlgoItem }) {
  return (
    <Link
      to={algo.path}
      className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:bg-zinc-900/60"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{algo.name}</h2>
        <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
          Open →
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-300">{algo.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {algo.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function SortingCatalogPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Sorting Algorithms</h1>
            <p className="mt-2 text-zinc-300">
              Choose an algorithm to visualize step by step.
            </p>
          </div>

          <Link
            to="/"
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
          >
            ← Home
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {SORTING_ALGORITHMS.map((algo) => (
            <AlgorithmCard key={algo.path} algo={algo} />
          ))}
        </div>
      </div>
    </div>
  );
}
