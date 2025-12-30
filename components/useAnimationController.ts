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
 * Animation Controller Hook
 * Manages UI animation sequence and effects
 */
export function useAnimationController({ onPhaseChange, onHueChange, onReady }: AnimationControllerProps) {
  const [uiPhase, setUiPhase] = useState(0);
  const [hue, setHue] = useState(277);
  const hueIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Animation sequence
  useEffect(() => {
    const setupAnimation = () => {
      // Clear previous timeouts
      timeoutRefsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefsRef.current = [];

      const timer1 = setTimeout(() => {
        setUiPhase(1); // Emerge
        onPhaseChange(1);

        const timer2 = setTimeout(() => {
          setUiPhase(2); // Glow
          onPhaseChange(2);

          const timer3 = setTimeout(() => {
            setUiPhase(3); // Flash
            onPhaseChange(3);

            const timer4 = setTimeout(() => {
              setUiPhase(4); // Ready
              onPhaseChange(4);
              onReady();
            }, 3000);

            timeoutRefsRef.current.push(timer4);
          }, 2500);

          timeoutRefsRef.current.push(timer3);
        }, 1000);

        timeoutRefsRef.current.push(timer2);
      }, 100);

      timeoutRefsRef.current.push(timer1);
    };

    setupAnimation();

    return () => {
      timeoutRefsRef.current.forEach((timeout: ReturnType<typeof setTimeout>) => clearTimeout(timeout));
      timeoutRefsRef.current = [];
    };
  }, [onPhaseChange, onReady]);

  // Color cycling
  useEffect(() => {
    if (uiPhase < 4) return;

    hueIntervalRef.current = setInterval(() => {
      setHue((prev: number) => {
        const newHue = (prev + 0.5) % 360;
        onHueChange(newHue);
        return newHue;
      });
    }, 50);

    return () => {
      if (hueIntervalRef.current) {
        clearInterval(hueIntervalRef.current);
      }
    };
  }, [uiPhase, onHueChange]);

  return { uiPhase, hue, hueIntervalRef, timeoutRefsRef };
}

/**
 * Get logo animation styles based on phase
 */
export function useLogoStyle(uiPhase: number, hue: number, intensity: number, isSpeaking: boolean) {
  return useMemo(() => {
    const baseTransition = 'all 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
    const dynamicIntensity = Math.max(20, intensity * 0.8);
    const neonGlow = `
      drop-shadow(0 0 ${dynamicIntensity}px hsl(${hue}, 100%, 60%)) 
      drop-shadow(0 0 ${dynamicIntensity * 2}px hsl(${hue}, 100%, 50%)) 
      drop-shadow(0 0 ${dynamicIntensity * 3}px hsl(${hue}, 100%, 40%))
    `;

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
          filter: neonGlow,
          transition: 'top 1s, left 1s, width 1s, height 1s, opacity 1s, filter 0.1s ease-out, transform 0.3s ease-out',
          willChange: 'filter, transform',
        };
      default:
        return { willChange: 'auto' };
    }
  }, [uiPhase, hue, intensity, isSpeaking]);
}
