import type { Metrics, Step, StepInspectorItem } from "../types";

export type PaxosScenarioId = "fresh" | "prior-value" | "split-vote";

export type PaxosRole = "client" | "proposer" | "acceptor" | "learner";
export type PaxosPhase =
  | "idle"
  | "prepare"
  | "promise"
  | "accept"
  | "accepted"
  | "chosen"
  | "failed";

export type PaxosNodeState = {
  id: string;
  label: string;
  role: PaxosRole;
  status: string;
  inboxProposalNumber?: number;
  inboxValue?: string;
  promisedNumber?: number;
  acceptedNumber?: number;
  acceptedValue?: string;
  isOffline?: boolean;
  isHighlighted?: boolean;
  details?: Array<{
    label: string;
    value: string | number;
  }>;
};

export type PaxosMessageState = "in-flight" | "delivered";

export type PaxosMessage = {
  id: string;
  from: string;
  to: string;
  kind: "request" | "prepare" | "promise" | "reject" | "accept" | "accepted" | "learn" | "timeout";
  proposalNumber?: number;
  value?: string;
  state: PaxosMessageState;
};

export type PaxosMeta = {
  phase: PaxosPhase;
  title: string;
  quorumSize: number;
  proposalNumber: number;
  requestedValue: string;
  proposedValue: string;
  chosenValue?: string;
  promiseCount: number;
  acceptedCount: number;
  nodes: PaxosNodeState[];
  activeMessage?: PaxosMessage;
  eventLog: string[];
};

type PaxosScenario = {
  id: PaxosScenarioId;
  name: string;
  description: string;
  proposalNumber: number;
  proposerId: string;
  learnerId: string;
  clientValue: string;
  acceptors: PaxosNodeState[];
};

export type PaxosConfig = {
  scenarioId: PaxosScenarioId;
  proposalNumber: number;
  proposerId: string;
  learnerId: string;
  clientValue: string;
  acceptors: PaxosNodeState[];
};

const QUORUM_SIZE = 3;

// Prebuilt teaching scenarios used to seed the Paxos playground with
// common cases: a clean success, a safety-preserving overwrite, and
// a quorum failure.
export const PAXOS_SCENARIOS: Record<PaxosScenarioId, PaxosScenario> = {
  fresh: {
    id: "fresh",
    name: "Fresh Consensus",
    description: "A clean round where a proposer gets a quorum and chooses the client value.",
    proposalNumber: 11,
    proposerId: "P1",
    learnerId: "L1",
    clientValue: "Order=42",
    acceptors: ["A1", "A2", "A3", "A4", "A5"].map((id) => ({
      id,
      label: id,
      role: "acceptor",
      status: "Waiting",
    })),
  },
  "prior-value": {
    id: "prior-value",
    name: "Prior Accepted Value",
    description: "Two acceptors already remember an older value, so Paxos must carry it forward.",
    proposalNumber: 17,
    proposerId: "P1",
    learnerId: "L1",
    clientValue: "Order=99",
    acceptors: [
      {
        id: "A1",
        label: "A1",
        role: "acceptor",
        status: "Waiting",
        promisedNumber: 8,
        acceptedNumber: 8,
        acceptedValue: "Order=17",
      },
      {
        id: "A2",
        label: "A2",
        role: "acceptor",
        status: "Waiting",
        promisedNumber: 8,
        acceptedNumber: 8,
        acceptedValue: "Order=17",
      },
      {
        id: "A3",
        label: "A3",
        role: "acceptor",
        status: "Waiting",
      },
      {
        id: "A4",
        label: "A4",
        role: "acceptor",
        status: "Waiting",
      },
      {
        id: "A5",
        label: "A5",
        role: "acceptor",
        status: "Waiting",
      },
    ],
  },
  "split-vote": {
    id: "split-vote",
    name: "Split Vote / Failure",
    description: "The proposer cannot gather a quorum of promises, so the round stops safely.",
    proposalNumber: 12,
    proposerId: "P1",
    learnerId: "L1",
    clientValue: "Order=88",
    acceptors: [
      {
        id: "A1",
        label: "A1",
        role: "acceptor",
        status: "Waiting",
        promisedNumber: 20,
      },
      {
        id: "A2",
        label: "A2",
        role: "acceptor",
        status: "Waiting",
      },
      {
        id: "A3",
        label: "A3",
        role: "acceptor",
        status: "Waiting",
      },
      {
        id: "A4",
        label: "A4",
        role: "acceptor",
        status: "Offline",
        isOffline: true,
      },
      {
        id: "A5",
        label: "A5",
        role: "acceptor",
        status: "Offline",
        isOffline: true,
      },
    ],
  },
};

