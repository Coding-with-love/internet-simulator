"use client"

import { useState } from "react"
import NetworkMap from "./network-map"
import SimulationControls from "./simulation-controls"
import Timeline from "./timeline"
import DetailView from "./detail-view"
import ExplanationPanel from "./explanation-panel"
import QuizPanel from "./quiz-panel"
import { SimulationProvider } from "@/lib/simulation-context"

export default function NetworkSimulator() {
  return (
    <SimulationProvider>
      <NetworkSimulatorContent />
    </SimulationProvider>
  )
}

function NetworkSimulatorContent() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <SimulationControls />
      <QuizPanel />
      <ExplanationPanel />
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 shadow-lg min-h-[500px]">
        {selectedNode ? (
          <DetailView nodeId={selectedNode} onClose={() => setSelectedNode(null)} />
        ) : (
          <NetworkMap onNodeSelect={setSelectedNode} />
        )}
      </div>
      <Timeline />
    </div>
  )
}
