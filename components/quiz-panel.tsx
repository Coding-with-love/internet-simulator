"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle } from "lucide-react"
import { useSimulation } from "@/lib/simulation-context"
import { motion } from "framer-motion"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Which protocol would be best for a video call application?",
    options: ["TCP", "UDP", "HTTP", "HTTPS"],
    correctAnswer: 1,
    explanation:
      "UDP is preferred for real-time applications like video calls because it prioritizes speed over reliability. Occasional packet loss is acceptable in video streaming as it's better to skip frames than to wait for retransmission.",
  },
  {
    id: 2,
    question: "What is the main advantage of WebSockets over traditional HTTP?",
    options: ["Faster connection speed", "Full-duplex communication", "Better security", "Lower bandwidth usage"],
    correctAnswer: 1,
    explanation:
      "WebSockets provide full-duplex communication channels over a single TCP connection, allowing simultaneous two-way communication between client and server.",
  },
  {
    id: 3,
    question: "What happens during a TCP handshake?",
    options: ["Data encryption", "Three-way exchange (SYN, SYN-ACK, ACK)", "DNS resolution", "Packet fragmentation"],
    correctAnswer: 1,
    explanation:
      "A TCP handshake involves a three-way exchange: the client sends a SYN packet, the server responds with a SYN-ACK, and the client acknowledges with an ACK, establishing a reliable connection.",
  },
  {
    id: 4,
    question: "What is the main purpose of TLS in HTTPS?",
    options: ["Speed optimization", "Data compression", "Encryption and authentication", "Packet routing"],
    correctAnswer: 2,
    explanation:
      "TLS (Transport Layer Security) provides encryption to protect data privacy and authentication to verify the identity of the communicating parties.",
  },
  {
    id: 5,
    question: "How does a DDoS attack work?",
    options: [
      "By stealing user credentials",
      "By overwhelming a server with traffic from multiple sources",
      "By encrypting server data",
      "By intercepting network packets",
    ],
    correctAnswer: 1,
    explanation:
      "A Distributed Denial of Service (DDoS) attack works by flooding a target with excessive traffic from multiple sources, overwhelming its capacity and preventing legitimate users from accessing the service.",
  },
]

export default function QuizPanel() {
  const { showQuiz } = useSimulation()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  if (!showQuiz) return null

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return

    setIsAnswered(true)
    if (selectedAnswer === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setScore(0)
    setQuizCompleted(false)
  }

  if (quizCompleted) {
    return (
      <motion.div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
          Quiz Completed!
        </h3>
        <p className="mb-4">
          Your score: <span className="font-bold text-emerald-400">{score}</span> out of {quizQuestions.length}
        </p>
        <Button
          onClick={resetQuiz}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-6"
        >
          Try Again
        </Button>
      </motion.div>
    )
  }

  const question = quizQuestions[currentQuestion]

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
        Network Concepts Quiz
      </h3>
      <div className="mb-4">
        <p className="text-sm text-slate-400">
          Question {currentQuestion + 1} of {quizQuestions.length}
        </p>
        <p className="font-medium mt-2">{question.question}</p>
      </div>

      <RadioGroup
        value={selectedAnswer?.toString()}
        onValueChange={(value) => setSelectedAnswer(Number.parseInt(value))}
        className="space-y-3"
      >
        {question.options.map((option, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={isAnswered} />
            <Label htmlFor={`option-${index}`} className="cursor-pointer flex items-center">
              {option}
              {isAnswered && index === question.correctAnswer && (
                <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-green-500" />
              )}
              {isAnswered && selectedAnswer === index && index !== question.correctAnswer && (
                <XCircle className="inline-block ml-2 h-4 w-4 text-red-500" />
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {isAnswered && (
        <motion.div
          className="mt-4 p-4 bg-slate-700/50 backdrop-blur-sm rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm">{question.explanation}</p>
        </motion.div>
      )}

      <div className="mt-5 flex gap-3">
        {!isAnswered ? (
          <Button
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full px-6"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-6"
          >
            {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "See Results"}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
