'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { useVoiceControlManager, VoiceControlState } from 'components/VoiceControlManager';
import { useAnimationControllerManager, useLogoAnimation } from 'components/AnimationController';
import { PageLayout } from 'components/PageLayout';
import { announceToScreenReader } from 'lib/accessibility';

export default function Page() {
  const [voiceState, setVoiceState] = useState<VoiceControlState>({
    isSpeaking: false,
    transcript: '',
    intensity: 0,
    voiceError: '',
    isConnected: false,
  });
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [isVoiceReady, setIsVoiceReady] = useState(false);

  // Voice control manager
  const {
    voiceAgentRef,
    startAudioVisualizer,
    speakGreeting,
    cleanup,
    hasSpokenRef,
  } = useVoiceControlManager({
    onStateChange: (state) => setVoiceState((prev) => ({ ...prev, ...state })),
    onVoiceReady: setIsVoiceReady,
  });

  // Animation controller manager
  const { uiPhase, hue } = useAnimationControllerManager({
    isVoiceReady,
    intensity: voiceState.intensity,
    isSpeaking: voiceState.isSpeaking,
    voiceAgentRef,
    startAudioVisualizer,
    speakGreeting,
    hasSpokenRef,
    onAnimationReady: setIsAnimationReady,
  });

  // Logo style
  const logoStyle = useLogoAnimation(uiPhase, hue, voiceState.intensity, voiceState.isSpeaking);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Page error:', error, errorInfo);
        announceToScreenReader(`An error occurred: ${error.message}`);
      }}
    >
      <PageLayout
        uiPhase={uiPhase}
        logoStyle={logoStyle}
        isSpeaking={voiceState.isSpeaking}
        voiceError={voiceState.voiceError}
      />
    </ErrorBoundary>
  );
}
