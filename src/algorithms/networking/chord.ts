import type { Metrics, Step, StepInspectorItem } from "../types";

export type ChordScenarioId = "balanced" | "sparse" | "wraparound";

export type ChordRole = "node" | "key";
export type ChordPhase = "idle" | "route" | "found";

export type ChordFingerEntry = {
  start: number;
  pointsTo: number;
};

export type ChordNodeState = {
  id: string;
  label: string;
  role: ChordRole;
  status: string;
  hash: number;
  successor: number;
  predecessor: number;
  fingerTable: ChordFingerEntry[];
  details: Array<{
    label: string;
    value: string | number;
  }>;
  isHighlighted?: boolean;
};

export type ChordMessage = {
  id: string;
  from: string;
  to: string;
  kind: "lookup";
  key: number;
  state: "in-flight" | "delivered";
};

export type ChordMeta = {
  phase: ChordPhase;
  title: string;
  m: number;
  ringSize: number;
  key: number;
  startNode: number;
  responsibleNode: number;
  hopCount: number;
  nodes: ChordNodeState[];
  activeMessage?: ChordMessage;
  path: number[];
  eventLog: string[];
};

type ChordScenario = {
  id: ChordScenarioId;
  name: string;
  description: string;
  config: ChordConfig;
};

export type ChordConfig = {
  m: number;
  nodeIds: number[];
  startNode: number;
  key: number;
};

const DEFAULT_M = 5;

export const CHORD_PSEUDOCODE = [
  "hash nodes and keys onto a circular identifier space",
  "each node keeps successor, predecessor, and finger table pointers",
  "start lookup at node n for key k",
  "if k is in (n, successor(n)], successor is responsible",
  "otherwise forward to the closest preceding finger for k",
  "repeat until some node finds the responsible successor",
];

export const CHORD_SCENARIOS: Record<ChordScenarioId, ChordScenario> = {
  balanced: {
    id: "balanced",
    name: "Balanced Ring",
    description: "A well-spaced ring where fingers skip around the circle and the lookup resolves quickly.",
    config: {
      m: DEFAULT_M,
      nodeIds: [1, 4, 8, 12, 15, 21, 27],
      startNode: 4,
      key: 19,
    },
  },
  sparse: {
    id: "sparse",
    name: "Sparse Ring",
    description: "Fewer nodes create bigger jumps between successors and more interesting finger usage.",
    config: {
      m: DEFAULT_M,
      nodeIds: [0, 6, 13, 20, 28],
      startNode: 6,
      key: 25,
    },
  },
  wraparound: {
    id: "wraparound",
    name: "Wraparound Lookup",
    description: "The key falls near zero, so the lookup path wraps around the end of the ring.",
    config: {
      m: DEFAULT_M,
      nodeIds: [2, 7, 11, 18, 24, 30],
      startNode: 24,
      key: 1,
    },
  },
};

function mod(value: number, ringSize: number) {
  return ((value % ringSize) + ringSize) % ringSize;
}

function inInterval(value: number, start: number, end: number, ringSize: number, inclusiveEnd = false) {
  if (start < end) {
    return inclusiveEnd ? value > start && value <= end : value > start && value < end;
  }

  if (start > end) {
    return inclusiveEnd
      ? value > start || value <= end
      : value > start || value < end;
  }

  return inclusiveEnd ? true : value !== start;
}

function sanitizeNodeIds(nodeIds: number[], ringSize: number) {
  return Array.from(new Set(nodeIds.map((id) => mod(Math.floor(id), ringSize)))).sort((a, b) => a - b);
}

function successorFor(value: number, nodeIds: number[]) {
  return nodeIds.find((nodeId) => nodeId >= value) ?? nodeIds[0];
}

function predecessorFor(nodeId: number, nodeIds: number[]) {
  const index = nodeIds.indexOf(nodeId);
  return nodeIds[(index - 1 + nodeIds.length) % nodeIds.length];
}

function fingerTableFor(nodeId: number, nodeIds: number[], m: number, ringSize: number): ChordFingerEntry[] {
  return Array.from({ length: m }, (_, offset) => {
    const start = mod(nodeId + 2 ** offset, ringSize);
    return {
      start,
      pointsTo: successorFor(start, nodeIds),
    };
  });
}

function buildNodeDetails(node: ChordNodeState) {
  return [
    { label: "Hash", value: node.hash },
    { label: "Pred", value: node.predecessor },
    { label: "Succ", value: node.successor },
    { label: "Finger[1]", value: node.fingerTable[0]?.pointsTo ?? "--" },
    { label: "Finger[last]", value: node.fingerTable[node.fingerTable.length - 1]?.pointsTo ?? "--" },
  ];
}

function buildNodes(config: ChordConfig): ChordNodeState[] {
  const ringSize = 2 ** config.m;
  const nodeIds = sanitizeNodeIds(config.nodeIds, ringSize);

  return nodeIds.map((nodeId) => {
    const successor = successorFor(mod(nodeId + 1, ringSize), nodeIds);
    const predecessor = predecessorFor(nodeId, nodeIds);
    const fingerTable = fingerTableFor(nodeId, nodeIds, config.m, ringSize);

    const node: ChordNodeState = {
      id: `N${nodeId}`,
      label: `N${nodeId}`,
      role: "node",
      status: "Idle",
      hash: nodeId,
      successor,
      predecessor,
      fingerTable,
      details: [],
    };
    node.details = buildNodeDetails(node);
    return node;
  });
}

function createInspector(meta: ChordMeta): StepInspectorItem[] {
  return [
    { label: "Phase", value: meta.phase.toUpperCase(), tone: "accent" },
    { label: "Start Node", value: meta.startNode },
    { label: "Key", value: meta.key },
    { label: "Responsible", value: meta.responsibleNode, tone: "success" },
    { label: "Hops", value: meta.hopCount, tone: meta.hopCount > 2 ? "warning" : "default" },
  ];
}

