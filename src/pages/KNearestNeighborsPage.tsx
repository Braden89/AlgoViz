import { useState } from "react";
import { AlgorithmLayout } from "../components/AlgorithmLayout";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { KNearestNeighborsView } from "../components/KNearestNeighborsView";
import { KNearestNeighbors } from "../algorithms/machine-learning/kNearestNeighbors";

export default function KNearestNeighborsPage() {
  const [pointCount, setPointCount] = useState(24);
  const [overlap, setOverlap] = useState(0.3);
  const [k, setK] = useState(5);
  const [points, setPoints] = useState(() => KNearestNeighbors.createDataset(24, 0.3));
  const [queryPoint, setQueryPoint] = useState(() => KNearestNeighbors.createQueryPoint(0.3));

  const result = KNearestNeighbors.classify(points, queryPoint, k);

  const regenerate = (nextCount = pointCount, nextOverlap = overlap) => {
    setPoints(KNearestNeighbors.createDataset(nextCount, nextOverlap));
    setQueryPoint(KNearestNeighbors.createQueryPoint(nextOverlap));
  };

  return (
    <AlgorithmLayout
      title="K-Nearest Neighbors"
      headerRight={
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Machine Learning", to: "/algorithms/machine-learning" },
              { label: "K-Nearest Neighbors" },
            ]}
          />
        </div>
      }
      left={
        <div className="space-y-4">
          <div>
            <div className="text-sm text-zinc-300">Overview</div>
            <div className="mt-2 text-sm text-zinc-400">
              KNN classifies a new point by looking at the labels of the closest training examples. The query point is the gold point, and the highlighted ring shows the neighborhood that decides the vote.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Prediction</div>
            <div className="mt-2 text-sm text-zinc-400">
              The query point is currently classified as{" "}
              <span className={result.predictedLabel === 1 ? "text-red-300" : "text-blue-300"}>
                {result.predictedLabel === 1 ? "Class B" : "Class A"}
              </span>.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">How It Works</div>
            <div className="mt-2 text-sm text-zinc-400">
              KNN does not train a line or a tree up front. Instead, it stores the labeled points and makes a prediction only when a query arrives, using the majority vote among the nearest neighbors.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Query Point</div>
            <div className="mt-2 grid gap-2 text-sm text-zinc-400">
              <div>x1 = {KNearestNeighbors.round(queryPoint.x)}</div>
              <div>x2 = {KNearestNeighbors.round(queryPoint.y)}</div>
              <div>Neighbor radius = {KNearestNeighbors.round(result.radius)}</div>
            </div>
          </div>
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Controls</div>
            <div className="mt-4 grid gap-4">
              <label className="space-y-2 text-xs text-zinc-400">
                <span>Point count: {pointCount}</span>
                <input
                  className="w-full"
                  type="range"
                  min={12}
                  max={48}
                  step={2}
                  value={pointCount}
                  onChange={(event) => {
                    const nextCount = Number(event.target.value);
                    setPointCount(nextCount);
                    regenerate(nextCount, overlap);
                  }}
                />
              </label>

              <label className="space-y-2 text-xs text-zinc-400">
                <span>Class overlap: {Math.round(overlap * 100)}%</span>
                <input
                  className="w-full"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={overlap}
                  onChange={(event) => {
                    const nextOverlap = Number(event.target.value);
                    setOverlap(nextOverlap);
                    regenerate(pointCount, nextOverlap);
                  }}
                />
              </label>

              <label className="space-y-2 text-xs text-zinc-400">
                <span>k neighbors: {k}</span>
                <input
                  className="w-full"
                  type="range"
                  min={1}
                  max={11}
                  step={2}
                  value={k}
                  onChange={(event) => setK(Number(event.target.value))}
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                  onClick={() => setQueryPoint(KNearestNeighbors.createQueryPoint(overlap))}
                >
                  New Query Point
                </button>
                <button
                  className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900"
                  onClick={() => regenerate()}
                >
                  Regenerate Data
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">Vote Summary</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Class A votes</div>
                <div className="mt-1 text-lg text-blue-300">{result.voteSummary.classA}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Class B votes</div>
                <div className="mt-1 text-lg text-red-300">{result.voteSummary.classB}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm text-zinc-400">
            Lower overlap usually makes the vote more stable. As overlap increases, the gold query point is more likely to sit near both classes and the result becomes more sensitive to the value of `k`.
          </div>
        </div>
      }
      bottom={
        <KNearestNeighborsView
          title="KNN Classification View"
          points={points}
          queryPoint={queryPoint}
          neighbors={result.nearestNeighbors}
          predictedLabel={result.predictedLabel}
          radius={result.radius}
          xDomain={KNearestNeighbors.xDomain}
          yDomain={KNearestNeighbors.yDomain}
        />
      }
    />
  );
}
