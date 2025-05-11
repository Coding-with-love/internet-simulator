"use client"

import { useSimulation } from "@/lib/simulation-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, FastForward, Radio, Lock, AlertTriangle, HelpCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { motion } from "framer-motion"

export default function SimulationControls() {
  const {
    isRunning,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setPacketLossRate,
    packetLossRate,
    protocol,
    setProtocol,
    simulationSpeed,
    setSimulationSpeed,
    currentTime,
    simulationMode,
    setSimulationMode,
    toggleDDoSAttack,
    isDDoSActive,
    showQuiz,
    setShowQuiz,
  } = useSimulation()

  const [activeTab, setActiveTab] = useState("basic")

  const handleStartPause = () => {
    if (isRunning) {
      pauseSimulation()
    } else {
      startSimulation()
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg">
      <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-5 bg-slate-700/50 p-1 rounded-lg">
          <TabsTrigger
            value="basic"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-md transition-all duration-200"
          >
            Basic Controls
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-md transition-all duration-200"
          >
            Advanced Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-5">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={handleStartPause}
                className={`rounded-full px-5 transition-all duration-200 ${
                  isRunning
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                }`}
              >
                {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? "Pause" : "Start"}
              </Button>

              <Button
                size="sm"
                onClick={resetSimulation}
                className="rounded-full px-5 bg-slate-700 hover:bg-slate-600 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <Button
                size="sm"
                onClick={() => setSimulationSpeed(simulationSpeed * 1.5)}
                className="rounded-full px-5 bg-slate-700 hover:bg-slate-600 text-white"
              >
                <FastForward className="h-4 w-4 mr-2" />
                Speed Up
              </Button>

              <motion.div
                className="bg-slate-700/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {(currentTime / 1000).toFixed(2)}s
              </motion.div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3 bg-slate-700/30 p-2 rounded-lg">
                <Label htmlFor="protocol" className="text-sm font-medium">
                  Protocol:
                </Label>
                <div className="flex items-center gap-2">
                  <span className={protocol === "tcp" ? "font-bold text-cyan-400" : "text-slate-400"}>TCP</span>
                  <Switch
                    id="protocol"
                    checked={protocol === "udp"}
                    onCheckedChange={(checked) => setProtocol(checked ? "udp" : "tcp")}
                    className="data-[state=checked]:bg-purple-500"
                  />
                  <span className={protocol === "udp" ? "font-bold text-purple-400" : "text-slate-400"}>UDP</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-700/30 p-2 rounded-lg">
                <Label htmlFor="packet-loss" className="text-sm font-medium whitespace-nowrap">
                  Packet Loss: {packetLossRate}%
                </Label>
                <Slider
                  id="packet-loss"
                  min={0}
                  max={50}
                  step={5}
                  value={[packetLossRate]}
                  onValueChange={(value) => setPacketLossRate(value[0])}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300">Connection Types</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={simulationMode === "http" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSimulationMode("http")}
                  className={`rounded-lg transition-all duration-200 ${
                    simulationMode === "http"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0"
                      : "bg-slate-700/50 text-slate-300 hover:text-white border-slate-600"
                  }`}
                >
                  HTTP
                </Button>
                <Button
                  variant={simulationMode === "websocket" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSimulationMode("websocket")}
                  className={`rounded-lg transition-all duration-200 ${
                    simulationMode === "websocket"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0"
                      : "bg-slate-700/50 text-slate-300 hover:text-white border-slate-600"
                  }`}
                >
                  <Radio className="h-4 w-4 mr-2" />
                  WebSocket
                </Button>
                <Button
                  variant={simulationMode === "https" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSimulationMode("https")}
                  className={`rounded-lg transition-all duration-200 ${
                    simulationMode === "https"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0"
                      : "bg-slate-700/50 text-slate-300 hover:text-white border-slate-600"
                  }`}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  HTTPS/TLS
                </Button>
                <Button
                  variant={isDDoSActive ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleDDoSAttack}
                  className={`rounded-lg transition-all duration-200 ${
                    isDDoSActive
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white border-0"
                      : "bg-slate-700/50 text-slate-300 hover:text-white border-slate-600"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {isDDoSActive ? "Disable DDoS" : "DDoS Attack"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300">Learning Tools</h3>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={showQuiz ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowQuiz(!showQuiz)}
                  className={`rounded-lg transition-all duration-200 ${
                    showQuiz
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
                      : "bg-slate-700/50 text-slate-300 hover:text-white border-slate-600"
                  }`}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {showQuiz ? "Hide Quiz" : "Show Mini-Quiz"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
