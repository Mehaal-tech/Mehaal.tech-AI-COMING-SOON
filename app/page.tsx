'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { useVoiceControlManager, VoiceControlState } from 'components/VoiceControlManager';
import { useAnimationControllerManager, useLogoAnimation } from 'components/AnimationController';
import { PageLayout } from 'components/PageLayout';
import { LoadingIndicator, getLoadingStatus, type LoadingStatus } from 'components/LoadingIndicator';
import { ConnectionQuality } from 'components/ConnectionQuality';
import { announceToScreenReader } from 'lib/accessibility';
import { analytics } from 'lib/analytics';
import { registerServiceWorker } from 'lib/serviceWorker';

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
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(getLoadingStatus('idle'));
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'disconnected'>('disconnected');
  const [latency, setLatency] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);

  // Retry connection handler
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setLoadingStatus(getLoadingStatus('idle'));
    analytics.track('connection_retry', { attempt: retryCount + 1 });
    // Trigger reconnection by resetting states
    setVoiceState((prev) => ({ ...prev, voiceError: '', isConnected: false }));
    window.location.reload(); // Simple full reload for now
  };

  // Voice control manager
  const {
    voiceAgentRef,
    startAudioVisualizer,
    speakGreeting,
    cleanup,
    hasSpokenRef,
  } = useVoiceControlManager({
    onStateChange: (state) => {
      setVoiceState((prev) => ({ ...prev, ...state }));
      // Update connection quality based on state
      if (state.isConnected) {
        setConnectionQuality('excellent');
        setLoadingStatus(getLoadingStatus('ready'));
      } else if (state.voiceError) {
        setConnectionQuality('disconnected');
        setLoadingStatus(getLoadingStatus('error'));
      }
    },
    onVoiceReady: setIsVoiceReady,
    onLoadingStatusChange: setLoadingStatus,
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

  // Register service worker for offline support
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Page error:', error, errorInfo);
        announceToScreenReader(`An error occurred: ${error.message}`);
      }}
    >
      <LoadingIndicator
        status={loadingStatus}
        onRetry={handleRetry}
        showRetry={loadingStatus.stage === 'error'}
      />
      <ConnectionQuality
        quality={connectionQuality}
        latency={latency}
        isVisible={voiceState.isConnected && uiPhase === 4}
      />
      <PageLayout
        uiPhase={uiPhase}
        logoStyle={logoStyle}
        isSpeaking={voiceState.isSpeaking}
        voiceError={voiceState.voiceError}
      />
    </ErrorBoundary>
  );
}