function baseMetrics(hops: number): Metrics {
  return {
    comparisons: hops,
    swaps: 0,
  };
}

export function createChordConfig(scenarioId: ChordScenarioId): ChordConfig {
  const scenario = CHORD_SCENARIOS[scenarioId];
  return {
    ...scenario.config,
  };
}

export function createChordPreviewMeta(config: ChordConfig): ChordMeta {
  const ringSize = 2 ** config.m;
  const nodeIds = sanitizeNodeIds(config.nodeIds, ringSize);
  const safeStart = nodeIds.includes(mod(config.startNode, ringSize)) ? mod(config.startNode, ringSize) : nodeIds[0];
  const key = mod(config.key, ringSize);
  const responsibleNode = successorFor(key, nodeIds);
  const nodes = buildNodes({ ...config, nodeIds });

  return {
    phase: "idle",
    title: "Ready to Lookup",
    m: config.m,
    ringSize,
    key,
    startNode: safeStart,
    responsibleNode,
    hopCount: 0,
    nodes,
    path: [safeStart],
    eventLog: [
      "Adjust the ring, pick a start node and lookup key, then press play to route the query.",
      "Chord uses successors and finger tables to find the node responsible for a key on the hash ring.",
    ],
  };
}

function closestPrecedingFinger(current: ChordNodeState, key: number, ringSize: number) {
  for (let index = current.fingerTable.length - 1; index >= 0; index -= 1) {
    const finger = current.fingerTable[index];
    if (inInterval(finger.pointsTo, current.hash, key, ringSize, false)) {
      return finger.pointsTo;
    }
  }
  return current.successor;
}

export const Chord = {
  pseudocode: CHORD_PSEUDOCODE,
  scenarios: CHORD_SCENARIOS,
  createConfig: createChordConfig,
  previewMeta: createChordPreviewMeta,
  generateSteps(config: ChordConfig): Step<ChordMeta>[] {
    const ringSize = 2 ** config.m;
    const nodeIds = sanitizeNodeIds(config.nodeIds, ringSize);
    const nodes = buildNodes({ ...config, nodeIds });
    const key = mod(config.key, ringSize);
    const startNode = nodeIds.includes(mod(config.startNode, ringSize)) ? mod(config.startNode, ringSize) : nodeIds[0];
    const responsibleNode = successorFor(key, nodeIds);
    const eventLog: string[] = [];
    const steps: Step<ChordMeta>[] = [];
    const path: number[] = [startNode];
    let hopCount = 0;

    const getNode = (hash: number) => {
      const node = nodes.find((entry) => entry.hash === hash);
      if (!node) throw new Error(`Unknown Chord node ${hash}`);
      return node;
    };

    const setHighlight = (...hashes: number[]) => {
      nodes.forEach((node) => {
        node.isHighlighted = hashes.includes(node.hash);
      });
    };

    const syncDetails = () => {
      nodes.forEach((node) => {
        node.details = buildNodeDetails(node);
      });
    };

    const pushStep = (
      line: number,
      phase: ChordPhase,
      title: string,
      note: string,
      activeMessage?: ChordMessage,
    ) => {
      syncDetails();
      eventLog.push(note);
      const meta: ChordMeta = {
        phase,
        title,
        m: config.m,
        ringSize,
        key,
        startNode,
        responsibleNode,
        hopCount,
        nodes: nodes.map((node) => ({ ...node, fingerTable: node.fingerTable.map((entry) => ({ ...entry })), details: node.details.map((detail) => ({ ...detail })) })),
        activeMessage,
        path: [...path],
        eventLog: eventLog.slice(-5),
      };

      steps.push({
        array: [],
        line,
        metrics: baseMetrics(hopCount),
        note,
        meta,
        inspector: createInspector(meta),
      });
    };

    let currentHash = startNode;
    getNode(currentHash).status = `Lookup key ${key}`;
    setHighlight(currentHash);
    pushStep(
      2,
      "route",
      "Start Lookup",
      `Node ${currentHash} starts a lookup for key ${key}.`,
    );

    while (true) {
      const current = getNode(currentHash);
      current.status = `Inspect successor ${current.successor}`;
      setHighlight(current.hash, current.successor);

      if (inInterval(key, current.hash, current.successor, ringSize, true)) {
        getNode(current.successor).status = `Responsible for ${key}`;
        pushStep(
          3,
          "found",
          "Responsible Node Found",
          `Key ${key} lies between ${current.hash} and ${current.successor}, so node ${current.successor} is responsible.`,
          {
            id: `lookup-${hopCount}`,
            from: `N${current.hash}`,
            to: `N${current.successor}`,
            kind: "lookup",
            key,
            state: "delivered",
          },
        );
        break;
      }

      const nextHash = closestPrecedingFinger(current, key, ringSize);
      hopCount += 1;
      path.push(nextHash);
      current.status = `Forward via finger to ${nextHash}`;
      getNode(nextHash).status = `Received lookup ${key}`;
      setHighlight(current.hash, nextHash);

      pushStep(
        4,
        "route",
        "Forward Lookup",
        `Node ${current.hash} forwards the lookup toward ${nextHash} using its closest preceding finger.`,
        {
          id: `lookup-${current.hash}-${nextHash}-${hopCount}`,
          from: `N${current.hash}`,
          to: `N${nextHash}`,
          kind: "lookup",
          key,
          state: "delivered",
        },
      );

      currentHash = nextHash;

      if (hopCount > nodeIds.length + config.m) {
        break;
      }
    }

    return steps;
  },
};