export const PAXOS_PSEUDOCODE = [
  "client sends value v to a proposer",
  "proposer chooses proposal number n",
  "send Prepare(n) to acceptors",
  "wait for Promise replies from a quorum",
  "if any promise reports an accepted value, adopt the highest-numbered one",
  "send Accept(n, value) to acceptors",
  "wait for Accepted replies from a quorum",
  "if quorum accepts, value is chosen and learners are notified",
];

// Creates a shallow copy of each node so the simulator can mutate
// per-step state without altering the original preset/config objects.
// Inputs: an array of Paxos node state objects.
// Outputs: a new array with cloned node records.
function cloneNodes(nodes: PaxosNodeState[]) {
  return nodes.map((node) => ({ ...node }));
}

// Produces the role-specific detail rows displayed inside each network node.
// Inputs: a node plus shared context about the current request/proposal/chosen value.
// Outputs: a list of label/value pairs for the UI.
function buildNodeDetails(node: PaxosNodeState, context: {
  requestedValue: string;
  proposalNumber: number;
  proposedValue: string;
  chosenValue?: string;
}) {
  if (node.role === "client") {
    return [{ label: "Request", value: context.requestedValue }];
  }

  if (node.role === "proposer") {
    return [
      { label: "Proposal #", value: context.proposalNumber },
      { label: "Value", value: context.proposedValue },
    ];
  }

  if (node.role === "acceptor") {
    return [
      { label: "Inbox #", value: node.inboxProposalNumber ?? "--" },
      { label: "Inbox Value", value: node.inboxValue ?? "--" },
      { label: "Promised", value: node.promisedNumber ?? "--" },
      { label: "Accepted #", value: node.acceptedNumber ?? "--" },
      { label: "Accepted", value: node.acceptedValue ?? "--" },
    ];
  }

  return [{ label: "Learned", value: context.chosenValue ?? "--" }];
}

// Builds an editable Paxos configuration from one of the canned scenarios.
// Inputs: the scenario id to load.
// Outputs: a mutable PaxosConfig that the page can tweak before running.
export function createPaxosConfig(scenarioId: PaxosScenarioId): PaxosConfig {
  const scenario = PAXOS_SCENARIOS[scenarioId];
  const requestedValue = scenario.clientValue;
  const proposalNumber = scenario.proposalNumber;
  return {
    scenarioId,
    proposalNumber: scenario.proposalNumber,
    proposerId: scenario.proposerId,
    learnerId: scenario.learnerId,
    clientValue: scenario.clientValue,
    acceptors: cloneNodes(scenario.acceptors).map((acceptor) => ({
      ...acceptor,
      status: acceptor.isOffline ? "Offline" : "Waiting",
      details: buildNodeDetails(acceptor, {
        requestedValue,
        proposalNumber,
        proposedValue: requestedValue,
      }),
    })),
  };
}

// Generates the inspector sidebar values for a single playback step.
// Inputs: the full meta snapshot for the current step.
// Outputs: inspector rows with labels, values, and emphasis tones.
function createInspector(meta: PaxosMeta): StepInspectorItem[] {
  return [
    { label: "Phase", value: meta.phase.toUpperCase(), tone: "accent" },
    { label: "Proposal #", value: meta.proposalNumber },
    { label: "Quorum", value: `${meta.quorumSize} / ${meta.nodes.filter((n) => n.role === "acceptor").length}` },
    { label: "Promises", value: meta.promiseCount, tone: meta.promiseCount >= meta.quorumSize ? "success" : "warning" },
    { label: "Accepted", value: meta.acceptedCount, tone: meta.acceptedCount >= meta.quorumSize ? "success" : "warning" },
    { label: "Requested Value", value: meta.requestedValue },
    { label: "Proposed Value", value: meta.proposedValue, tone: meta.proposedValue !== meta.requestedValue ? "warning" : "default" },
    { label: "Chosen Value", value: meta.chosenValue ?? null, tone: meta.chosenValue ? "success" : "default" },
  ];
}

