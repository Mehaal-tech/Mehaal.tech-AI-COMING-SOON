"use client"

import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

type ConversationState = "greeting" | "listening" | "responding" | "idle"

export function AIVoiceInterface() {
  const [state, setState] = useState<ConversationState>("greeting")
  const [isLogoCenter, setIsLogoCenter] = useState(true)
  const [currentMessage, setCurrentMessage] = useState("")
  const [isMicActive, setIsMicActive] = useState(false)
  const [agentPosition, setAgentPosition] = useState<"left" | "right">("left")

  useEffect(() => {
    // Simulate AI greeting
    if (state === "greeting") {
      setCurrentMessage("Hello! I am your AI assistant. How can I help you today?")

      setTimeout(() => {
        setIsLogoCenter(false)
        setState("idle")
        setCurrentMessage("")
      }, 3000)
    }
  }, [state])

  const handleMicToggle = () => {
    if (state === "idle") {
      setIsMicActive(true)
      setState("listening")
      setCurrentMessage("Listening... Please speak now.")

      // Simulate listening duration
      setTimeout(() => {
        setIsMicActive(false)
        setState("responding")
        setCurrentMessage(
          "Great question! Let me help you with that. Here is some relevant information about our AI platform...",
        )

        setAgentPosition((prev) => (prev === "left" ? "right" : "left"))

        // Return to idle after response
        setTimeout(() => {
          setState("idle")
          setCurrentMessage("")
        }, 5000)
      }, 3000)
    }
  }

  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="w-full max-w-6xl">
        {isLogoCenter ? (
          <div className="flex flex-col items-center justify-center gap-8">
            <Logo
              size="large"
              glowIntensity={state === "greeting" ? "high" : "medium"}
              animated={state === "greeting"}
            />
            {currentMessage && (
              <p className="text-xl text-center text-white max-w-2xl animate-fade-in">{currentMessage}</p>
            )}
          </div>
        ) : (
          <div className="relative grid md:grid-cols-2 gap-8 items-start">
            <div
              className={`transition-all duration-700 ease-in-out ${
                agentPosition === "left" && currentMessage
                  ? "opacity-100 translate-x-0"
                  : agentPosition === "left"
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
              }`}
              style={{ gridColumn: 1, gridRow: 1 }}
            >
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
                {currentMessage && agentPosition === "left" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-4">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      <span className="text-sm font-medium">{state === "listening" ? "Listening" : "Responding"}</span>
                    </div>
                    <p className="text-lg text-white leading-relaxed animate-fade-in">{currentMessage}</p>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex flex-col items-center gap-6 transition-all duration-1000 ease-in-out z-10 ${
                agentPosition === "left" ? "translate-x-0" : "translate-x-full md:translate-x-[calc(100%+2rem)]"
              }`}
              style={{ gridColumn: 1, gridRow: 1 }}
            >
              <Logo
                size="large"
                glowIntensity={state === "responding" ? "high" : isMicActive ? "medium" : "low"}
                animated={state === "responding"}
              />

              <Button
                size="lg"
                onClick={handleMicToggle}
                disabled={state !== "idle"}
                className={`rounded-full w-16 h-16 p-0 transition-all duration-300 ${
                  isMicActive
                    ? "bg-red-500 hover:bg-red-600 border-red-400"
                    : "bg-purple-600 hover:bg-purple-700 border-purple-500"
                } border-2`}
              >
                {isMicActive ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {state === "idle" && !currentMessage && (
                <p className="text-sm text-gray-400 text-center">Click the microphone to start speaking</p>
              )}
            </div>

            <div
              className={`transition-all duration-700 ease-in-out ${
                agentPosition === "right" && currentMessage
                  ? "opacity-100 translate-x-0"
                  : agentPosition === "right"
                    ? "opacity-0 translate-x-full"
                    : "opacity-0 -translate-x-full"
              }`}
              style={{ gridColumn: 2, gridRow: 1 }}
            >
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
                {currentMessage && agentPosition === "right" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-4">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      <span className="text-sm font-medium">{state === "listening" ? "Listening" : "Responding"}</span>
                    </div>
                    <p className="text-lg text-white leading-relaxed animate-fade-in">{currentMessage}</p>
                  </div>
                ) : (
                  !currentMessage && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-white mb-4">Try asking me:</h2>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400">•</span>
                          <span>What features does your platform offer?</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400">•</span>
                          <span>How can I integrate this with my application?</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400">•</span>
                          <span>Tell me about your pricing plans</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400">•</span>
                          <span>What makes your AI unique?</span>
                        </li>
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
