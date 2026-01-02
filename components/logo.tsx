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
    low: "drop-shadow-[0_0_5px_rgba(147,51,234,0.8)]",
    medium: "drop-shadow-[0_0_10px_rgba(147,51,234,0.8)]",
    high: "drop-shadow-[0_0_20px_rgba(147,51,234,0.8)]",
  }

  return (
    <div className={`relative ${className}`}>
      {/* Neon glow leak from edges */}
      {glowIntensity !== "none" && (
        <div
          className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${
            glowIntensity === "high" ? "scale-125" : glowIntensity === "medium" ? "scale-110" : "scale-105"
          }`}
          style={{
            background: "radial-gradient(circle, rgba(147,51,234,0.6) 0%, rgba(147,51,234,0.3) 50%, transparent 70%)",
            opacity: glowIntensity === "high" ? 0.9 : glowIntensity === "medium" ? 0.6 : 0.4,
          }}
        />
      )}

      {/* Logo SVG */}
      <div className={`relative ${sizeMap[size]} ${glowMap[glowIntensity]}`}>
        <svg viewBox="0 0 5679 4835" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            fill="#7967ff"
            d="m2499.27 3150.94c-133.54 131.55-318.47 213.06-522.75 213.06-405.81 0-736.03-322.24-736.03-718.24v-458.16c0-396 330.22-718.24 736.03-718.24 204.28 0 389.21 81.52 522.75 213.07 19.82-24.07 91.15-103.56 207.52-145.83-181.13-193.17-441.41-314.6-730.27-314.6-545.57 0-989.52 433.22-989.52 965.6v458.16c0 532.38 443.95 965.6 989.52 965.6 288.86 0 549.14-121.43 730.27-314.59-116.37-42.17-187.7-121.77-207.52-145.83z"
          />
          <path
            fill="#7967ff"
            d="m3702.07 1222c-283.79 0-540.04 117.16-720.6 304.59 117.07 32.83 193 105.24 220.31 134.7 131.35-119.07 307.29-191.93 500.29-191.93 405.92 0 736.03 322.24 736.03 718.24v458.16c0 198-82.5 377.56-215.81 507.65-133.2 130.09-317.32 210.59-520.22 210.59-193 0-368.94-72.86-500.29-191.93-27.31 29.46-103.24 101.87-220.31 134.7 180.56 187.43 436.81 304.59 720.6 304.59 545.68 0 989.51-433.22 989.51-965.6v-458.16c0-532.38-443.83-965.6-989.51-965.6z"
          />
          <path
            fill="#7967ff"
            d="m2966.03 2645.76v-458.16c0-128.85 35.03-249.83 96.21-354.51-54.73-49.69-126.62-80.16-203.71-82.87-1.38-0.11-2.76-0.22-4.14-0.22-11.76-0.23-23.28 0.11-34.8 1.01-75.59 6.52-145.52 39.58-197.95 91.08 57.96 102.54 90.91 220.37 90.91 345.51v458.16c0 125.14-32.95 242.97-90.91 345.52 52.43 51.49 122.36 84.55 197.95 91.07 11.52 0.9 23.04 1.24 34.8 1.01 1.38 0 2.76-0.11 4.14-0.22 77.09-2.7 148.98-33.17 203.71-82.87-61.18-104.68-96.21-225.66-96.21-354.51z"
          />
          <path
            fill="#7967ff"
            fillRule="evenodd"
            d="m1976.52 1682.99c285.17 0 517.11 226.45 517.11 504.61v458.16c0 278.17-231.94 504.61-517.11 504.61-285.06 0-517.11-226.44-517.11-504.61v-458.16c0-278.16 232.05-504.61 517.11-504.61zm0 247.36c-145.3 0-263.63 115.47-263.63 257.25v458.16c0 141.78 118.33 257.25 263.63 257.25 145.41 0 263.62-115.47 263.62-257.25v-458.16c0-141.78-118.21-257.25-263.62-257.25z"
          />
          <path
            fill="#7967ff"
            fillRule="evenodd"
            d="m3184.95 2645.76v-458.16c0-278.16 232.06-504.61 517.12-504.61 285.17 0 517.11 226.45 517.11 504.61v458.16c0 278.17-231.94 504.61-517.11 504.61-285.06 0-517.12-226.44-517.12-504.61zm253.49 0c0 141.78 118.33 257.25 263.63 257.25 145.41 0 263.62-115.47 263.62-257.25v-458.16c0-141.78-118.21-257.25-263.62-257.25-145.3 0-263.63 115.47-263.63 257.25z"
          />
        </svg>
      </div>
    </div>
  )
}
