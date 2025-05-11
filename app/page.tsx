import NetworkSimulator from "@/components/network-simulator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Internet Data Transmission Simulator
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Visualize how data travels across the internet with packet fragmentation, routing, and reassembly
          </p>
        </div>
        <NetworkSimulator />
      </div>
    </main>
  )
}
