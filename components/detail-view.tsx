"use client"

import { useSimulation } from "@/lib/simulation-context"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { motion } from "framer-motion"

interface DetailViewProps {
  nodeId: string
  onClose: () => void
}

export default function DetailView({ nodeId, onClose }: DetailViewProps) {
  const { nodes, getNodeDetails } = useSimulation()
  const node = nodes.find((n) => n.id === nodeId)
  const details = getNodeDetails(nodeId)

  if (!node) return null

  return (
    <motion.div
      className="relative p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-3 right-3 rounded-full hover:bg-slate-700/50"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="mb-5">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
          {node.label}
        </h2>
        <p className="text-slate-300">{details.description}</p>
      </div>

      <div className="grid gap-4">
        {details.type === "dns" && (
          <motion.div
            className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-sm font-medium mb-2 text-blue-400">DNS Resolution Process</h3>
            <ol className="list-decimal list-inside text-sm space-y-1.5 text-slate-300">
              <li>Receive domain name query</li>
              <li>Check local cache for existing record</li>
              <li>If not found, query root nameservers</li>
              <li>Follow referrals to authoritative nameserver</li>
              <li>Return IP address to client</li>
            </ol>
          </motion.div>
        )}

        {details.type === "router" && (
          <motion.div
            className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-sm font-medium mb-2 text-blue-400">Routing Table</h3>
            <div className="text-xs font-mono bg-slate-800/80 p-3 rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-600">
                    <th className="pb-2 pr-4 text-slate-400">Destination</th>
                    <th className="pb-2 pr-4 text-slate-400">Gateway</th>
                    <th className="pb-2 text-slate-400">Interface</th>
                  </tr>
                </thead>
                <tbody>
                  {details.routingTable?.map((route, i) => (
                    <tr key={i} className="border-b border-slate-700/50">
                      <td className="py-2 pr-4">{route.destination}</td>
                      <td className="py-2 pr-4">{route.gateway}</td>
                      <td className="py-2">{route.interface}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {details.type === "server" && (
          <motion.div
            className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-sm font-medium mb-2 text-blue-400">Received Packets</h3>
            <div className="space-y-2">
              {details.receivedPackets?.length ? (
                details.receivedPackets.map((packet, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-slate-800/80 p-3 rounded-lg">
                    <span
                      className={`w-3 h-3 rounded-full ${packet.complete ? "bg-green-500" : "bg-yellow-500"}`}
                    ></span>
                    <span>Packet #{packet.sequenceNumber}</span>
                    <span className="ml-auto font-mono">{packet.data}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No packets received yet</p>
              )}
            </div>
          </motion.div>
        )}

        {details.stats && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {Object.entries(details.stats).map(([key, value], index) => (
              <div
                key={key}
                className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm p-3 rounded-xl shadow-md"
              >
                <div className="text-xs text-slate-400">{key}</div>
                <div className="text-lg font-medium">{value}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
