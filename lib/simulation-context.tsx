"use client"

import React from "react"
import { createContext, useState, useEffect, useRef } from "react"
import type {
  NodeType,
  Connection,
  PacketType,
  SimulationEvent,
  Protocol,
  SimulationContextType,
  SimulationMode,
} from "./types"

// Initial network topology
const initialNodes: NodeType[] = [
  { id: "computer", label: "Your Computer", type: "computer", x: 10, y: 50, status: "idle" },
  { id: "dns", label: "DNS Server", type: "dns", x: 30, y: 20, status: "idle" },
  { id: "isp", label: "ISP", type: "isp", x: 30, y: 50, status: "idle" },
  { id: "router1", label: "Router 1", type: "router", x: 50, y: 40, status: "idle" },
  { id: "router2", label: "Router 2", type: "router", x: 70, y: 60, status: "idle" },
  { id: "server", label: "Web Server", type: "server", x: 90, y: 50, status: "idle" },
]

// DDoS attackers
const attackerNodes: NodeType[] = [
  { id: "attacker1", label: "Attacker 1", type: "attacker", x: 15, y: 15, status: "error" },
  { id: "attacker2", label: "Attacker 2", type: "attacker", x: 15, y: 85, status: "error" },
  { id: "attacker3", label: "Attacker 3", type: "attacker", x: 40, y: 75, status: "error" },
]

const initialConnections: Connection[] = [
  { source: "computer", target: "isp", type: "wired" },
  { source: "isp", target: "dns", type: "wired" },
  { source: "isp", target: "router1", type: "wired" },
  { source: "router1", target: "router2", type: "wired" },
  { source: "router2", target: "server", type: "wired" },
]

// Attacker connections
const attackerConnections: Connection[] = [
  { source: "attacker1", target: "router1", type: "wired" },
  { source: "attacker2", target: "router1", type: "wired" },
  { source: "attacker3", target: "router2", type: "wired" },
]

// Sample message to send
const MESSAGE = "Hello World"

// Define all possible events for HTTP mode
const httpEvents: SimulationEvent[] = [
  { time: 0, type: "info", message: "Simulation ready. Press Start to begin." },
  { time: 0, type: "info", message: "Starting DNS resolution for server.example.com", nodeId: "computer" },
  { time: 500, type: "info", message: "DNS query sent to resolver", nodeId: "dns" },
  { time: 1000, type: "success", message: "DNS resolved: server.example.com -> 203.0.113.42", nodeId: "computer" },
  { time: 1500, type: "info", message: "Initiating TCP handshake (SYN)", nodeId: "computer" },
  { time: 1800, type: "info", message: "Server responds with SYN-ACK", nodeId: "server" },
  { time: 2100, type: "info", message: "Client acknowledges with ACK", nodeId: "computer" },
  { time: 2400, type: "success", message: "TCP connection established", nodeId: "computer" },
  {
    time: 3000,
    type: "info",
    message: `Fragmenting message "${MESSAGE}" into ${MESSAGE.length} packets`,
    nodeId: "computer",
  },
  { time: 4500, type: "error", message: "Packet #4 lost in transmission", nodeId: "router1" },
  { time: 6000, type: "info", message: "TCP detected packet loss, retransmitting packet #4", nodeId: "computer" },
  { time: 6500, type: "error", message: "Packet #8 lost in transmission", nodeId: "router2" },
  { time: 8000, type: "info", message: "TCP detected packet loss, retransmitting packet #8", nodeId: "computer" },
  { time: 9000, type: "info", message: "Server receiving packets", nodeId: "server" },
  { time: 10000, type: "success", message: `Message "${MESSAGE}" successfully reassembled in order`, nodeId: "server" },
  { time: 10000, type: "warning", message: `Message partially reassembled due to packet loss (UDP)`, nodeId: "server" },
  { time: 24900, type: "success", message: "Simulation complete", nodeId: "computer" },
]

// WebSocket specific events
const websocketEvents: SimulationEvent[] = [
  { time: 0, type: "info", message: "Simulation ready. Press Start to begin." },
  { time: 0, type: "info", message: "Starting DNS resolution for ws.example.com", nodeId: "computer" },
  { time: 500, type: "info", message: "DNS query sent to resolver", nodeId: "dns" },
  { time: 1000, type: "success", message: "DNS resolved: ws.example.com -> 203.0.113.42", nodeId: "computer" },
  { time: 1500, type: "info", message: "Initiating TCP handshake (SYN)", nodeId: "computer" },
  { time: 1800, type: "info", message: "Server responds with SYN-ACK", nodeId: "server" },
  { time: 2100, type: "info", message: "Client acknowledges with ACK", nodeId: "computer" },
  { time: 2400, type: "success", message: "TCP connection established", nodeId: "computer" },
  { time: 2600, type: "info", message: "Sending WebSocket upgrade request", nodeId: "computer" },
  { time: 3000, type: "success", message: "WebSocket connection established", nodeId: "server" },
  { time: 3500, type: "info", message: "Client sending message to server", nodeId: "computer" },
  { time: 4500, type: "info", message: "Server receiving client message", nodeId: "server" },
  { time: 5000, type: "info", message: "Server sending message to client", nodeId: "server" },
  { time: 6000, type: "info", message: "Client receiving server message", nodeId: "computer" },
  { time: 7000, type: "info", message: "Full-duplex communication in progress", nodeId: "computer" },
  { time: 8000, type: "info", message: "Server pushing updates without client request", nodeId: "server" },
  { time: 9000, type: "info", message: "Client receiving pushed updates", nodeId: "computer" },
  { time: 10000, type: "info", message: "Client sending message to server", nodeId: "computer" },
  { time: 11000, type: "info", message: "Server receiving client message", nodeId: "server" },
  { time: 12000, type: "info", message: "WebSocket connection maintained", nodeId: "computer" },
  { time: 24900, type: "success", message: "Simulation complete", nodeId: "computer" },
]

