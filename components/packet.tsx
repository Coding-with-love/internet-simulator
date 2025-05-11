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

  return (
    <motion.div
      className={`
        absolute flex items-center justify-center
        w-9 h-9 rounded-lg text-xs font-mono
        ${getPacketColor()}
        ${packet.retransmission ? "ring-2 ring-red-400" : ""}
        ${packet.direction === "upstream" ? "border-t-4 border-yellow-300" : ""}
        ${packet.direction === "downstream" ? "border-b-4 border-yellow-300" : ""}
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
        {packet.encrypted ? <Lock className="h-4 w-4" /> : packet.sequenceNumber}
      </motion.div>
    </motion.div>
  )
}
