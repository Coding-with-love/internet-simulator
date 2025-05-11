"use client"

import { useSimulation } from "@/lib/simulation-context"
import { motion } from "framer-motion"

export default function ExplanationPanel() {
  const { currentExplanation, isRunning } = useSimulation()

  if (!currentExplanation || !isRunning) return null

  return (
    <motion.div
      className="bg-gradient-to-r from-blue-900/70 to-indigo-900/70 backdrop-blur-sm text-white p-4 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm">{currentExplanation}</p>
    </motion.div>
  )
}