// HTTPS/TLS specific events
const httpsEvents: SimulationEvent[] = [
  { time: 0, type: "info", message: "Simulation ready. Press Start to begin." },
  { time: 0, type: "info", message: "Starting DNS resolution for secure.example.com", nodeId: "computer" },
  { time: 500, type: "info", message: "DNS query sent to resolver", nodeId: "dns" },
  { time: 1000, type: "success", message: "DNS resolved: secure.example.com -> 203.0.113.42", nodeId: "computer" },
  { time: 1500, type: "info", message: "Initiating TCP handshake (SYN)", nodeId: "computer" },
  { time: 1800, type: "info", message: "Server responds with SYN-ACK", nodeId: "server" },
  { time: 2100, type: "info", message: "Client acknowledges with ACK", nodeId: "computer" },
  { time: 2400, type: "success", message: "TCP connection established", nodeId: "computer" },
  { time: 2600, type: "info", message: "Initiating TLS handshake", nodeId: "computer" },
  { time: 3000, type: "info", message: "Client Hello with supported cipher suites", nodeId: "computer" },
  { time: 3500, type: "info", message: "Server Hello with selected cipher suite", nodeId: "server" },
  { time: 4000, type: "info", message: "Server sends certificate", nodeId: "server" },
  { time: 4500, type: "info", message: "Client verifies certificate", nodeId: "computer" },
  { time: 5000, type: "info", message: "Client sends key exchange", nodeId: "computer" },
  { time: 5500, type: "info", message: "Server and client generate session keys", nodeId: "server" },
  { time: 6000, type: "success", message: "Secure TLS connection established", nodeId: "computer" },
  { time: 6500, type: "info", message: "Sending encrypted HTTP request", nodeId: "computer" },
  { time: 7500, type: "info", message: "Server decrypts and processes request", nodeId: "server" },
  { time: 8500, type: "info", message: "Server sends encrypted response", nodeId: "server" },
  { time: 9500, type: "info", message: "Client decrypts response", nodeId: "computer" },
  { time: 10000, type: "success", message: "Secure data exchange complete", nodeId: "computer" },
  { time: 24900, type: "success", message: "Simulation complete", nodeId: "computer" },
]

// DDoS attack events
const ddosEvents: SimulationEvent[] = [
  { time: 0, type: "info", message: "Simulation ready. Press Start to begin." },
  { time: 0, type: "warning", message: "Multiple attackers detected on the network", nodeId: "router1" },
  { time: 500, type: "error", message: "High volume of traffic from Attacker 1", nodeId: "attacker1" },
  { time: 1000, type: "error", message: "High volume of traffic from Attacker 2", nodeId: "attacker2" },
  { time: 1500, type: "error", message: "High volume of traffic from Attacker 3", nodeId: "attacker3" },
  { time: 2000, type: "warning", message: "Router 1 experiencing high load", nodeId: "router1" },
  { time: 2500, type: "warning", message: "Router 2 experiencing high load", nodeId: "router2" },
  { time: 3000, type: "error", message: "Server receiving excessive connection requests", nodeId: "server" },
  { time: 3500, type: "warning", message: "Legitimate user connection delayed", nodeId: "computer" },
  { time: 4000, type: "error", message: "Server resources at 70% capacity", nodeId: "server" },
  { time: 5000, type: "error", message: "Server resources at 85% capacity", nodeId: "server" },
  { time: 6000, type: "error", message: "Server resources at 95% capacity", nodeId: "server" },
  { time: 7000, type: "error", message: "Server unresponsive to new connections", nodeId: "server" },
  { time: 8000, type: "warning", message: "Legitimate user request timed out", nodeId: "computer" },
  { time: 9000, type: "info", message: "DDoS mitigation system activated", nodeId: "router2" },
  { time: 10000, type: "info", message: "Filtering suspicious traffic", nodeId: "router1" },
  { time: 11000, type: "info", message: "Blocking traffic from Attacker 1", nodeId: "router1" },
  { time: 12000, type: "info", message: "Blocking traffic from Attacker 2", nodeId: "router1" },
  { time: 13000, type: "info", message: "Blocking traffic from Attacker 3", nodeId: "router2" },
  { time: 14000, type: "info", message: "Server resources recovering", nodeId: "server" },
  { time: 15000, type: "success", message: "Legitimate connection established", nodeId: "computer" },
  { time: 16000, type: "success", message: "Normal service resumed", nodeId: "server" },
  { time: 24900, type: "success", message: "Simulation complete", nodeId: "computer" },
]

// Default context value
const defaultContextValue: SimulationContextType = {
  nodes: initialNodes,
  connections: initialConnections,
  packets: [],
  events: [httpEvents[0]],
  isRunning: false,
  protocol: "tcp",
  packetLossRate: 10,
  simulationSpeed: 0.5,
  currentTime: 0,
  totalDuration: 25000,
  startSimulation: () => {},
  pauseSimulation: () => {},
  resetSimulation: () => {},
  setProtocol: () => {},
  setPacketLossRate: () => {},
  setSimulationSpeed: () => {},
  seekToTime: () => {},
  getNodeDetails: () => ({ type: "computer", description: "" }),
  currentExplanation: "",
  simulationMode: "http",
  setSimulationMode: () => {},
  isDDoSActive: false,
  startDDoSAttack: () => {},
  showQuiz: false,
  setShowQuiz: () => {},
}

// Create context
const SimulationContext = createContext<SimulationContextType>(defaultContextValue)

