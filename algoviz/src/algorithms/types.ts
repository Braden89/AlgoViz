export type Metrics = {
  comparisons: number;
  swaps: number;
};

export type Step = {
  array: number[];
  // index into pseudocode lines
  line: number;
  // indices to emphasize in the visualization
  active?: number[];
  metrics: Metrics;
  note?: string;
  swap?: [number, number];
  pivotIndex?: number;
};

export type AlgorithmDefinition = {
  id: string;
  name: string;
  category: "sorting" | "graphs" | "trees" | "dp";
  pseudocode: string[];
  generateSteps: (input: number[]) => Step[];
};
