import type { ClassifiedPoint, PlotClassName, PlotPoint } from "./types";

export type KNearestNeighborResult = {
  queryPoint: PlotPoint;
  nearestNeighbors: Array<{
    point: ClassifiedPoint;
    distance: number;
  }>;
  predictedLabel: 0 | 1;
  voteSummary: {
    classA: number;
    classB: number;
  };
  radius: number;
};

export const K_NEAREST_NEIGHBORS_X_DOMAIN: [number, number] = [0, 12];
export const K_NEAREST_NEIGHBORS_Y_DOMAIN: [number, number] = [0, 48];
const X_SPAN = K_NEAREST_NEIGHBORS_X_DOMAIN[1] - K_NEAREST_NEIGHBORS_X_DOMAIN[0];
const Y_SPAN = K_NEAREST_NEIGHBORS_Y_DOMAIN[1] - K_NEAREST_NEIGHBORS_Y_DOMAIN[0];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createPoint(
  centerX: number,
  centerY: number,
  spread: number,
  className: PlotClassName,
  label: 0 | 1,
): ClassifiedPoint {
  return {
    x: round(clamp(centerX + randomBetween(-spread, spread), K_NEAREST_NEIGHBORS_X_DOMAIN[0], K_NEAREST_NEIGHBORS_X_DOMAIN[1])),
    y: round(clamp(centerY + randomBetween(-spread * 1.25, spread * 1.25), K_NEAREST_NEIGHBORS_Y_DOMAIN[0], K_NEAREST_NEIGHBORS_Y_DOMAIN[1])),
    className,
    label,
  };
}

function createDataset(count: number, overlap: number): ClassifiedPoint[] {
  const classACount = Math.ceil(count / 2);
  const classBCount = Math.floor(count / 2);
  const centerAY = randomBetween(16, 31);
  const centerBY = centerAY + randomBetween(-5, 5);
  const separation = 7.4 * (1 - overlap);
  const centerAX = 6 - separation / 2;
  const centerBX = 6 + separation / 2;
  const spread = 0.85 + overlap * 2.5;

  return [
    ...Array.from({ length: classACount }, () => createPoint(centerAX, centerAY, spread, "default", 0)),
    ...Array.from({ length: classBCount }, () => createPoint(centerBX, centerBY, spread, "classB", 1)),
  ];
}

function createQueryPoint(overlap: number): PlotPoint {
  const centerBias = randomBetween(-1.6, 1.6) * overlap;
  return {
    x: round(clamp(6 + centerBias + randomBetween(-1.8, 1.8), K_NEAREST_NEIGHBORS_X_DOMAIN[0], K_NEAREST_NEIGHBORS_X_DOMAIN[1])),
    y: round(clamp(24 + randomBetween(-8, 8), K_NEAREST_NEIGHBORS_Y_DOMAIN[0], K_NEAREST_NEIGHBORS_Y_DOMAIN[1])),
  };
}

function distance(a: PlotPoint, b: PlotPoint) {
  const normalizedDx = (a.x - b.x) / X_SPAN;
  const normalizedDy = (a.y - b.y) / Y_SPAN;
  return Math.hypot(normalizedDx, normalizedDy);
}

function classify(
  points: ClassifiedPoint[],
  queryPoint: PlotPoint,
  k: number,
): KNearestNeighborResult {
  const nearestNeighbors = points
    .map((point) => ({
      point,
      distance: distance(point, queryPoint),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Math.min(k, points.length));

  const classA = nearestNeighbors.filter((entry) => entry.point.label === 0).length;
  const classB = nearestNeighbors.length - classA;
  const predictedLabel = classB > classA ? 1 : 0;
  const radius = nearestNeighbors[nearestNeighbors.length - 1]?.distance ?? 0;

  return {
    queryPoint,
    nearestNeighbors,
    predictedLabel,
    voteSummary: {
      classA,
      classB,
    },
    radius,
  };
}

function describeOverlap(overlap: number) {
  if (overlap <= 0.05) return "no overlap";
  if (overlap <= 0.25) return "light overlap";
  if (overlap <= 0.6) return "moderate overlap";
  if (overlap <= 0.9) return "heavy overlap";
  return "complete overlap";
}

export const KNearestNeighbors = {
  xDomain: K_NEAREST_NEIGHBORS_X_DOMAIN,
  yDomain: K_NEAREST_NEIGHBORS_Y_DOMAIN,
  round,
  createDataset,
  createQueryPoint,
  classify,
  describeOverlap,
};