// Provider component
export function SimulationProvider({ children }: { children: React.ReactNode }) {
  // State
  const [nodes, setNodes] = useState<NodeType[]>(initialNodes)
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [packets, setPackets] = useState<PacketType[]>([])
  const [events, setEvents] = useState<SimulationEvent[]>([httpEvents[0]])
  const [isRunning, setIsRunning] = useState(false)
  const [protocol, setProtocol] = useState<Protocol>("tcp")
  const [packetLossRate, setPacketLossRate] = useState(10)
  const [simulationSpeed, setSimulationSpeed] = useState(0.5)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(25000)
  const [currentExplanation, setCurrentExplanation] = useState("")
  const [simulationMode, setSimulationMode] = useState<SimulationMode>("http")
  const [isDDoSActive, setIsDDoSActive] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)

  // Animation frame reference
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

  // Initialize simulation
  useEffect(() => {
    resetSimulation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset simulation when mode changes
  useEffect(() => {
    resetSimulation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationMode])

  // Reset simulation
  const resetSimulation = () => {
    // Cancel any running animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Reset state
    setIsRunning(false)
    setCurrentTime(0)
    setTotalDuration(25000)
    setCurrentExplanation("")
    setPackets([])
    // Don't reset isDDoSActive here

    // Set initial nodes and connections based on mode
    if (isDDoSActive) {
      setNodes(
        [...initialNodes, ...attackerNodes].map((node) => ({
          ...node,
          status: node.type === "attacker" ? "error" : "idle",
        })),
      )
      setConnections([...initialConnections, ...attackerConnections])
    } else {
      setNodes(initialNodes.map((node) => ({ ...node, status: "idle" })))
      setConnections([...initialConnections])
    }

    // Set initial events based on mode
    let initialEvents: SimulationEvent[] = []
    switch (simulationMode) {
      case "websocket":
        initialEvents = [websocketEvents[0]]
        break
      case "https":
        initialEvents = [httpsEvents[0]]
        break
      default:
        initialEvents = [httpEvents[0]]
    }

    if (isDDoSActive) {
      initialEvents = [ddosEvents[0]]
    }

    setEvents(initialEvents)
  }

  // Start DDoS attack
  const startDDoSAttack = () => {
    // First set the DDoS active state
    setIsDDoSActive(true)

    // Cancel any running animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Reset state
    setIsRunning(false)
    setCurrentTime(0)
    setTotalDuration(25000)
    setCurrentExplanation("Multiple attackers are sending a high volume of traffic to overwhelm the server.")
    setPackets([])

    // Set nodes and connections for DDoS attack
    setNodes(
      [...initialNodes, ...attackerNodes].map((node) => ({
        ...node,
        status: node.type === "attacker" ? "error" : "idle",
      })),
    )
    setConnections([...initialConnections, ...attackerConnections])

    // Set DDoS events
    setEvents([ddosEvents[0]])
  }

  // Add this function to toggle DDoS attack mode
  const toggleDDoSAttack = () => {
    if (isDDoSActive) {
      // Deactivate DDoS mode
      setIsDDoSActive(false)

      // Cancel any running animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      // Reset to normal mode
      setIsRunning(false)
      setCurrentTime(0)
      setTotalDuration(25000)
      setCurrentExplanation("")
      setPackets([])

      // Reset nodes and connections
      setNodes(initialNodes.map((node) => ({ ...node, status: "idle" })))
      setConnections([...initialConnections])

      // Set events based on current simulation mode
      let initialEvents: SimulationEvent[] = []
      switch (simulationMode) {
        case "websocket":
          initialEvents = [websocketEvents[0]]
          break
        case "https":
          initialEvents = [httpsEvents[0]]
          break
        default:
          initialEvents = [httpEvents[0]]
      }
      setEvents(initialEvents)
    } else {
      // Activate DDoS mode (existing code)
      // First set the DDoS active state
      setIsDDoSActive(true)

      // Cancel any running animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      // Reset state
      setIsRunning(false)
      setCurrentTime(0)
      setTotalDuration(25000)
      setCurrentExplanation("Multiple attackers are sending a high volume of traffic to overwhelm the server.")
      setPackets([])

      // Set nodes and connections for DDoS attack
      setNodes(
        [...initialNodes, ...attackerNodes].map((node) => ({
          ...node,
          status: node.type === "attacker" ? "error" : "idle",
        })),
      )
      setConnections([...initialConnections, ...attackerConnections])

      // Set DDoS events
      setEvents([ddosEvents[0]])
    }
  }

  // Start simulation
  const startSimulation = () => {
    console.log("Starting simulation")

    // If already running, do nothing
    if (isRunning) return

    // Set running state
    setIsRunning(true)

    // If simulation was completed, reset it
    if (currentTime >= totalDuration) {
      resetSimulation()
      setIsRunning(true)
    }

    // Set start time
    startTimeRef.current = performance.now() - currentTime
    lastFrameTimeRef.current = performance.now()

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animationLoop)
  }

  // Pause simulation
  const pauseSimulation = () => {
    console.log("Pausing simulation")

    // Set running state
    setIsRunning(false)

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  // Seek to time
  const seekToTime = (time: number) => {
    setCurrentTime(time)
    startTimeRef.current = performance.now() - time
    updateSimulation(time)
  }

  // Animation loop
  const animationLoop = (timestamp: number) => {
    // Calculate elapsed time since simulation start
    const elapsed = timestamp - startTimeRef.current

    // Apply simulation speed
    const adjustedElapsed = elapsed * simulationSpeed

    // Update current time (capped at total duration)
    const newTime = Math.min(adjustedElapsed, totalDuration)

    // Only update if time has changed
    if (newTime !== currentTime) {
      setCurrentTime(newTime)

      // Update simulation state
      updateSimulation(newTime)
    }

    // Check if simulation is complete
    if (adjustedElapsed >= totalDuration) {
      console.log("Simulation complete")
      pauseSimulation()
      return
    }

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animationLoop)
  }

  // Update simulation based on current time
  const updateSimulation = (time: number) => {
    // Update explanation
    updateExplanation(time)

    // Update node statuses
    updateNodeStatuses(time)

    // Update packets
    updatePackets(time)

    // Update events
    updateEvents(time)
  }

  // Update events based on current time
  const updateEvents = (time: number) => {
    // Get all events that should be visible at the current time
    let allPossibleEvents: SimulationEvent[] = []

    // Select events based on simulation mode
    if (isDDoSActive) {
      allPossibleEvents = ddosEvents
    } else {
      switch (simulationMode) {
        case "websocket":
          allPossibleEvents = websocketEvents
          break
        case "https":
          allPossibleEvents = httpsEvents
          break
        default:
          allPossibleEvents = httpEvents
      }
    }

    const visibleEvents = [allPossibleEvents[0]] // Always include the initial event

    // Add events based on current mode
    for (const event of allPossibleEvents) {
      // Skip the initial event (already added)
      if (event.time === 0 && event.message.includes("Simulation ready")) {
        continue
      }

      // Skip TCP-specific events if using UDP (only for HTTP mode)
      if (
        simulationMode === "http" &&
        protocol === "udp" &&
        (event.message.includes("TCP handshake") ||
          event.message.includes("SYN") ||
          event.message.includes("ACK") ||
          event.message.includes("TCP detected") ||
          event.message.includes("TCP connection"))
      ) {
        continue
      }

      // Skip UDP message reassembly event if using TCP
      if (
        simulationMode === "http" &&
        protocol === "tcp" &&
        event.message.includes("partially reassembled due to packet loss (UDP)")
      ) {
        continue
      }

      // Skip TCP message reassembly event if using UDP
      if (
        simulationMode === "http" &&
        protocol === "udp" &&
        event.message.includes("successfully reassembled in order")
      ) {
        continue
      }

      // Skip packet loss retransmission events if packet loss is disabled
      if (
        simulationMode === "http" &&
        packetLossRate === 0 &&
        (event.message.includes("Packet #4 lost") ||
          event.message.includes("Packet #8 lost") ||
          event.message.includes("retransmitting"))
      ) {
        continue
      }

      // Add event if it's time has passed
      if (event.time <= time) {
        visibleEvents.push(event)
      }
    }

    // Update events state if different from current events
    if (visibleEvents.length !== events.length) {
      setEvents(visibleEvents)
    }
  }

  // Update explanation based on current time
  const updateExplanation = (time: number) => {
    if (isDDoSActive) {
      // DDoS explanations
      if (time < 2000) {
        setCurrentExplanation("Multiple attackers are sending a high volume of traffic to overwhelm the server.")
      } else if (time < 5000) {
        setCurrentExplanation(
          "The routers are becoming congested with malicious traffic, slowing down legitimate requests.",
        )
      } else if (time < 8000) {
        setCurrentExplanation(
          "The server is running out of resources to handle the flood of requests, becoming unresponsive.",
        )
      } else if (time < 12000) {
        setCurrentExplanation("DDoS mitigation systems are identifying and blocking suspicious traffic patterns.")
      } else {
        setCurrentExplanation("The attack has been mitigated, and normal service is being restored.")
      }
      return
    }

    switch (simulationMode) {
      case "websocket":
        // WebSocket explanations
        if (time < 2500) {
          setCurrentExplanation("Step 1: Establishing a standard TCP connection before upgrading to WebSocket.")
        } else if (time < 3500) {
          setCurrentExplanation("Step 2: Client sends an upgrade request to switch from HTTP to WebSocket protocol.")
        } else if (time < 7000) {
          setCurrentExplanation("Step 3: WebSocket connection established, enabling full-duplex communication.")
        } else if (time < 10000) {
          setCurrentExplanation("Step 4: Server can push data to the client without waiting for requests.")
        } else {
          setCurrentExplanation(
            "Step 5: The persistent connection remains open for continuous bidirectional communication.",
          )
        }
        break

      case "https":
        // HTTPS/TLS explanations
        if (time < 2500) {
          setCurrentExplanation("Step 1: Establishing a standard TCP connection before starting TLS handshake.")
        } else if (time < 4500) {
          setCurrentExplanation("Step 2: Client and server negotiate encryption parameters and exchange certificates.")
        } else if (time < 6500) {
          setCurrentExplanation(
            "Step 3: Both parties generate and exchange keys to establish a secure encrypted channel.",
          )
        } else if (time < 9000) {
          setCurrentExplanation("Step 4: Data is encrypted before transmission and decrypted upon receipt.")
        } else {
          setCurrentExplanation("Step 5: The secure connection protects data from eavesdropping and tampering.")
        }
        break

      default:
        // Standard HTTP explanations
        if (time < 1000) {
          setCurrentExplanation(
            "Step 1: Your computer is sending a DNS query to resolve the domain name to an IP address.",
          )
        } else if (time < 2000) {
          setCurrentExplanation("Step 2: DNS server has responded with the IP address of the destination server.")
        } else if (time < 3000 && protocol === "tcp") {
          setCurrentExplanation(
            "Step 3: Establishing a TCP connection through a three-way handshake (SYN, SYN-ACK, ACK).",
          )
        } else if (time < 4000) {
          setCurrentExplanation(
            "Step 4: Your message 'Hello World' is being fragmented into individual packets for transmission.",
          )
        } else if (time < 8000) {
          setCurrentExplanation(
            "Step 5: Packets are traveling through the network. Notice how they follow different routes and may experience delays or loss.",
          )
        } else if (time < 10000) {
          if (protocol === "tcp") {
            setCurrentExplanation("Step 6: TCP ensures reliable delivery by retransmitting any lost packets.")
          } else {
            setCurrentExplanation("Step 6: With UDP, lost packets are not retransmitted, resulting in incomplete data.")
          }
        } else if (time < 12000) {
          setCurrentExplanation("Step 7: The server is reassembling the packets to reconstruct the original message.")
        } else {
          setCurrentExplanation("Step 8: Transmission complete! The message has been successfully delivered.")
        }
    }
  }

  // Update node statuses based on current time
  const updateNodeStatuses = (time: number) => {
    setNodes((prev) =>
      prev.map((node) => {
        let status: "idle" | "active" | "processing" | "error" | "secure" = "idle"

        if (isDDoSActive) {
          // DDoS node statuses
          if (node.type === "attacker") {
            status = "error" // Attackers always in error state
          } else if (node.id === "server" && time > 3000) {
            status = time > 14000 ? "active" : "error" // Server under attack until mitigation
          } else if ((node.id === "router1" || node.id === "router2") && time > 2000) {
            status = time > 10000 ? "active" : "processing" // Routers congested until filtering
          } else if (node.id === "computer" && time > 1000) {
            status = time > 15000 ? "active" : "idle" // User connection delayed until mitigation
          }
        } else if (simulationMode === "websocket") {
          // WebSocket node statuses
          if (time < 1000 && (node.id === "computer" || node.id === "dns")) {
            status = "processing" // DNS lookup
          } else if (time >= 1000 && time < 2500 && (node.id === "computer" || node.id === "server")) {
            status = "processing" // TCP handshake
          } else if (time >= 2500 && time < 3000 && (node.id === "computer" || node.id === "server")) {
            status = "processing" // WebSocket upgrade
          } else if (time >= 3000) {
            if (node.id === "computer" || node.id === "server") {
              status = "active" // WebSocket connection active
            } else if (node.id === "router1" || node.id === "router2" || node.id === "isp") {
              status = "active" // Network active
            }
          }
        } else if (simulationMode === "https") {
          // HTTPS/TLS node statuses
          if (time < 1000 && (node.id === "computer" || node.id === "dns")) {
            status = "processing" // DNS lookup
          } else if (time >= 1000 && time < 2500 && (node.id === "computer" || node.id === "server")) {
            status = "processing" // TCP handshake
          } else if (time >= 2500 && time < 6000 && (node.id === "computer" || node.id === "server")) {
            status = "processing" // TLS handshake
          } else if (time >= 6000) {
            if (node.id === "computer" || node.id === "server") {
              status = "secure" // Secure connection established
            } else if (node.id === "router1" || node.id === "router2" || node.id === "isp") {
              status = "active" // Network active
            }
          }
        } else {
          // Standard HTTP node statuses
          if (time < 1000 && (node.id === "computer" || node.id === "dns")) {
            status = "processing" // DNS lookup
          } else if (
            time >= 1000 &&
            time < 2500 &&
            protocol === "tcp" &&
            (node.id === "computer" || node.id === "server")
          ) {
            status = "processing" // TCP handshake
          } else if (time >= 3000 && time < 8000) {
            if (
              node.id === "computer" ||
              node.id === "isp" ||
              node.id === "router1" ||
              node.id === "router2" ||
              node.id === "server"
            ) {
              status = "active" // Data transmission
            }
          } else if (time >= 8000) {
            if (node.id === "server") {
              status = "processing" // Message reassembly
            }
          }
        }

        // Only update the status, keep all other properties the same
        return { ...node, status }
      }),
    )
  }

  // Update packets based on current time
  const updatePackets = (time: number) => {
    const newPackets: PacketType[] = []

    if (isDDoSActive) {
      // DDoS attack packets
      const attackerCount = 3
      const packetsPerAttacker = 5
      const packetInterval = 300 // ms between packets

      for (let attackerId = 1; attackerId <= attackerCount; attackerId++) {
        for (let packetId = 0; packetId < packetsPerAttacker; packetId++) {
          const packetStartTime = 500 + attackerId * 500 + packetId * packetInterval

          if (time >= packetStartTime && time < packetStartTime + 1000) {
            const progress = Math.min((time - packetStartTime) / 1000, 1)
            const sourceNode = nodes.find((n) => n.id === `attacker${attackerId}`)!
            const targetNode = nodes.find((n) => n.id === "server")!
            const routerNode = nodes.find((n) => n.id === (attackerId === 3 ? "router2" : "router1"))!

            let currentX, currentY

            if (progress < 0.5) {
              // From attacker to router
              const segmentProgress = progress * 2
              currentX = sourceNode.x + (routerNode.x - sourceNode.x) * segmentProgress
              currentY = sourceNode.y + (routerNode.y - sourceNode.y) * segmentProgress
            } else {
              // From router to server
              const segmentProgress = (progress - 0.5) * 2
              currentX = routerNode.x + (targetNode.x - routerNode.x) * segmentProgress
              currentY = routerNode.y + (targetNode.y - routerNode.y) * segmentProgress
            }

            // After mitigation starts, stop new attack packets
            if (time < 10000 || packetStartTime < 9000) {
              newPackets.push({
                id: `attack-${attackerId}-${packetId}`,
                data: "ATTACK",
                sourceId: `attacker${attackerId}`,
                targetId: "server",
                sourceX: currentX,
                sourceY: currentY,
                targetX: targetNode.x,
                targetY: targetNode.y,
                sequenceNumber: packetId,
                status: "transit",
                protocol: "tcp",
                latency: 1000,
                retransmission: false,
                createdAt: packetStartTime,
              })
            }
          }
        }
      }

      // Add legitimate user packet that gets delayed
      if (time > 15000 && time < 16000) {
        const progress = Math.min((time - 15000) / 1000, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "server")!

        newPackets.push({
          id: "legitimate-request",
          data: "GET /",
          sourceId: "computer",
          targetId: "server",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 1000,
          retransmission: false,
          createdAt: 15000,
        })
      }

      return setPackets(newPackets)
    }

    if (simulationMode === "websocket") {
      // WebSocket packets

      // Initial connection (similar to HTTP)
      if (time < 1000) {
        const progress = Math.min(time / 1000, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "dns")!

        newPackets.push({
          id: "dns-query",
          data: "DNS Query",
          sourceId: "computer",
          targetId: "dns",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "udp",
          latency: 500,
          retransmission: false,
          createdAt: 0,
        })
      }

      if (time >= 500 && time < 1500) {
        const progress = Math.min((time - 500) / 1000, 1)
        const sourceNode = nodes.find((n) => n.id === "dns")!
        const targetNode = nodes.find((n) => n.id === "computer")!

        newPackets.push({
          id: "dns-response",
          data: "DNS Response",
          sourceId: "dns",
          targetId: "computer",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "udp",
          latency: 500,
          retransmission: false,
          createdAt: 500,
        })
      }

      // TCP handshake
      if (time >= 1500 && time < 1800) {
        const progress = Math.min((time - 1500) / 300, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "server")!

        newPackets.push({
          id: "tcp-syn",
          data: "SYN",
          sourceId: "computer",
          targetId: "server",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 300,
          retransmission: false,
          createdAt: 1500,
        })
      }

      if (time >= 1800 && time < 2100) {
        const progress = Math.min((time - 1800) / 300, 1)
        const sourceNode = nodes.find((n) => n.id === "server")!
        const targetNode = nodes.find((n) => n.id === "computer")!

        newPackets.push({
          id: "tcp-syn-ack",
          data: "SYN-ACK",
          sourceId: "server",
          targetId: "computer",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 300,
          retransmission: false,
          createdAt: 1800,
        })
      }

      if (time >= 2100 && time < 2400) {
        const progress = Math.min((time - 2100) / 300, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "server")!

        newPackets.push({
          id: "tcp-ack",
          data: "ACK",
          sourceId: "computer",
          targetId: "server",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 300,
          retransmission: false,
          createdAt: 2100,
        })
      }

      // WebSocket upgrade
      if (time >= 2600 && time < 3000) {
        const progress = Math.min((time - 2600) / 400, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "server")!

        newPackets.push({
          id: "ws-upgrade",
          data: "Upgrade: websocket",
          sourceId: "computer",
          targetId: "server",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 400,
          retransmission: false,
          createdAt: 2600,
        })
      }

      // Bidirectional communication
      // Client to server messages
      const clientMessageTimes = [3500, 10000]
      for (const startTime of clientMessageTimes) {
        if (time >= startTime && time < startTime + 1000) {
          const progress = Math.min((time - startTime) / 1000, 1)
          const sourceNode = nodes.find((n) => n.id === "computer")!
          const targetNode = nodes.find((n) => n.id === "server")!

          newPackets.push({
            id: `ws-client-msg-${startTime}`,
            data: "Client Message",
            sourceId: "computer",
            targetId: "server",
            sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
            sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
            targetX: targetNode.x,
            targetY: targetNode.y,
            sequenceNumber: 0,
            status: "transit",
            protocol: "tcp",
            latency: 1000,
            retransmission: false,
            createdAt: startTime,
            direction: "upstream",
          })
        }
      }

      // Server to client messages
      const serverMessageTimes = [5000, 8000]
      for (const startTime of serverMessageTimes) {
        if (time >= startTime && time < startTime + 1000) {
          const progress = Math.min((time - startTime) / 1000, 1)
          const sourceNode = nodes.find((n) => n.id === "server")!
          const targetNode = nodes.find((n) => n.id === "computer")!

          newPackets.push({
            id: `ws-server-msg-${startTime}`,
            data: "Server Message",
            sourceId: "server",
            targetId: "computer",
            sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
            sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
            targetX: targetNode.x,
            targetY: targetNode.y,
            sequenceNumber: 0,
            status: "transit",
            protocol: "tcp",
            latency: 1000,
            retransmission: false,
            createdAt: startTime,
            direction: "downstream",
          })
        }
      }

      // Simultaneous bidirectional communication
      if (time >= 7000 && time < 8000) {
        const progress = Math.min((time - 7000) / 1000, 1)
        const computerNode = nodes.find((n) => n.id === "computer")!
        const serverNode = nodes.find((n) => n.id === "server")!

        // Client to server
        newPackets.push({
          id: "ws-duplex-client",
          data: "Client Duplex",
          sourceId: "computer",
          targetId: "server",
          sourceX: computerNode.x + (serverNode.x - computerNode.x) * progress * 0.5,
          sourceY: computerNode.y + (serverNode.y - computerNode.y) * progress * 0.5,
          targetX: serverNode.x,
          targetY: serverNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 1000,
          retransmission: false,
          createdAt: 7000,
          direction: "upstream",
        })

        // Server to client (simultaneous)
        newPackets.push({
          id: "ws-duplex-server",
          data: "Server Duplex",
          sourceId: "server",
          targetId: "computer",
          sourceX: serverNode.x + (computerNode.x - serverNode.x) * progress * 0.5,
          sourceY: serverNode.y + (computerNode.y - computerNode.y) * progress * 0.5,
          targetX: computerNode.x,
          targetY: computerNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 1000,
          retransmission: false,
          createdAt: 7000,
          direction: "downstream",
        })
      }

      return setPackets(newPackets)
    }

    if (simulationMode === "https") {
      // HTTPS/TLS packets

      // Initial connection (similar to HTTP)
      if (time < 1000) {
        const progress = Math.min(time / 1000, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "dns")!

        newPackets.push({
          id: "dns-query",
          data: "DNS Query",
          sourceId: "computer",
          targetId: "dns",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "udp",
          latency: 500,
          retransmission: false,
          createdAt: 0,
        })
      }

      if (time >= 500 && time < 1500) {
        const progress = Math.min((time - 500) / 1000, 1)
        const sourceNode = nodes.find((n) => n.id === "dns")!
        const targetNode = nodes.find((n) => n.id === "computer")!

        newPackets.push({
          id: "dns-response",
          data: "DNS Response",
          sourceId: "dns",
          targetId: "computer",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "udp",
          latency: 500,
          retransmission: false,
          createdAt: 500,
        })
      }

      // TCP handshake
      if (time >= 1500 && time < 1800) {
        const progress = Math.min((time - 1500) / 300, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "server")!

        newPackets.push({
          id: "tcp-syn",
          data: "SYN",
          sourceId: "computer",
          targetId: "server",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 300,
          retransmission: false,
          createdAt: 1500,
        })
      }

      if (time >= 1800 && time < 2100) {
        const progress = Math.min((time - 1800) / 300, 1)
        const sourceNode = nodes.find((n) => n.id === "server")!
        const targetNode = nodes.find((n) => n.id === "computer")!

        newPackets.push({
          id: "tcp-syn-ack",
          data: "SYN-ACK",
          sourceId: "server",
          targetId: "computer",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 300,
          retransmission: false,
          createdAt: 1800,
        })
      }

      if (time >= 2100 && time < 2400) {
        const progress = Math.min((time - 2100) / 300, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "server")!

        newPackets.push({
          id: "tcp-ack",
          data: "ACK",
          sourceId: "computer",
          targetId: "server",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 300,
          retransmission: false,
          createdAt: 2100,
        })
      }

      // TLS handshake
      const tlsSteps = [
        { id: "client-hello", start: 3000, duration: 500, from: "computer", to: "server", data: "Client Hello" },
        { id: "server-hello", start: 3500, duration: 500, from: "server", to: "computer", data: "Server Hello" },
        { id: "certificate", start: 4000, duration: 500, from: "server", to: "computer", data: "Certificate" },
        { id: "key-exchange", start: 5000, duration: 500, from: "computer", to: "server", data: "Key Exchange" },
        { id: "finished", start: 5500, duration: 500, from: "server", to: "computer", data: "Finished" },
      ]

      for (const step of tlsSteps) {
        if (time >= step.start && time < step.start + step.duration) {
          const progress = Math.min((time - step.start) / step.duration, 1)
          const sourceNode = nodes.find((n) => n.id === step.from)!
          const targetNode = nodes.find((n) => n.id === step.to)!

          newPackets.push({
            id: `tls-${step.id}`,
            data: step.data,
            sourceId: step.from,
            targetId: step.to,
            sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
            sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
            targetX: targetNode.x,
            targetY: targetNode.y,
            sequenceNumber: 0,
            status: "transit",
            protocol: "tcp",
            latency: step.duration,
            retransmission: false,
            createdAt: step.start,
            encrypted: step.id !== "client-hello" && step.id !== "server-hello",
          })
        }
      }

      // Encrypted data exchange
      if (time >= 6500 && time < 7500) {
        const progress = Math.min((time - 6500) / 1000, 1)
        const sourceNode = nodes.find((n) => n.id === "computer")!
        const targetNode = nodes.find((n) => n.id === "server")!

        newPackets.push({
          id: "https-request",
          data: "Encrypted Request",
          sourceId: "computer",
          targetId: "server",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 1000,
          retransmission: false,
          createdAt: 6500,
          encrypted: true,
        })
      }

      if (time >= 8500 && time < 9500) {
        const progress = Math.min((time - 8500) / 1000, 1)
        const sourceNode = nodes.find((n) => n.id === "server")!
        const targetNode = nodes.find((n) => n.id === "computer")!

        newPackets.push({
          id: "https-response",
          data: "Encrypted Response",
          sourceId: "server",
          targetId: "computer",
          sourceX: sourceNode.x + (targetNode.x - sourceNode.x) * progress * 0.5,
          sourceY: sourceNode.y + (targetNode.y - sourceNode.y) * progress * 0.5,
          targetX: targetNode.x,
          targetY: targetNode.y,
          sequenceNumber: 0,
          status: "transit",
          protocol: "tcp",
          latency: 1000,
          retransmission: false,
          createdAt: 8500,
          encrypted: true,
        })
      }

      return setPackets(newPackets)
    }

    // Standard HTTP mode
    // DNS query packet (if before 1000ms)
    if (time < 1000) {
      const progress = Math.min(time / 1000, 1)
      const sourceNode = nodes.find((n) => n.id === "computer")!
      const targetNode = nodes.find((n) => n.id === "dns")!

      // Calculate the exact position along the path
      const currentX = sourceNode.x + (targetNode.x - sourceNode.x) * progress
      const currentY = sourceNode.y + (targetNode.y - sourceNode.y) * progress

      newPackets.push({
        id: "dns-query",
        data: "DNS Query",
        sourceId: "computer",
        targetId: "dns",
        sourceX: currentX,
        sourceY: currentY,
        targetX: targetNode.x,
        targetY: targetNode.y,
        sequenceNumber: 0,
        status: "transit",
        protocol: "udp",
        latency: 500,
        retransmission: false,
        createdAt: 0,
      })
    }

    // DNS response packet (if between 500ms and 1500ms)
    if (time >= 500 && time < 1500) {
      const progress = Math.min((time - 500) / 1000, 1)
      const sourceNode = nodes.find((n) => n.id === "dns")!
      const targetNode = nodes.find((n) => n.id === "computer")!

      // Calculate the exact position along the path
      const currentX = sourceNode.x + (targetNode.x - sourceNode.x) * progress
      const currentY = sourceNode.y + (targetNode.y - sourceNode.y) * progress

      newPackets.push({
        id: "dns-response",
        data: "DNS Response",
        sourceId: "dns",
        targetId: "computer",
        sourceX: currentX,
        sourceY: currentY,
        targetX: targetNode.x,
        targetY: targetNode.y,
        sequenceNumber: 0,
        status: "transit",
        protocol: "udp",
        latency: 500,
        retransmission: false,
        createdAt: 500,
      })
    }

    // Data packets (if after 3000ms)
    if (time >= 3000) {
      // Split message into packets
      const messageChars = MESSAGE.split("")
      const packetCount = messageChars.length

      for (let i = 0; i < packetCount; i++) {
        const packetStartTime = 3000 + i * 500 // Stagger packet sending
        const packetTravelTime = 800 // Time to travel from source to destination

        // Check if this packet should be visible yet
        if (time >= packetStartTime && time < packetStartTime + packetTravelTime) {
          const progress = Math.min((time - packetStartTime) / packetTravelTime, 1)

          // Determine if this packet should be "lost" based on packet loss rate
          const isLost = (i === 3 || i === 7) && packetLossRate >= 10

          // For lost packets in TCP, show retransmission after a delay
          const isRetransmission = isLost && protocol === "tcp" && time >= packetStartTime + 1500

          if (!isLost || isRetransmission) {
            const sourceNode = nodes.find((n) => n.id === "computer")!
            const targetNode = nodes.find((n) => n.id === "server")!

            // Calculate intermediate positions through routers
            const router1Node = nodes.find((n) => n.id === "router1")!
            const router2Node = nodes.find((n) => n.id === "router2")!
            const ispNode = nodes.find((n) => n.id === "isp")!

            let currentX, currentY

            // Define more precise routing with 4 segments for clearer visualization
            if (progress < 0.25) {
              // From computer to ISP
              const segmentProgress = progress * 4
              currentX = sourceNode.x + (ispNode.x - sourceNode.x) * segmentProgress
              currentY = sourceNode.y + (ispNode.y - sourceNode.y) * segmentProgress
            } else if (progress < 0.5) {
              // From ISP to router1
              const segmentProgress = (progress - 0.25) * 4
              currentX = ispNode.x + (router1Node.x - ispNode.x) * segmentProgress
              currentY = ispNode.y + (router1Node.y - ispNode.y) * segmentProgress
            } else if (progress < 0.75) {
              // From router1 to router2
              const segmentProgress = (progress - 0.5) * 4
              currentX = router1Node.x + (router2Node.x - router1Node.x) * segmentProgress
              currentY = router1Node.y + (router2Node.y - router1Node.y) * segmentProgress
            } else {
              // From router2 to server
              const segmentProgress = (progress - 0.75) * 4
              currentX = router2Node.x + (targetNode.x - router2Node.x) * segmentProgress
              currentY = router2Node.y + (targetNode.y - targetNode.y) * segmentProgress
            }

            newPackets.push({
              id: `data-${i}${isRetransmission ? "-retry" : ""}`,
              data: messageChars[i],
              sourceId: "computer",
              targetId: "server",
              sourceX: currentX,
              sourceY: currentY,
              targetX: targetNode.x,
              targetY: targetNode.y,
              sequenceNumber: i + 1,
              status: "transit",
              protocol,
              latency: packetTravelTime,
              retransmission: isRetransmission,
              createdAt: isRetransmission ? packetStartTime + 1500 : packetStartTime,
            })
          }
        }
      }
    }

    setPackets(newPackets)
  }

  // Get detailed information about a node
  const getNodeDetails = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return { type: "computer" as const, description: "Node not found" }

    switch (node.type) {
      case "computer":
        return {
          type: "computer" as const,
          description:
            "Your computer is the origin of the data transmission. It fragments the message into packets and handles retransmission if needed.",
          stats: {
            "IP Address": "192.168.1.10",
            "Packets Sent": Math.floor(currentTime / 500),
            "RTT (avg)": `${Math.floor(800 / simulationSpeed)}ms`,
            Protocol: protocol.toUpperCase(),
          },
        }

      case "dns":
        return {
          type: "dns" as const,
          description:
            "The DNS server resolves domain names to IP addresses. It translates human-readable names to machine-readable addresses.",
          stats: {
            Queries: Math.floor(currentTime / 2000),
            "Cache Hits": Math.floor(currentTime / 4000),
            "Response Time": `${Math.floor(100 / simulationSpeed)}ms`,
          },
        }

      case "isp":
        return {
          type: "isp" as const,
          description:
            "Your Internet Service Provider connects your home network to the broader internet infrastructure.",
          stats: {
            Bandwidth: "100 Mbps",
            "Packets Routed": Math.floor(currentTime / 300),
            Latency: `${Math.floor(50 / simulationSpeed)}ms`,
          },
        }

      case "router":
        return {
          type: "router" as const,
          description: "Routers direct packets across networks using routing tables to determine the best path.",
          routingTable: [
            { destination: "192.168.1.0/24", gateway: "Direct", interface: "eth0" },
            { destination: "10.0.0.0/8", gateway: "10.1.1.1", interface: "eth1" },
            { destination: "203.0.113.0/24", gateway: "10.2.2.2", interface: "eth1" },
            { destination: "0.0.0.0/0", gateway: "10.1.1.254", interface: "eth1" },
          ],
          stats: {
            "Packets Routed": Math.floor(currentTime / 200),
            "Dropped Packets": Math.floor((currentTime / 2000) * (packetLossRate / 100)),
            "Queue Length": Math.floor((currentTime % 1000) / 200),
          },
        }

      case "server":
        return {
          type: "server" as const,
          description: "The destination server receives the packets and reassembles them into the original message.",
          receivedPackets: MESSAGE.split("").map((char, i) => {
            const isLost = (i === 3 || i === 7) && packetLossRate >= 10 && protocol === "udp"
            return {
              sequenceNumber: i + 1,
              data: isLost ? "?" : char,
              complete: !isLost && currentTime > 3000 + i * 500 + 800,
            }
          }),
          stats: {
            "IP Address": "203.0.113.42",
            "Packets Received": Math.min(MESSAGE.length, Math.floor((currentTime - 3000) / 500)),
            "Complete Message": protocol === "tcp" || packetLossRate === 0 ? "Yes" : "No",
          },
        }

      case "attacker":
        return {
          type: "attacker" as const,
          description: "A malicious node sending excessive traffic to overwhelm the target server.",
          stats: {
            "Attack Type": "SYN Flood",
            "Packets Sent": Math.floor(currentTime / 100),
            "Traffic Generated": `${Math.floor(currentTime / 10)} Mbps`,
          },
        }

      default:
        return {
          type: node.type,
          description: `${node.label} is part of the network infrastructure.`,
        }
    }
  }

  // Context value
  const contextValue: SimulationContextType = {
    nodes,
    connections,
    packets,
    events,
    isRunning,
    protocol,
    packetLossRate,
    simulationSpeed,
    currentTime,
    totalDuration,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setProtocol,
    setPacketLossRate,
    setSimulationSpeed,
    seekToTime,
    getNodeDetails,
    currentExplanation,
    simulationMode,
    setSimulationMode,
    isDDoSActive,
    toggleDDoSAttack, // Replace startDDoSAttack with toggleDDoSAttack
    showQuiz,
    setShowQuiz,
  }

  return <SimulationContext.Provider value={contextValue}>{children}</SimulationContext.Provider>
}

// Custom hook to use the simulation context
export function useSimulation() {
  const context = React.useContext(SimulationContext)
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}
