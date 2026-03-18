export type Metrics = {
  comparisons: number;
  swaps: number;
};

export type StepMeta = Record<string, unknown> | undefined;

export type StepInspectorValue = string | number | boolean | null;

export type StepInspectorTone =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type StepInspectorItem = {
  label: string;
  value: StepInspectorValue;
  tone?: StepInspectorTone;
};

export type Step<M extends StepMeta = undefined> = {
  array: number[];
  line: number;
  active?: number[];
  metrics: Metrics;
  note?: string;
  swap?: [number, number];

  // algorithm-specific extras live here
  meta?: M;
  inspector?: StepInspectorItem[];
};

export type AlgorithmDefinition<M extends StepMeta = undefined> = {
  id: string;
  name: string;
  category: "sorting" | "graphs" | "trees" | "dp";
  pseudocode: string[];
  generateSteps: (input: number[]) => Step<M>[];
};

export type TreeNode = {
  id: string;
  value: number;
  parent?: string;
  left?: string;
  right?: string;
  x?: number;
  y?: number;
};

export type TreeSortMeta = {
  phase: "insert" | "traverse" | "done";
  insertingValue?: number;
  currentNodeId?: string;
  highlightNodeIds?: string[];
  tree: {
    rootId?: string;
    nodes: Record<string, TreeNode>;
  };
  output: number[];
};
