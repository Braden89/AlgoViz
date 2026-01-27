import { Link } from "react-router-dom";

const items = [
  {
    name: "Bubble Sort",
    path: "/algorithms/sorting/bubble",
    desc: "Simple, slow, great for learning comparisons and swaps.",
    tags: ["O(n²) worst", "Stable"],
  },
  {
    name: "Insertion Sort",
    path: "/algorithms/sorting/insertion",
    desc: "Fast on nearly-sorted data; builds a sorted prefix.",
    tags: ["O(n²) worst", "O(n) best", "Stable"],
  },
];

export default function SortingCatalogPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Sorting</h1>
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <Link
              key={a.path}
              to={a.path}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:bg-zinc-900/60 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{a.name}</h2>
                <span className="text-xs text-zinc-400">Open →</span>
              </div>

              <p className="mt-2 text-sm text-zinc-300">{a.desc}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {a.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
