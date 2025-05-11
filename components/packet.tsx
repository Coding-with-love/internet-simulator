"use client"

import type { PacketType } from "@/lib/types"
import { Lock } from "lucide-react"
import { motion } from "framer-motion"

interface PacketProps {
  packet: PacketType
}

export default function Packet({ packet }: PacketProps) {
  const getPacketColor = () => {
    if (packet.encrypted) return "bg-gradient-to-r from-emerald-500 to-teal-500"
    if (packet.protocol === "tcp") return "bg-gradient-to-r from-blue-500 to-cyan-500"
    return "bg-gradient-to-r from-purple-500 to-violet-500"
  }

  // Determine if this is a special packet type
  const isDnsPacket = packet.data.includes("DNS")
  const isTcpHandshake = ["SYN", "ACK", "SYN-ACK"].includes(packet.data)
  const isWebSocketPacket = packet.data.includes("websocket") || packet.direction !== undefined
  const isTlsPacket =
    packet.data.includes("Hello") || packet.data.includes("Certificate") || packet.data.includes("Exchange")

  return (
    <motion.div
      className={`
        absolute flex items-center justify-center
        w-9 h-9 rounded-lg text-xs font-mono
        ${getPacketColor()}
        ${packet.retransmission ? "ring-2 ring-red-400" : ""}
        ${packet.direction === "upstream" ? "border-t-4 border-yellow-300" : ""}
        ${packet.direction === "downstream" ? "border-b-4 border-yellow-300" : ""}
        ${isDnsPacket ? "bg-gradient-to-r from-amber-500 to-yellow-500" : ""}
        ${isTcpHandshake ? "bg-gradient-to-r from-indigo-500 to-blue-500" : ""}
        ${isTlsPacket && !packet.encrypted ? "bg-gradient-to-r from-teal-400 to-emerald-400" : ""}
        text-white shadow-lg
      `}
      style={{
        left: `${packet.sourceX}%`,
        top: `${packet.sourceY}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      >
        {packet.encrypted ? (
          <Lock className="h-4 w-4" />
        ) : isDnsPacket ? (
          "DNS"
        ) : isTcpHandshake ? (
          packet.data
        ) : isWebSocketPacket ? (
          "WS"
        ) : (
          packet.sequenceNumber
        )}
      </motion.div>
    </motion.div>
  )
}