// Converts the running message count into the shared metrics shape
// used elsewhere in the app.
// Inputs: the number of simulated messages/events delivered so far.
// Outputs: a Metrics object for the player panels.
function baseMetrics(messageCount: number): Metrics {
  return {
    comparisons: messageCount,
    swaps: 0,
  };
}

// Assembles the full node list used by the visualizer for a run:
// client, proposer, acceptors, and learner.
// Inputs: the current config and sanitized acceptor nodes.
// Outputs: a complete array of network nodes with role-specific details.
function scenarioNodes(config: PaxosConfig, acceptors: PaxosNodeState[]): PaxosNodeState[] {
  const requestedValue = config.clientValue.trim() || "Value";
  const proposalNumber = Math.max(1, Math.floor(config.proposalNumber || 1));
  const detailContext = {
    requestedValue,
    proposalNumber,
    proposedValue: requestedValue,
  };

  return [
    {
      id: "C1",
      label: "Client",
      role: "client",
      status: "Request ready",
      details: buildNodeDetails(
        {
          id: "C1",
          label: "Client",
          role: "client",
          status: "Request ready",
        },
        detailContext,
      ),
    },
    {
      id: config.proposerId,
      label: config.proposerId,
      role: "proposer",
      status: "Idle",
      details: buildNodeDetails(
        {
          id: config.proposerId,
          label: config.proposerId,
          role: "proposer",
          status: "Idle",
        },
        detailContext,
      ),
    },
    ...acceptors.map((acceptor) => ({
      ...acceptor,
      details: buildNodeDetails(acceptor, detailContext),
    })),
    {
      id: config.learnerId,
      label: config.learnerId,
      role: "learner",
      status: "Waiting",
      details: buildNodeDetails(
        {
          id: config.learnerId,
          label: config.learnerId,
          role: "learner",
          status: "Waiting",
        },
        detailContext,
      ),
    },
  ];
}

// Builds a static "before playback" snapshot so the diagram can show
// current node settings even before the first step is generated.
// Inputs: the current editable Paxos configuration.
// Outputs: a PaxosMeta preview object for the visualizer.
function createPreviewMeta(config: PaxosConfig): PaxosMeta {
  const acceptors = config.acceptors.map(sanitizeAcceptor);
  const nodes = scenarioNodes(config, acceptors);

  return {
    phase: "idle",
    title: "Ready to Run",
    quorumSize: QUORUM_SIZE,
    proposalNumber: Math.max(1, Math.floor(config.proposalNumber || 1)),
    requestedValue: config.clientValue.trim() || "Value",
    proposedValue: config.clientValue.trim() || "Value",
    promiseCount: 0,
    acceptedCount: 0,
    nodes,
    eventLog: [
      "Adjust node state, then press play to animate the Paxos round.",
      "Offline acceptors will time out and preloaded accepted values can force the proposer to adopt an older value.",
    ],
  };
}

// Normalizes user-edited acceptor state so the simulator can safely
// reason about numbers, blank values, and offline nodes.
// Inputs: one acceptor node from the editable configuration.
// Outputs: a sanitized acceptor with cleaned numeric/value fields.
function sanitizeAcceptor(acceptor: PaxosNodeState): PaxosNodeState {
  const promisedNumber =
    acceptor.promisedNumber === undefined || Number.isNaN(acceptor.promisedNumber)
      ? undefined
      : acceptor.promisedNumber;

  const acceptedNumber =
    acceptor.acceptedNumber === undefined || Number.isNaN(acceptor.acceptedNumber)
      ? undefined
      : acceptor.acceptedNumber;

  const acceptedValue = acceptor.acceptedValue?.trim() ? acceptor.acceptedValue.trim() : undefined;
  const inboxValue = acceptor.inboxValue?.trim() ? acceptor.inboxValue.trim() : undefined;

  return {
    ...acceptor,
    inboxProposalNumber:
      acceptor.inboxProposalNumber === undefined || Number.isNaN(acceptor.inboxProposalNumber)
        ? undefined
        : acceptor.inboxProposalNumber,
    inboxValue,
    promisedNumber,
    acceptedNumber,
    acceptedValue,
    status: acceptor.isOffline ? "Offline" : "Waiting",
    details: buildNodeDetails(
      {
        ...acceptor,
        promisedNumber,
        acceptedNumber,
        acceptedValue,
      },
      {
        requestedValue: acceptor.acceptedValue?.trim() || "Value",
        proposalNumber: promisedNumber ?? acceptedNumber ?? 1,
        proposedValue: acceptedValue ?? "Value",
      },
    ),
  };
}

