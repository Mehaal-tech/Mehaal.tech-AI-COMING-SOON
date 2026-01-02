"use client"

import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"

interface LoadingAnimationProps {
  onComplete: () => void
}

export function LoadingAnimation({ onComplete }: LoadingAnimationProps) {
  const [stage, setStage] = useState<"emerge" | "glow-expand" | "glow-contract" | "complete">("emerge")

  useEffect(() => {
    const timeline = [
      { stage: "emerge", delay: 500 },
      { stage: "glow-expand", delay: 1500 },
      { stage: "glow-contract", delay: 2000 },
      { stage: "complete", delay: 1500 },
    ]

    let timeoutId: NodeJS.Timeout

    const currentStageIndex = timeline.findIndex((t) => t.stage === stage)
    if (currentStageIndex < timeline.length - 1) {
      const nextStage = timeline[currentStageIndex + 1]
      timeoutId = setTimeout(() => {
        setStage(nextStage.stage as any)
      }, timeline[currentStageIndex].delay)
    } else if (stage === "complete") {
      timeoutId = setTimeout(onComplete, 500)
    }

    return () => clearTimeout(timeoutId)
  }, [stage, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Glow effect from logo */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          stage === "glow-expand" ? "scale-100 opacity-100" :
          stage === "glow-contract" ? "scale-50 opacity-80" :
          "scale-0 opacity-0"
        }`}
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.8) 0%, rgba(147,51,234,0.4) 30%, rgba(147,51,234,0.2) 50%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div
        className={`relative transition-all duration-700 ${
          stage === "emerge" ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Logo
          size="large"
          glowIntensity="none"
          animated={false}
        />
      </div>
    </div>
  )
}
