import type { Metrics, Step, StepInspectorItem } from "../types";

export type RdtRole = "sender" | "channel" | "receiver";
export type RdtPhase = "idle" | "send" | "deliver" | "ack" | "timeout" | "done";

export type RdtNodeState = {
  id: string;
  label: string;
  role: RdtRole;
  status: string;
  details: Array<{
    label: string;
    value: string | number;
  }>;
  isHighlighted?: boolean;
};

export type RdtPacketState = "in-flight" | "delivered" | "lost" | "corrupt";

export type RdtPacket = {
  id: string;
  from: string;
  to: string;
  kind: "data" | "ack" | "timeout";
  seq: 0 | 1;
  payload?: string;
  ackFor?: 0 | 1;
  checksumOk?: boolean;
  state: RdtPacketState;
};

export type RdtMeta = {
  phase: RdtPhase;
  title: string;
  message: string;
  senderSeq: 0 | 1;
  receiverExpectedSeq: 0 | 1;
  deliveredMessage: string;
  transmissionCount: number;
  ackCount: number;
  retransmissionCount: number;
  nodes: RdtNodeState[];
  activePacket?: RdtPacket;
  eventLog: string[];
};

export type RdtScenarioId = "clean" | "lost-data" | "corrupt-ack";

type RdtScenario = {
  id: RdtScenarioId;
  name: string;
  description: string;
  message: string;
  controls: RdtConfig;
};

export type RdtConfig = {
  message: string;
  senderSeq: 0 | 1;
  receiverExpectedSeq: 0 | 1;
  dropFirstData: boolean;
  corruptFirstData: boolean;
  dropFirstAck: boolean;
  corruptFirstAck: boolean;
};

export const RDT30_PSEUDOCODE = [
  "sender makes packet(seq, data, checksum)",
  "sender transmits packet and starts timer",
  "receiver checks checksum and expected seq",
  "if packet is valid and expected, deliver data and send ACK(seq)",
  "if packet is corrupt or unexpected, resend ACK for last good packet",
  "if sender gets valid ACK(seq), stop timer and advance sequence number",
  "if ACK is lost/corrupt or timer expires, retransmit current packet",
];

export const RDT30_SCENARIOS: Record<RdtScenarioId, RdtScenario> = {
  clean: {
    id: "clean",
    name: "Clean Transfer",
    description: "One packet arrives correctly, the receiver ACKs it, and the sender advances.",
    message: "HELLO",
    controls: {
      message: "HELLO",
      senderSeq: 0,
      receiverExpectedSeq: 0,
      dropFirstData: false,
      corruptFirstData: false,
      dropFirstAck: false,
      corruptFirstAck: false,
    },
  },
  "lost-data": {
    id: "lost-data",
    name: "Lost Data Packet",
    description: "The first data packet is lost, so the sender times out and retransmits.",
    message: "HELLO",
    controls: {
      message: "HELLO",
      senderSeq: 0,
      receiverExpectedSeq: 0,
      dropFirstData: true,
      corruptFirstData: false,
      dropFirstAck: false,
      corruptFirstAck: false,
    },
  },
  "corrupt-ack": {
    id: "corrupt-ack",
    name: "Corrupted ACK",
    description: "The receiver gets the data, but the first ACK is corrupted, forcing a retransmission.",
    message: "HELLO",
    controls: {
      message: "HELLO",
      senderSeq: 0,
      receiverExpectedSeq: 0,
      dropFirstData: false,
      corruptFirstData: false,
      dropFirstAck: false,
      corruptFirstAck: true,
    },
  },
};

function buildNodeDetails(args: {
  role: RdtRole;
  message: string;
  senderSeq: 0 | 1;
  receiverExpectedSeq: 0 | 1;
  deliveredMessage: string;
  transmissionCount: number;
  ackCount: number;
  retransmissionCount: number;
}) {
  if (args.role === "sender") {
    return [
      { label: "Message", value: args.message },
      { label: "Seq", value: args.senderSeq },
      { label: "Transmits", value: args.transmissionCount },
      { label: "Retries", value: args.retransmissionCount },
    ];
  }

  if (args.role === "receiver") {
    return [
      { label: "Expected Seq", value: args.receiverExpectedSeq },
      { label: "Delivered", value: args.deliveredMessage || "--" },
      { label: "ACKs", value: args.ackCount },
    ];
  }

  return [
    { label: "Mode", value: "Loss / corruption simulation" },
    { label: "State", value: "Unreliable transport" },
  ];
}

