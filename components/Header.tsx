"use client"

import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 overflow-hidden">
      {/* Animated header background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(/placeholder.svg?height=200&width=3840&query=abstract+tech+circuit+pattern)",
          backgroundSize: "cover",
          animation: "slideBackground 40s linear infinite",
        }}
      />

      <div
        className={`relative backdrop-blur-md bg-black/50 border-b border-purple-500/20 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with slide-in navigation */}
            <div className="flex items-center gap-8">
              <Logo size="small" glowIntensity="low" />

              <nav
                className={`flex items-center gap-6 transition-all duration-500 delay-300 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
                }`}
              >
                <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#demo" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Demo
                </a>
                <a href="#about" className="text-sm text-gray-300 hover:text-white transition-colors">
                  About
                </a>
              </nav>
            </div>

            <Button
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
