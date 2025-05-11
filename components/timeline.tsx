"use client"

import { useSimulation } from "@/lib/simulation-context"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Timeline() {
  const { events, currentTime, totalDuration, isRunning, seekToTime } = useSimulation()

  const [timelinePosition, setTimelinePosition] = useState(0)

  useEffect(() => {
    if (totalDuration > 0) {
      setTimelinePosition((currentTime / totalDuration) * 100)
    }
  }, [currentTime, totalDuration])

  const handleTimelineChange = (value: number[]) => {
    const newTime = (value[0] / 100) * totalDuration
    seekToTime(newTime)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-l-2 border-red-500 bg-red-500/10"
      case "success":
        return "border-l-2 border-green-500 bg-green-500/10"
      case "warning":
        return "border-l-2 border-yellow-500 bg-yellow-500/10"
      default:
        return "border-l-2 border-blue-500 bg-blue-500/10"
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-slate-300">Timeline</h3>
        <motion.span
          className="text-sm font-mono bg-slate-700/50 backdrop-blur-sm px-3 py-1 rounded-full"
          key={currentTime}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {(currentTime / 1000).toFixed(2)}s
        </motion.span>
      </div>

      <div className="mb-6">
        <Slider
          value={[timelinePosition]}
          min={0}
          max={100}
          step={0.1}
          onValueChange={handleTimelineChange}
          disabled={isRunning || totalDuration === 0}
          className="mb-6"
        />

        <div className="relative h-[180px] overflow-y-auto pr-2 rounded-lg bg-slate-800/50 backdrop-blur-sm">
          <div className="space-y-1.5 p-2">
            {events.map((event, index) => (
              <motion.div
                key={`${event.time}-${event.message}-${index}`}
                className={`
                  flex items-center gap-2 p-2 text-xs rounded-lg
                  ${currentTime >= event.time ? "text-white" : "text-slate-400"}
                  ${getEventColor(event.type)}
                  transition-all duration-200
                `}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <span className="font-mono whitespace-nowrap">{(event.time / 1000).toFixed(2)}s</span>
                <span className="flex-1">{event.message}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>0s</span>
        <span>{(totalDuration / 1000).toFixed(2)}s</span>
      </div>
    </div>
  )
}