export function createRdtConfig(scenarioId: RdtScenarioId): RdtConfig {
  const scenario = RDT30_SCENARIOS[scenarioId];
  return {
    ...scenario.controls,
  };
}

function createNodes(meta: Omit<RdtMeta, "phase" | "title" | "eventLog" | "activePacket">): RdtNodeState[] {
  return [
    {
      id: "S",
      label: "Sender",
      role: "sender",
      status: "Ready",
      details: buildNodeDetails({
        role: "sender",
        message: meta.message,
        senderSeq: meta.senderSeq,
        receiverExpectedSeq: meta.receiverExpectedSeq,
        deliveredMessage: meta.deliveredMessage,
        transmissionCount: meta.transmissionCount,
        ackCount: meta.ackCount,
        retransmissionCount: meta.retransmissionCount,
      }),
    },
    {
      id: "C",
      label: "Channel",
      role: "channel",
      status: "Unreliable",
      details: buildNodeDetails({
        role: "channel",
        message: meta.message,
        senderSeq: meta.senderSeq,
        receiverExpectedSeq: meta.receiverExpectedSeq,
        deliveredMessage: meta.deliveredMessage,
        transmissionCount: meta.transmissionCount,
        ackCount: meta.ackCount,
        retransmissionCount: meta.retransmissionCount,
      }),
    },
    {
      id: "R",
      label: "Receiver",
      role: "receiver",
      status: "Waiting",
      details: buildNodeDetails({
        role: "receiver",
        message: meta.message,
        senderSeq: meta.senderSeq,
        receiverExpectedSeq: meta.receiverExpectedSeq,
        deliveredMessage: meta.deliveredMessage,
        transmissionCount: meta.transmissionCount,
        ackCount: meta.ackCount,
        retransmissionCount: meta.retransmissionCount,
      }),
    },
  ];
}

function createInspector(meta: RdtMeta): StepInspectorItem[] {
  return [
    { label: "Phase", value: meta.phase.toUpperCase(), tone: "accent" },
    { label: "Sender Seq", value: meta.senderSeq },
    { label: "Receiver Expect", value: meta.receiverExpectedSeq },
    { label: "Delivered", value: meta.deliveredMessage || null, tone: meta.deliveredMessage ? "success" : "default" },
    { label: "Data Packets", value: meta.transmissionCount },
    { label: "ACK Packets", value: meta.ackCount },
    { label: "Retransmits", value: meta.retransmissionCount, tone: meta.retransmissionCount ? "warning" : "default" },
  ];
}

function baseMetrics(transmissionCount: number, ackCount: number): Metrics {
  return {
    comparisons: transmissionCount + ackCount,
    swaps: 0,
  };
}

export function createRdtPreviewMeta(config: RdtConfig): RdtMeta {
  const message = config.message.trim() || "HELLO";
  const base = {
    message,
    senderSeq: config.senderSeq,
    receiverExpectedSeq: config.receiverExpectedSeq,
    deliveredMessage: "",
    transmissionCount: 0,
    ackCount: 0,
    retransmissionCount: 0,
  };

  return {
    phase: "idle",
    title: "Ready to Run",
    ...base,
    nodes: createNodes(base),
    eventLog: [
      "Configure loss or corruption, then press play to simulate one RDT 3.0 transfer.",
      "RDT 3.0 uses sequence numbers, ACKs, and timeouts to survive an unreliable channel.",
    ],
  };
}

