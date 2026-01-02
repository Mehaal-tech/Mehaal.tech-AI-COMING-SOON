"use client"

import { useState } from "react"
import { LoadingAnimation } from "@/components/loading-animation"
import { AIVoiceInterface } from "@/components/ai-voice-interface"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Animated background */}
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(/background.png)",
            backgroundSize: "cover",
            animation: "slideBackground 60s infinite",
          }}
        />
      </div>

      {!loadingComplete ? (
        <LoadingAnimation onComplete={() => setLoadingComplete(true)} />
      ) : (
        <>
          <Header />
          <main className="flex-1 relative z-10">
            <AIVoiceInterface />
          </main>
          <Footer />
        </>
      )}

      <style jsx global>{`
        @keyframes slideBackground {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
