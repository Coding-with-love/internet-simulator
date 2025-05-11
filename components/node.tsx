"use client"

import type { NodeType } from "@/lib/types"
import { Computer, Server, Network, Router, Globe, Lock, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

interface NodeProps {
  node: NodeType
  onClick: () => void
}

export default function Node({ node, onClick }: NodeProps) {
  const getIcon = () => {
    switch (node.type) {
      case "computer":
        return node.status === "secure" ? <Lock className="h-6 w-6" /> : <Computer className="h-6 w-6" />
      case "server":
        return node.status === "secure" ? <Lock className="h-6 w-6" /> : <Server className="h-6 w-6" />
      case "dns":
        return <Globe className="h-6 w-6" />
      case "isp":
        return <Network className="h-6 w-6" />
      case "router":
        return <Router className="h-6 w-6" />
      case "attacker":
        return <AlertTriangle className="h-6 w-6" />
      default:
        return <Computer className="h-6 w-6" />
    }
  }

  const getNodeColor = () => {
    switch (node.status) {
      case "active":
        return "bg-gradient-to-br from-green-400 to-emerald-500"
      case "processing":
        return "bg-gradient-to-br from-yellow-400 to-amber-500"
      case "error":
        return "bg-gradient-to-br from-red-400 to-rose-500"
      case "secure":
        return "bg-gradient-to-br from-emerald-400 to-teal-500"
      default:
        return "bg-gradient-to-br from-slate-600 to-slate-700"
    }
  }

  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
    >
      <motion.div
        className={`
          flex items-center justify-center 
          w-14 h-14 rounded-full 
          ${getNodeColor()}
          text-white shadow-lg
          ${node.status === "processing" ? "animate-pulse" : ""}
        `}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
      >
        {getIcon()}
      </motion.div>
      <motion.span
        className="mt-2 text-xs font-medium bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {node.label}
      </motion.span>
    </div>
  )
}