export const Paxos = {
  pseudocode: PAXOS_PSEUDOCODE,
  scenarios: PAXOS_SCENARIOS,
  createConfig: createPaxosConfig,
  previewMeta: createPreviewMeta,
  // Simulates one Paxos round and records every visible state transition
  // as a sequence of player steps for the UI.
  // Inputs: an editable Paxos configuration describing the round to run.
  // Outputs: an ordered array of Step<PaxosMeta> snapshots for playback.
  generateSteps(config: PaxosConfig): Step<PaxosMeta>[] {
    // First normalize the user configuration so later logic can assume
    // proposal numbers and acceptor state are well-formed.
    const sanitizedConfig: PaxosConfig = {
      ...config,
      clientValue: config.clientValue.trim() || "Value",
      proposalNumber: Math.max(1, Math.floor(config.proposalNumber || 1)),
      acceptors: config.acceptors.map(sanitizeAcceptor),
    };

    const acceptors = cloneNodes(sanitizedConfig.acceptors);
    const nodes = scenarioNodes(sanitizedConfig, acceptors);
    const eventLog: string[] = [];
    const steps: Step<PaxosMeta>[] = [];

    let proposedValue = sanitizedConfig.clientValue;
    let promiseCount = 0;
    let acceptedCount = 0;
    let messageCount = 0;
    let chosenValue: string | undefined;

    // Recomputes the per-node detail panels from the current simulation state
    // before a step snapshot is captured.
    // Inputs: none; reads the current local simulation variables.
    // Outputs: none; mutates node.details in place.
    const syncNodeDetails = () => {
      nodes.forEach((node) => {
        node.details = buildNodeDetails(node, {
          requestedValue: sanitizedConfig.clientValue,
          proposalNumber: sanitizedConfig.proposalNumber,
          proposedValue,
          chosenValue,
        });
      });
    };

    // Records one playback frame with all node state, metrics, highlights,
    // and explanatory text needed by the UI.
    // Inputs: the active pseudocode line, step title/note/phase, and optional message.
    // Outputs: none; appends a new Step<PaxosMeta> to the steps array.
    const pushStep = (line: number, title: string, note: string, phase: PaxosPhase, activeMessage?: PaxosMessage) => {
      syncNodeDetails();
      eventLog.push(note);
      const meta: PaxosMeta = {
        phase,
        title,
        quorumSize: QUORUM_SIZE,
        proposalNumber: sanitizedConfig.proposalNumber,
        requestedValue: sanitizedConfig.clientValue,
        proposedValue,
        chosenValue,
        promiseCount,
        acceptedCount,
        nodes: cloneNodes(nodes),
        activeMessage: activeMessage ? { ...activeMessage } : undefined,
        eventLog: eventLog.slice(-5),
      };

      steps.push({
        array: [],
        line,
        metrics: baseMetrics(messageCount),
        note,
        meta,
        inspector: createInspector(meta),
      });
    };

    // Retrieves a mutable node object by id from the current simulation.
    // Inputs: a node id such as C1, P1, A1, or L1.
    // Outputs: the matching PaxosNodeState reference.
    const getNode = (id: string) => {
      const node = nodes.find((entry) => entry.id === id);
      if (!node) throw new Error(`Unknown node ${id}`);
      return node;
    };

    // Marks the nodes that should be visually emphasized in the current step.
    // Inputs: any number of node ids to highlight.
    // Outputs: none; mutates the node highlight flags in place.
    const setHighlight = (...ids: string[]) => {
      nodes.forEach((node) => {
        node.isHighlighted = ids.includes(node.id);
      });
    };

    // Captures a message delivery event as a visible playback step.
    // Inputs: step metadata plus the message being shown and highlighted nodes.
    // Outputs: none; increments message count and appends a step.
    const deliverMessage = (
      line: number,
      title: string,
      note: string,
      phase: PaxosPhase,
      message: PaxosMessage,
      highlightedIds: string[],
    ) => {
      setHighlight(...highlightedIds);
      messageCount += 1;
      pushStep(line, title, note, phase, {
        ...message,
        state: "delivered",
      });
    };

    // Step 1: the client asks the proposer to replicate a value.
    setHighlight("C1", sanitizedConfig.proposerId);
    getNode("C1").status = "Sent request";
    getNode(sanitizedConfig.proposerId).status = `Received ${sanitizedConfig.clientValue}`;
    deliverMessage(
      0,
      "Client Request",
      `The client asks ${sanitizedConfig.proposerId} to replicate ${sanitizedConfig.clientValue}.`,
      "idle",
      {
        id: "request",
        from: "C1",
        to: sanitizedConfig.proposerId,
        kind: "request",
        value: sanitizedConfig.clientValue,
        state: "in-flight",
      },
      ["C1", sanitizedConfig.proposerId],
    );

    // Step 2: the proposer commits to a proposal number for this round.
    getNode(sanitizedConfig.proposerId).status = `Proposal #${sanitizedConfig.proposalNumber}`;
    pushStep(
      1,
      "Choose Proposal Number",
      `${sanitizedConfig.proposerId} starts a new Paxos round with proposal number ${sanitizedConfig.proposalNumber}.`,
      "prepare",
    );

    // Step 3: send Prepare(n) to every acceptor and collect promise/reject outcomes.
    acceptors.forEach((acceptor) => {
      getNode(sanitizedConfig.proposerId).status = `Prepare -> ${acceptor.id}`;

      if (acceptor.isOffline) {
        // Offline nodes visibly receive nothing useful and later time out.
        acceptor.status = "Offline";
        acceptor.inboxProposalNumber = undefined;
        acceptor.inboxValue = undefined;
        deliverMessage(
          2,
          "Prepare Sent",
          `${sanitizedConfig.proposerId} sends Prepare(${sanitizedConfig.proposalNumber}) to ${acceptor.id}, but the node is offline.`,
          "prepare",
          {
            id: `prepare-${acceptor.id}`,
            from: sanitizedConfig.proposerId,
            to: acceptor.id,
            kind: "prepare",
            proposalNumber: sanitizedConfig.proposalNumber,
            state: "in-flight",
          },
          [sanitizedConfig.proposerId, acceptor.id],
        );

        deliverMessage(
          3,
          "No Promise",
          `${acceptor.id} times out, so it does not contribute to the quorum.`,
          "promise",
          {
            id: `timeout-${acceptor.id}`,
            from: acceptor.id,
            to: sanitizedConfig.proposerId,
            kind: "timeout",
            proposalNumber: sanitizedConfig.proposalNumber,
            state: "in-flight",
          },
          [sanitizedConfig.proposerId, acceptor.id],
        );
        return;
      }

      // Online nodes immediately show that they are processing the prepare.
      acceptor.status = `Received Prepare #${sanitizedConfig.proposalNumber}`;
      acceptor.inboxProposalNumber = sanitizedConfig.proposalNumber;
      acceptor.inboxValue = undefined;
      deliverMessage(
        2,
        "Prepare Sent",
        `${sanitizedConfig.proposerId} sends Prepare(${sanitizedConfig.proposalNumber}) to ${acceptor.id}.`,
        "prepare",
        {
          id: `prepare-${acceptor.id}`,
          from: sanitizedConfig.proposerId,
          to: acceptor.id,
          kind: "prepare",
          proposalNumber: sanitizedConfig.proposalNumber,
          state: "in-flight",
        },
        [sanitizedConfig.proposerId, acceptor.id],
      );

      if ((acceptor.promisedNumber ?? -1) >= sanitizedConfig.proposalNumber) {
        acceptor.status = `Rejects ${sanitizedConfig.proposalNumber}`;
        deliverMessage(
          3,
          "Promise Rejected",
          `${acceptor.id} has already promised a higher proposal, so it rejects this prepare.`,
          "promise",
          {
            id: `reject-${acceptor.id}`,
            from: acceptor.id,
            to: sanitizedConfig.proposerId,
            kind: "reject",
            proposalNumber: acceptor.promisedNumber,
            state: "in-flight",
          },
          [sanitizedConfig.proposerId, acceptor.id],
        );
        return;
      }

      // A valid promise updates the highest promised proposal number on the acceptor.
      acceptor.promisedNumber = sanitizedConfig.proposalNumber;
      acceptor.inboxProposalNumber = sanitizedConfig.proposalNumber;
      acceptor.status = `Promised ${sanitizedConfig.proposalNumber}`;
      promiseCount += 1;

      const priorValueNote =
        acceptor.acceptedValue && acceptor.acceptedNumber !== undefined
          ? ` and reports prior accepted value ${acceptor.acceptedValue} @ ${acceptor.acceptedNumber}`
          : "";

      deliverMessage(
        3,
        "Promise Received",
        `${acceptor.id} promises proposal ${sanitizedConfig.proposalNumber}${priorValueNote}.`,
        "promise",
        {
          id: `promise-${acceptor.id}`,
          from: acceptor.id,
          to: sanitizedConfig.proposerId,
          kind: "promise",
          proposalNumber: sanitizedConfig.proposalNumber,
          value: acceptor.acceptedValue,
          state: "in-flight",
        },
        [sanitizedConfig.proposerId, acceptor.id],
      );
    });

    // If too few promises arrive, the round ends without risking safety.
    if (promiseCount < QUORUM_SIZE) {
      setHighlight(sanitizedConfig.proposerId);
      getNode(sanitizedConfig.proposerId).status = "Round failed";
      pushStep(
        3,
        "Prepare Phase Failed",
        `${sanitizedConfig.proposerId} only collected ${promiseCount} promises, which is not enough for a quorum of ${QUORUM_SIZE}.`,
        "failed",
      );
      return steps;
    }

    // Paxos safety rule: if any promise reports an already-accepted value,
    // the proposer must carry forward the highest-numbered one.
    const highestAccepted = acceptors
      .filter((acceptor) => acceptor.acceptedValue && acceptor.acceptedNumber !== undefined)
      .sort((a, b) => (b.acceptedNumber ?? 0) - (a.acceptedNumber ?? 0))[0];

    if (highestAccepted?.acceptedValue) {
      proposedValue = highestAccepted.acceptedValue;
      getNode(sanitizedConfig.proposerId).status = `Adopts ${proposedValue}`;
      setHighlight(sanitizedConfig.proposerId, highestAccepted.id);
      pushStep(
        4,
        "Adopt Highest Accepted Value",
        `${sanitizedConfig.proposerId} must preserve safety, so it switches to ${proposedValue} from ${highestAccepted.id}.`,
        "promise",
      );
    } else {
      getNode(sanitizedConfig.proposerId).status = `Keeps ${proposedValue}`;
      setHighlight(sanitizedConfig.proposerId);
      pushStep(
        4,
        "Keep Client Value",
        `No acceptor reported an older accepted value, so ${sanitizedConfig.proposerId} keeps ${proposedValue}.`,
        "promise",
      );
    }

    // Step 4: send Accept(n, value) to the acceptors using the chosen proposal/value.
    acceptors.forEach((acceptor) => {
      getNode(sanitizedConfig.proposerId).status = `Accept -> ${acceptor.id}`;

      if (acceptor.isOffline) {
        // Offline nodes still cannot participate in the accept phase.
        acceptor.status = "Offline";
        acceptor.inboxProposalNumber = undefined;
        acceptor.inboxValue = undefined;
        deliverMessage(
          5,
          "Accept Sent",
          `${sanitizedConfig.proposerId} sends Accept(${sanitizedConfig.proposalNumber}, ${proposedValue}) to ${acceptor.id}, but the node stays offline.`,
          "accept",
          {
            id: `accept-${acceptor.id}`,
            from: sanitizedConfig.proposerId,
            to: acceptor.id,
            kind: "accept",
            proposalNumber: sanitizedConfig.proposalNumber,
            value: proposedValue,
            state: "in-flight",
          },
          [sanitizedConfig.proposerId, acceptor.id],
        );
        return;
      }

      // Show that the acceptor is evaluating the accept request before replying.
      acceptor.status = `Considering ${proposedValue}`;
      acceptor.inboxProposalNumber = sanitizedConfig.proposalNumber;
      acceptor.inboxValue = proposedValue;
      deliverMessage(
        5,
        "Accept Sent",
        `${sanitizedConfig.proposerId} asks ${acceptor.id} to accept ${proposedValue} for proposal ${sanitizedConfig.proposalNumber}.`,
        "accept",
        {
          id: `accept-${acceptor.id}`,
          from: sanitizedConfig.proposerId,
          to: acceptor.id,
          kind: "accept",
          proposalNumber: sanitizedConfig.proposalNumber,
          value: proposedValue,
          state: "in-flight",
        },
        [sanitizedConfig.proposerId, acceptor.id],
      );

      if ((acceptor.promisedNumber ?? -1) > sanitizedConfig.proposalNumber) {
        acceptor.status = "Rejects accept";
        deliverMessage(
          6,
          "Accept Rejected",
          `${acceptor.id} has moved on to a newer promise and rejects the accept request.`,
          "accepted",
          {
            id: `accept-reject-${acceptor.id}`,
            from: acceptor.id,
            to: sanitizedConfig.proposerId,
            kind: "reject",
            proposalNumber: acceptor.promisedNumber,
            state: "in-flight",
          },
          [sanitizedConfig.proposerId, acceptor.id],
        );
        return;
      }

      // Accepting the proposal stores both the proposal number and the value locally.
      acceptor.promisedNumber = sanitizedConfig.proposalNumber;
      acceptor.acceptedNumber = sanitizedConfig.proposalNumber;
      acceptor.acceptedValue = proposedValue;
      acceptor.inboxProposalNumber = sanitizedConfig.proposalNumber;
      acceptor.inboxValue = proposedValue;
      acceptor.status = `Accepted ${proposedValue}`;
      acceptedCount += 1;

      deliverMessage(
        6,
        "Accepted Reply",
        `${acceptor.id} accepts ${proposedValue} for proposal ${sanitizedConfig.proposalNumber}.`,
        "accepted",
        {
          id: `accepted-${acceptor.id}`,
          from: acceptor.id,
          to: sanitizedConfig.proposerId,
          kind: "accepted",
          proposalNumber: sanitizedConfig.proposalNumber,
          value: proposedValue,
          state: "in-flight",
        },
        [sanitizedConfig.proposerId, acceptor.id],
      );
    });

    // Without a quorum of accepted responses, nothing is chosen yet.
    if (acceptedCount < QUORUM_SIZE) {
      setHighlight(sanitizedConfig.proposerId);
      getNode(sanitizedConfig.proposerId).status = "Accept failed";
      pushStep(
        6,
        "Accept Phase Failed",
        `Only ${acceptedCount} acceptors accepted the value, so the proposal is still not chosen.`,
        "failed",
      );
      return steps;
    }

    // Once a quorum accepts the same value, the proposer can treat it as chosen
    // and notify the learner.
    chosenValue = proposedValue;
    getNode(sanitizedConfig.proposerId).status = `Chosen ${chosenValue}`;
    getNode(sanitizedConfig.learnerId).status = `Learns ${chosenValue}`;
    setHighlight(sanitizedConfig.proposerId, sanitizedConfig.learnerId);
    deliverMessage(
      7,
      "Notify Learner",
      `${sanitizedConfig.proposerId} now has a quorum, so ${chosenValue} is chosen and delivered to the learner.`,
      "chosen",
      {
        id: "learn",
        from: sanitizedConfig.proposerId,
        to: sanitizedConfig.learnerId,
        kind: "learn",
        proposalNumber: sanitizedConfig.proposalNumber,
        value: chosenValue,
        state: "in-flight",
      },
      [sanitizedConfig.proposerId, sanitizedConfig.learnerId],
    );

    return steps;
  },
};
