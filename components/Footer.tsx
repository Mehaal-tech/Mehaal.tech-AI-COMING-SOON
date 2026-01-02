"use client"

import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="relative z-20 overflow-hidden mt-20">
      {/* Animated footer background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(/placeholder.svg?height=200&width=3840&query=abstract+tech+circuit+pattern)",
          backgroundSize: "cover",
          animation: "slideBackground 40s linear infinite",
        }}
      />

      <div className="relative backdrop-blur-md bg-black/50 border-t border-purple-500/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Footer Logo */}
            <div className="flex items-center gap-3">
              <Logo size="small" glowIntensity="low" />
              <div className="text-sm text-gray-400">
                <p>AI Voice Agent Platform</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>&copy; 2026 AI Voice Agent. All rights reserved.</p>
              <p className="text-xs mt-1">Registered Trademark ®</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