export const Rdt30 = {
  pseudocode: RDT30_PSEUDOCODE,
  scenarios: RDT30_SCENARIOS,
  createConfig: createRdtConfig,
  previewMeta: createRdtPreviewMeta,
  generateSteps(config: RdtConfig): Step<RdtMeta>[] {
    const message = config.message.trim() || "HELLO";
    let senderSeq: 0 | 1 = config.senderSeq;
    let receiverExpectedSeq: 0 | 1 = config.receiverExpectedSeq;
    let deliveredMessage = "";
    let transmissionCount = 0;
    let ackCount = 0;
    let retransmissionCount = 0;
    let firstDataAttempt = true;
    let firstAckAttempt = true;
    const eventLog: string[] = [];
    const steps: Step<RdtMeta>[] = [];

    const makeMeta = (
      phase: RdtPhase,
      title: string,
      activePacket?: RdtPacket,
    ): RdtMeta => {
      const base = {
        message,
        senderSeq,
        receiverExpectedSeq,
        deliveredMessage,
        transmissionCount,
        ackCount,
        retransmissionCount,
      };
      const nodes = createNodes(base);
      const sender = nodes.find((node) => node.id === "S");
      const channel = nodes.find((node) => node.id === "C");
      const receiver = nodes.find((node) => node.id === "R");

      if (phase === "send" || phase === "timeout") {
        if (sender) sender.status = activePacket?.kind === "timeout" ? "Timeout fired" : `Sending seq ${senderSeq}`;
        if (channel) channel.status = activePacket?.state === "lost" ? "Packet lost" : activePacket?.state === "corrupt" ? "Packet corrupted" : "Packet in transit";
        if (receiver) receiver.status = "Waiting for data";
      }

      if (phase === "deliver") {
        if (sender) sender.status = "Waiting for ACK";
        if (channel) channel.status = activePacket?.state === "corrupt" ? "Corrupted data arrived" : "Delivered to receiver";
        if (receiver) {
          receiver.status =
            activePacket?.state === "corrupt"
              ? "Data corrupt"
              : deliveredMessage
                ? `Delivered seq ${activePacket?.seq ?? receiverExpectedSeq}`
                : "Duplicate / invalid packet";
        }
      }

      if (phase === "ack") {
        if (sender) {
          sender.status =
            activePacket?.state === "corrupt"
              ? "ACK corrupt"
              : activePacket?.state === "lost"
                ? "ACK lost"
                : "ACK received";
        }
        if (channel) channel.status = activePacket?.state === "lost" ? "ACK lost" : activePacket?.state === "corrupt" ? "ACK corrupted" : "ACK in transit";
        if (receiver) receiver.status = "ACK sent";
      }

      if (phase === "done") {
        if (sender) sender.status = `Advanced to seq ${senderSeq}`;
        if (channel) channel.status = "Transfer complete";
        if (receiver) receiver.status = `Delivered ${deliveredMessage}`;
      }

      if (phase === "idle" && channel) channel.status = "Unreliable";

      return {
        phase,
        title,
        ...base,
        nodes: nodes,
        activePacket,
        eventLog: eventLog.slice(-5),
      };
    };

    const pushStep = (
      line: number,
      phase: RdtPhase,
      title: string,
      note: string,
      activePacket?: RdtPacket,
    ) => {
      eventLog.push(note);
      const meta = makeMeta(phase, title, activePacket);
      steps.push({
        array: [],
        line,
        metrics: baseMetrics(transmissionCount, ackCount),
        note,
        meta,
        inspector: createInspector(meta),
      });
    };

    const sendDataAttempt = (isRetry: boolean) => {
      transmissionCount += 1;
      if (isRetry) retransmissionCount += 1;

      const shouldDrop = firstDataAttempt && config.dropFirstData;
      const shouldCorrupt = firstDataAttempt && config.corruptFirstData;
      firstDataAttempt = false;

      pushStep(
        0,
        "send",
        isRetry ? "Retransmit Data Packet" : "Send Data Packet",
        isRetry
          ? `The sender retransmits seq ${senderSeq} after not receiving a valid ACK.`
          : `The sender creates packet(seq=${senderSeq}, data=${message}) and sends it.`,
        {
          id: `data-${transmissionCount}`,
          from: "S",
          to: "R",
          kind: "data",
          seq: senderSeq,
          payload: message,
          checksumOk: !shouldCorrupt,
          state: shouldDrop ? "lost" : shouldCorrupt ? "corrupt" : "in-flight",
        },
      );

      if (shouldDrop) {
        pushStep(
          6,
          "timeout",
          "Timeout and Retransmit",
          "The packet is lost in the channel, so the sender times out and must retransmit.",
          {
            id: `timeout-${transmissionCount}`,
            from: "S",
            to: "S",
            kind: "timeout",
            seq: senderSeq,
            state: "lost",
          },
        );
        sendDataAttempt(true);
        return;
      }

      if (shouldCorrupt) {
        pushStep(
          2,
          "deliver",
          "Corrupted Data Arrives",
          "The receiver detects a checksum error and discards the data.",
          {
            id: `data-${transmissionCount}`,
            from: "S",
            to: "R",
            kind: "data",
            seq: senderSeq,
            payload: message,
            checksumOk: false,
            state: "corrupt",
          },
        );
        pushStep(
          6,
          "timeout",
          "Timeout and Retransmit",
          "Because the sender does not get a usable ACK, its timer expires and it retransmits.",
          {
            id: `timeout-${transmissionCount}`,
            from: "S",
            to: "S",
            kind: "timeout",
            seq: senderSeq,
            state: "lost",
          },
        );
        sendDataAttempt(true);
        return;
      }

      deliveredMessage = message;
      receiverExpectedSeq = senderSeq === 0 ? 1 : 0;

      pushStep(
        3,
        "deliver",
        "Receiver Delivers Data",
        `The receiver gets seq ${senderSeq}, verifies the checksum, and delivers ${message}.`,
        {
          id: `data-${transmissionCount}`,
          from: "S",
          to: "R",
          kind: "data",
          seq: senderSeq,
          payload: message,
          checksumOk: true,
          state: "delivered",
        },
      );

      ackCount += 1;
      const shouldDropAck = firstAckAttempt && config.dropFirstAck;
      const shouldCorruptAck = firstAckAttempt && config.corruptFirstAck;
      firstAckAttempt = false;

      pushStep(
        4,
        "ack",
        "Receiver Sends ACK",
        `The receiver sends ACK(${senderSeq}) back to the sender.`,
        {
          id: `ack-${ackCount}`,
          from: "R",
          to: "S",
          kind: "ack",
          seq: senderSeq,
          ackFor: senderSeq,
          checksumOk: !shouldCorruptAck,
          state: shouldDropAck ? "lost" : shouldCorruptAck ? "corrupt" : "in-flight",
        },
      );

      if (shouldDropAck || shouldCorruptAck) {
        pushStep(
          6,
          "timeout",
          "Timeout and Retransmit",
          shouldDropAck
            ? "The ACK is lost, so the sender times out and retransmits the same sequence number."
            : "The ACK is corrupted, so the sender ignores it and retransmits after a timeout.",
          {
            id: `timeout-ack-${ackCount}`,
            from: "S",
            to: "S",
            kind: "timeout",
            seq: senderSeq,
            state: shouldDropAck ? "lost" : "corrupt",
          },
        );
        deliveredMessage = message;
        sendDataAttempt(true);
        return;
      }

      senderSeq = senderSeq === 0 ? 1 : 0;
      pushStep(
        5,
        "done",
        "ACK Received",
        `The sender receives a valid ACK(${senderSeq === 0 ? 1 : 0}) and advances to the next sequence number.`,
        {
          id: `ack-${ackCount}`,
          from: "R",
          to: "S",
          kind: "ack",
          seq: senderSeq === 0 ? 1 : 0,
          ackFor: senderSeq === 0 ? 1 : 0,
          checksumOk: true,
          state: "delivered",
        },
      );
    };

    pushStep(
      0,
      "idle",
      "Ready",
      "The sender is ready to transmit one packet over an unreliable channel.",
    );

    sendDataAttempt(false);
    return steps;
  },
};
