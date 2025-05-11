"use client"

import { useRef } from "react"
import Node from "./node"
import Packet from "./packet"
import { useSimulation } from "@/lib/simulation-context"

interface NetworkMapProps {
  onNodeSelect: (nodeId: string) => void
}

export default function NetworkMap({ onNodeSelect }: NetworkMapProps) {
  const { nodes, packets, connections } = useSimulation()
  const mapRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={mapRef}
      className="relative w-full h-[450px] overflow-hidden rounded-xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm"
    >
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {connections.map((connection) => {
          const sourceNode = nodes.find((n) => n.id === connection.source)
          const targetNode = nodes.find((n) => n.id === connection.target)

          if (!sourceNode || !targetNode) return null

          // Determine if this connection is active based on node statuses
          const isActive =
            sourceNode.status === "active" ||
            sourceNode.status === "processing" ||
            targetNode.status === "active" ||
            targetNode.status === "processing" ||
            sourceNode.status === "secure" ||
            targetNode.status === "secure"

          return (
            <line
              key={`${connection.source}-${connection.target}`}
              x1={`${sourceNode.x}%`}
              y1={`${sourceNode.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              stroke={connection.type === "wireless" ? "#60a5fa" : isActive ? "#34d399" : "#4b5563"}
              strokeWidth={isActive ? "2" : "1.5"}
              strokeDasharray={connection.type === "wireless" ? "5,5" : ""}
              filter={isActive ? "url(#glow)" : ""}
              opacity={isActive ? 0.9 : 0.6}
            />
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <Node key={node.id} node={node} onClick={() => onNodeSelect(node.id)} />
      ))}

      {/* Packets */}
      {packets.map((packet) => (
        <Packet key={packet.id} packet={packet} />
      ))}
    </div>
  )
}
