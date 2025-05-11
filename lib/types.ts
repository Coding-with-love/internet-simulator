export type NodeStatus = "idle" | "active" | "processing" | "error" | "secure"
export type NodeTypes = "computer" | "server" | "dns" | "isp" | "router" | "attacker"
export type Protocol = "tcp" | "udp"
export type PacketStatus = "queued" | "transit" | "delivered" | "lost" | "retransmitting"
export type EventType = "info" | "success" | "error" | "warning"
export type SimulationMode = "http" | "websocket" | "https"

export interface NodeType {
  id: string
  label: string
  type: NodeTypes
  x: number
  y: number
  status: NodeStatus
}

export interface Connection {
  source: string
  target: string
  type: "wired" | "wireless"
}

export interface PacketType {
  id: string
  data: string
  sourceId: string
  targetId: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sequenceNumber: number
  status: PacketStatus
  protocol: Protocol
  latency: number
  retransmission: boolean
  createdAt: number
  encrypted?: boolean
  direction?: "upstream" | "downstream"
}

export interface SimulationEvent {
  time: number
  type: EventType
  message: string
  nodeId?: string
  packetId?: string
}

export interface NodeDetail {
  type: NodeTypes
  description: string
  stats?: Record<string, string | number>
  routingTable?: {
    destination: string
    gateway: string
    interface: string
  }[]
  receivedPackets?: {
    sequenceNumber: number
    data: string
    complete: boolean
  }[]
}

export interface SimulationContextType {
  nodes: NodeType[]
  connections: Connection[]
  packets: PacketType[]
  events: SimulationEvent[]
  isRunning: boolean
  protocol: Protocol
  packetLossRate: number
  simulationSpeed: number
  currentTime: number
  totalDuration: number
  currentExplanation: string
  simulationMode: SimulationMode
  isDDoSActive: boolean
  showQuiz: boolean
  customUrl: string | null
  customMessage: string | null
  startSimulation: () => void
  pauseSimulation: () => void
  resetSimulation: () => void
  setProtocol: (protocol: Protocol) => void
  setPacketLossRate: (rate: number) => void
  setSimulationSpeed: (speed: number) => void
  seekToTime: (time: number) => void
  getNodeDetails: (nodeId: string) => NodeDetail
  setSimulationMode: (mode: SimulationMode) => void
  toggleDDoSAttack: () => void
  setShowQuiz: (show: boolean) => void
  setCustomUrl: (url: string, message: string) => void
}
