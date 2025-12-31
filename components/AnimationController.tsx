'use client';

import { useAnimationController, useLogoStyle } from './useAnimationController';
import { announceToScreenReader, ARIA_LABELS } from 'lib/accessibility';

interface AnimationControllerProps {
  isVoiceReady: boolean;
  intensity: number;
  isSpeaking: boolean;
  voiceAgentRef: React.MutableRefObject<any>;
  startAudioVisualizer: (timeout: number) => Promise<void>;
  speakGreeting: () => void;
  hasSpokenRef: React.MutableRefObject<boolean>;
  onAnimationReady: (ready: boolean) => void;
}

export function useAnimationControllerManager({
  isVoiceReady,
  voiceAgentRef,
  startAudioVisualizer,
  speakGreeting,
  hasSpokenRef,
  onAnimationReady,
}: AnimationControllerProps) {
  const { uiPhase, hue } = useAnimationController({
    onPhaseChange: (phase) => {
      if (phase === 4 && isVoiceReady && !hasSpokenRef.current) {
        // Trigger voice after animation completes
        const timer = setTimeout(async () => {
          console.log('🎤 Starting audio visualizer and voice agent connection...');
          await startAudioVisualizer(10000); // 10 second timeout

          // Wait for connection with timeout
          let connectionWaitAttempts = 0;
          const maxWaitTime = 12; // 12 * 500ms = 6 seconds max

          const waitForConnection = setInterval(() => {
            connectionWaitAttempts++;
            const isConnectedState = voiceAgentRef.current?.getState().isConnected;

            console.log(
              `🔗 Connection check ${connectionWaitAttempts}/${maxWaitTime}: ${isConnectedState ? '✅ CONNECTED' : '⏳ waiting'}`
            );

            if (isConnectedState || connectionWaitAttempts >= maxWaitTime) {
              clearInterval(waitForConnection);

              if (isConnectedState) {
                console.log('✅ Voice agent connected, speaking greeting');
                announceToScreenReader(ARIA_LABELS.SPEAKING);
              } else {
                console.log('⏱️ Connection timeout, speaking with fallback voice');
                announceToScreenReader('Using browser voice due to connection timeout');
              }

              speakGreeting();
              hasSpokenRef.current = true;
            }
          }, 500);
        }, 500);

        return () => clearTimeout(timer);
      }
    },
    onHueChange: () => {}, // Hue changes are handled internally
    onReady: () => onAnimationReady(true),
  });

  return { uiPhase, hue };
}

export function useLogoAnimation(uiPhase: number, hue: number, intensity: number, isSpeaking: boolean) {
  return useLogoStyle(uiPhase, hue, intensity, isSpeaking);
}
