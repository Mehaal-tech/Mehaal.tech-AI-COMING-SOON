"use client"

import { useEffect, useState } from "react"

interface LogoProps {
  size?: "small" | "medium" | "large"
  glowIntensity?: "none" | "low" | "medium" | "high"
  animated?: boolean
  className?: string
}

export function Logo({ size = "medium", glowIntensity = "medium", animated = false, className = "" }: LogoProps) {
  const [currentHue, setCurrentHue] = useState(0)

  useEffect(() => {
    if (!animated) return

    const interval = setInterval(() => {
      setCurrentHue((prev) => (prev + 1) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [animated])

  const sizeMap = {
    small: "w-12 h-12",
    medium: "w-24 h-24",
    large: "w-40 h-40",
  }

  const glowMap = {
    none: "",
    low: "drop-shadow-[0_0_10px_rgba(147,51,234,0.5)]",
    medium: "drop-shadow-[0_0_25px_rgba(147,51,234,0.7)]",
    high: "drop-shadow-[0_0_50px_rgba(147,51,234,1)]",
  }

  return (
    <div className={`relative ${className}`}>
      {/* Dynamic rainbow glow */}
      {glowIntensity !== "none" && (
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-300 ${
            glowIntensity === "high" ? "scale-150" : "scale-100"
          }`}
          style={{
            background: animated
              ? `conic-gradient(from ${currentHue}deg, 
                  hsl(${currentHue}, 100%, 60%), 
                  hsl(${(currentHue + 60) % 360}, 100%, 60%), 
                  hsl(${(currentHue + 120) % 360}, 100%, 60%), 
                  hsl(${(currentHue + 180) % 360}, 100%, 60%), 
                  hsl(${(currentHue + 240) % 360}, 100%, 60%), 
                  hsl(${(currentHue + 300) % 360}, 100%, 60%), 
                  hsl(${currentHue}, 100%, 60%))`
              : "radial-gradient(circle, rgba(147,51,234,0.6) 0%, rgba(236,72,153,0.4) 50%, transparent 70%)",
            opacity: glowIntensity === "high" ? 0.8 : glowIntensity === "medium" ? 0.5 : 0.3,
          }}
        />
      )}

      {/* Logo SVG */}
      <div className={`relative ${sizeMap[size]} ${glowMap[glowIntensity]}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="45" stroke="url(#gradient)" strokeWidth="3" fill="rgba(0,0,0,0.5)" />
          <path
            d="M35 45 L45 55 L65 35"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
