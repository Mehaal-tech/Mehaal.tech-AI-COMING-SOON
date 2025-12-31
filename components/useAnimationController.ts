'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

interface AnimationControllerProps {
  onPhaseChange: (phase: number) => void;
  onHueChange: (hue: number) => void;
  onReady: () => void;
}

export interface AnimationState {
  uiPhase: number;
  hue: number;
}

/**
 * Helper: Sleep utility for async/await
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Animation Controller Hook - Refactored for Performance
 * - Async/await animation sequence (no callback hell)
 * - Hue cycling moved to pure CSS (no JS setInterval)
 * - Reduced React re-renders
 */
export function useAnimationController({ onPhaseChange, onHueChange, onReady }: AnimationControllerProps) {
  const [uiPhase, setUiPhase] = useState(0);
  // 🔒 REMOVED: hue state is now CSS-driven, no JS updates needed
  const abortControllerRef = useRef<AbortController | null>(null);

  // Animation sequence with async/await
  useEffect(() => {
    const runAnimationSequence = async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await sleep(100);
        if (controller.signal.aborted) return;
        setUiPhase(1);
        onPhaseChange(1);

        await sleep(1000);
        if (controller.signal.aborted) return;
        setUiPhase(2);
        onPhaseChange(2);

        await sleep(2500);
        if (controller.signal.aborted) return;
        setUiPhase(3);
        onPhaseChange(3);

        await sleep(3000);
        if (controller.signal.aborted) return;
        setUiPhase(4);
        onPhaseChange(4);
        onReady();
      } catch (error) {
        console.error('Animation sequence error:', error);
      }
    };

    runAnimationSequence();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [onPhaseChange, onReady]);

  // 🔒 REMOVED: setInterval hue loop
  // CSS animation handles hue-rotate in globals.css
  // This eliminates ~20 React re-renders per second!

  return { uiPhase, hue: 277 }; // Return constant hue (CSS handles animation)
}

/**
 * Get logo animation styles based on phase
 * Optimized for audio reactivity with minimal recalculation
 */
export function useLogoStyle(uiPhase: number, hue: number, intensity: number, isSpeaking: boolean) {
  return useMemo(() => {
    const baseTransition = 'all 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
    const dynamicIntensity = Math.max(20, intensity * 0.8);

    switch (uiPhase) {
      case 0:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0)',
          opacity: 0,
          width: '20rem',
          height: '20rem',
          transition: baseTransition,
          willChange: 'transform, opacity',
        };
      case 1:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          width: '20rem',
          height: '20rem',
          transition: baseTransition,
          willChange: 'transform, opacity',
        };
      case 2:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1.05)',
          opacity: 1,
          width: '20rem',
          height: '20rem',
          filter: 'drop-shadow(0 0 60px rgba(157, 0, 255, 0.8))',
          transition: baseTransition,
          willChange: 'transform, filter',
        };
      case 3:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1.2)',
          opacity: 0,
          width: '20rem',
          height: '20rem',
          transition: 'all 0.3s',
          willChange: 'transform, opacity',
        };
      case 4:
        return {
          top: '35%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${isSpeaking ? 1 + intensity / 800 : 1})`,
          opacity: 1,
          width: '20rem',
          height: '20rem',
          className: "animate-hue",
          filter: isSpeaking ? `drop-shadow(0 0 ${dynamicIntensity}px #9D00FF)` : undefined,
          transition: 'top 1s, left 1s, width 1s, height 1s, opacity 1s, filter 0.1s ease-out, transform 0.3s ease-out',
          willChange: 'filter, transform',
        };
      default:
        return { willChange: 'auto' };
    }
  }, [uiPhase, intensity, isSpeaking]);
}
