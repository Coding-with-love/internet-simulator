"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSimulation } from "@/lib/simulation-context"
import { motion } from "framer-motion"
import { Search, Globe, ArrowRight } from 'lucide-react'

export default function UrlInput() {
  const { setCustomUrl, customUrl, isRunning, startSimulation, resetSimulation } = useSimulation()
  const [inputUrl, setInputUrl] = useState(customUrl || "example.com")
  const [message, setMessage] = useState("GET / HTTP/1.1")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Format the URL if needed
    let formattedUrl = inputUrl
    if (!formattedUrl.includes("://")) {
      formattedUrl = "https://" + formattedUrl
    }
    
    // Reset and set the new URL
    resetSimulation()
    setCustomUrl(formattedUrl, message)
    
    // Start the simulation
    setTimeout(() => {
      startSimulation()
    }, 100)
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Globe className="mr-2 h-5 w-5 text-blue-400" />
        Enter a URL to simulate
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Globe className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Enter a URL (e.g., example.com)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
              disabled={isRunning}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="HTTP Request (e.g., GET / HTTP/1.1)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
              disabled={isRunning}
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isRunning || !inputUrl.trim()} 
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg"
        >
          Simulate Request <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  )
}
