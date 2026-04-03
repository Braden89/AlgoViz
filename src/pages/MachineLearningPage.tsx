import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";

const machineLearningAlgorithms = [
  {
    name: "Linear Regression",
    description: "Start with noisy 2D data and build toward a best-fit line visualization.",
    to: "/algorithms/machine-learning/linear-regression",
    status: "ready" as const,
  },
  {
    name: "Gradient Descent",
    description: "Train a simple classifier on two classes and watch the decision boundary move.",
    to: "/algorithms/machine-learning/gradient-descent",
    status: "ready" as const,
  },
];

export default function MachineLearningPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Machine Learning</h1>
            <p className="mt-2 text-zinc-300">Interactive visualizations for models, data, and training ideas.</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <Breadcrumbs
              items={[
                { label: "Home", to: "/" },
                { label: "Machine Learning" },
              ]}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {machineLearningAlgorithms.map((algorithm) => (
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
