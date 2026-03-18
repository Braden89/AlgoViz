import type { AlgorithmDefinition, Step, StepInspectorItem } from "../types";

type TreeNode = {
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

function clone(arr: number[]) {
  return arr.slice();
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function layoutTree(rootId: string | undefined, nodes: Record<string, TreeNode>) {
  let x = 0;

  function inorder(id: string | undefined, depth: number) {
    if (!id) return;
    const n = nodes[id];
    inorder(n.left, depth + 1);
    n.x = x * 70;
    n.y = depth * 80;
    x++;
    inorder(n.right, depth + 1);
  }

  inorder(rootId, 0);
}

function pushStep(
  steps: Step<TreeSortMeta>[],
  arr: number[],
  line: number,
  metrics: Step<TreeSortMeta>["metrics"],
  active?: number[],
  note?: string,
  swap?: [number, number],
  meta?: TreeSortMeta,
  inspector?: StepInspectorItem[]
) {
  steps.push({
    array: clone(arr),
    line,
    active,
    metrics: { ...metrics },
    note,
    swap,
    meta,
    inspector,
  });
}

let idCounter = 0;
const newId = () => `n${idCounter++}`;

export const TreeSort: AlgorithmDefinition<TreeSortMeta> = {
  id: "tree-sort",
  name: "Tree Sort (BST)",
  category: "trees",
  pseudocode: [
    "treeSort(A)",
    "  root = null",
    "  for each x in A:",
    "    root = bstInsert(root, x)",
    "  output = []",
    "  inorder(root, output)",
    "  return output",
    "",
    "bstInsert(node, x)",
    "  if node == null: return new Node(x)",
    "  if x < node.value: node.left = bstInsert(node.left, x)",
    "  else: node.right = bstInsert(node.right, x)",
    "  return node",
    "",
    "inorder(node, output)",
    "  if node == null: return",
    "  inorder(node.left, output)",
    "  output.push(node.value)",
    "  inorder(node.right, output)",
  ],

  generateSteps: (input: number[]) => {
    idCounter = 0;

    const A = clone(input);
    const steps: Step<TreeSortMeta>[] = [];
    const metrics = { comparisons: 0, swaps: 0 };

    let rootId: string | undefined;
    const nodes: Record<string, TreeNode> = {};
    const output: number[] = [];

    const snapshot = (phase: TreeSortMeta["phase"], patch?: Partial<TreeSortMeta>): TreeSortMeta => {
      layoutTree(rootId, nodes);
      return {
        phase,
        tree: { rootId, nodes: deepClone(nodes) },
        output: clone(output),
        ...patch,
      };
    };

    function pathTo(id: string | undefined): string[] {
      const path: string[] = [];
      let cur = id;
      while (cur) {
        path.push(cur);
        cur = nodes[cur]?.parent;
      }
      path.reverse();
      return path;
    }

    const inspectorFor = (
      phase: TreeSortMeta["phase"],
      insertingValue?: number,
      currentNodeId?: string
    ): StepInspectorItem[] => {
      const currentNode = currentNodeId ? nodes[currentNodeId] : undefined;

      return [
        { label: "Phase", value: phase, tone: phase === "done" ? "success" : "accent" },
        { label: "Input Value", value: insertingValue ?? null, tone: "warning" },
        { label: "Current Node", value: currentNode?.value ?? null, tone: "accent" },
        { label: "Root", value: rootId ? nodes[rootId]?.value ?? null : null, tone: "success" },
        { label: "Tree Nodes", value: Object.keys(nodes).length },
        { label: "Output Size", value: output.length, tone: "success" },
      ];
    };

    pushStep(
      steps,
      A,
      0,
      metrics,
      undefined,
      "Start",
      undefined,
      snapshot("insert"),
      inspectorFor("insert")
    );

    pushStep(
      steps,
      A,
      1,
      metrics,
      undefined,
      "root = null",
      undefined,
      snapshot("insert"),
      inspectorFor("insert")
    );

    for (let idx = 0; idx < A.length; idx++) {
      const x = A[idx];
      const activeIdx = [idx];

      const ps = (
        arr: number[],
        line: number,
        note?: string,
        metaPatch?: Partial<TreeSortMeta>
      ) => {
        const currentNodeId = metaPatch?.currentNodeId;
        pushStep(
          steps,
          arr,
          line,
          metrics,
          activeIdx,
          note,
          undefined,
          snapshot("insert", { insertingValue: x, ...metaPatch }),
          inspectorFor("insert", x, currentNodeId)
        );
      };

      ps(A, 2, `for x in A: x = ${x}`);
      ps(A, 3, `bstInsert(root, ${x})`);

      if (!rootId) {
        const id = newId();
        nodes[id] = { id, value: x, parent: undefined };
        rootId = id;

        ps(A, 8, `node == null -> new Node(${x}) (root)`, {
          currentNodeId: id,
          highlightNodeIds: [id],
        });
        continue;
      }

      let curId = rootId;

      while (true) {
        const cur = nodes[curId];

        metrics.comparisons += 1;
        ps(A, 9, `${x} < ${cur.value}?`, {
          currentNodeId: curId,
          highlightNodeIds: [curId],
        });

        if (x < cur.value) {
          if (!cur.left) {
            const id = newId();
            nodes[id] = { id, value: x, parent: curId };
            cur.left = id;

            ps(A, 9, `true -> insert ${x} as LEFT child of ${cur.value}`, {
              currentNodeId: curId,
              highlightNodeIds: [curId, id],
            });
            break;
          }

          ps(A, 9, "true -> go LEFT", {
            currentNodeId: curId,
            highlightNodeIds: [curId, cur.left],
          });
          curId = cur.left;
        } else {
          if (!cur.right) {
            const id = newId();
            nodes[id] = { id, value: x, parent: curId };
            cur.right = id;

            ps(A, 10, `false -> insert ${x} as RIGHT child of ${cur.value}`, {
              currentNodeId: curId,
              highlightNodeIds: [curId, id],
            });
            break;
          }

          ps(A, 10, "false -> go RIGHT", {
            currentNodeId: curId,
            highlightNodeIds: [curId, cur.right],
          });
          curId = cur.right;
        }
      }
    }

    pushStep(
      steps,
      A,
      4,
      metrics,
      undefined,
      "output = []",
      undefined,
      snapshot("traverse"),
      inspectorFor("traverse")
    );
    pushStep(
      steps,
      output,
      5,
      metrics,
      undefined,
      "inorder(root, output)",
      undefined,
      snapshot("traverse"),
      inspectorFor("traverse", undefined, rootId)
    );

    function inorder(id: string | undefined) {
      if (!id) {
        pushStep(
          steps,
          output,
          14,
          metrics,
          undefined,
          "node == null -> return",
          undefined,
          snapshot("traverse"),
          inspectorFor("traverse")
        );
        return;
      }

      const n = nodes[id];

      pushStep(
        steps,
        output,
        15,
        metrics,
        undefined,
        `inorder(left of ${n.value})`,
        undefined,
        snapshot("traverse", { currentNodeId: id, highlightNodeIds: pathTo(id) }),
        inspectorFor("traverse", undefined, id)
      );
      inorder(n.left);

      output.push(n.value);
      pushStep(
        steps,
        output,
        16,
        metrics,
        undefined,
        `output.push(${n.value})`,
        undefined,
        snapshot("traverse", { currentNodeId: id, highlightNodeIds: pathTo(id) }),
        inspectorFor("traverse", undefined, id)
      );

      pushStep(
        steps,
        output,
        17,
        metrics,
        undefined,
        `inorder(right of ${n.value})`,
        undefined,
        snapshot("traverse", { currentNodeId: id, highlightNodeIds: pathTo(id) }),
        inspectorFor("traverse", undefined, id)
      );
      inorder(n.right);
    }

    inorder(rootId);

    pushStep(
      steps,
      output,
      6,
      metrics,
      undefined,
      "Done (output is sorted)",
      undefined,
      snapshot("done"),
      inspectorFor("done")
    );

    return steps;
  },
};
