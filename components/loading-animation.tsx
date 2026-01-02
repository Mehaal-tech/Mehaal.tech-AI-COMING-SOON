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
      { stage: "glow-expand", delay: 2000 },
      { stage: "glow-contract", delay: 2500 },
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
      {/* Full screen glow overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          stage === "glow-expand" ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(236,72,153,0.3) 25%, rgba(59,130,246,0.3) 50%, rgba(16,185,129,0.2) 75%, transparent 100%)",
        }}
      />

      {/* Logo with glow */}
      <div
        className={`relative transition-all duration-700 ${
          stage === "emerge" ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Logo
          size="large"
          glowIntensity={stage === "glow-expand" || stage === "glow-contract" ? "high" : "medium"}
          animated
        />
      </div>
    </div>
  )
}
