'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Header from 'components/Header';
import Hero from 'components/Hero';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { useVoiceControl } from 'components/useVoiceControl';
import { useAnimationController, useLogoStyle } from 'components/useAnimationController';
import { announceToScreenReader, ARIA_LABELS } from 'lib/accessibility';

export default function Page() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [intensity, setIntensity] = useState(0);
  const [voiceError, setVoiceError] = useState<string>('');
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const smoothedIntensityRef = useRef(0);
  const hasSpokenRef = useRef(false);
  const fallbackAudioContextRef = useRef<AudioContext | null>(null);
  const fallbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const fallbackRafIdRef = useRef<number | null>(null);
  const isCleaningUpRef = useRef(false);

  // Voice control hook
  const { voiceAgentRef, startAudioVisualizer, speakGreeting } = useVoiceControl({
    onSpeakingChange: setIsSpeaking,
    onTranscriptChange: setTranscript,
    onIntensityChange: (newIntensity) => {
      smoothedIntensityRef.current += (newIntensity - smoothedIntensityRef.current) * 0.15;
      setIntensity(Math.round(smoothedIntensityRef.current));
    },
    onVoiceError: setVoiceError,
    onConnectionStateChange: setIsConnected,
    onReady: setIsVoiceReady,
  });

  // Animation controller hook
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
    onReady: () => setIsAnimationReady(true),
  });

  // Get logo style
  const logoStyle = useLogoStyle(uiPhase, hue, intensity, isSpeaking);

  // Fallback audio analysis
  const analyzeFallbackAudio = useCallback(() => {
    if (isCleaningUpRef.current) return;

    const analyser = fallbackAnalyserRef.current;
    if (!analyser || fallbackAudioContextRef.current?.state === 'closed') return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    const meaningfulRange = Math.floor(bufferLength / 2);
    for (let i = 0; i < meaningfulRange; i++) {
      sum += dataArray[i];
    }
    const rawAverage = sum / meaningfulRange;
    const targetIntensity = Math.min(rawAverage * 3.5, 255);

    smoothedIntensityRef.current += (targetIntensity - smoothedIntensityRef.current) * 0.15;
    setIntensity(Math.round(smoothedIntensityRef.current));

    fallbackRafIdRef.current = requestAnimationFrame(analyzeFallbackAudio);
  }, []);

  // Setup fallback audio
  const setupFallbackAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      fallbackAudioContextRef.current = audioCtx;
      fallbackAnalyserRef.current = analyser;

      analyzeFallbackAudio();
    } catch (err) {
      console.error('Fallback audio setup error:', err);
      announceToScreenReader('Microphone access denied');
    }
  }, [analyzeFallbackAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCleaningUpRef.current = true;

      if (fallbackRafIdRef.current) {
        cancelAnimationFrame(fallbackRafIdRef.current);
      }

      if (fallbackAudioContextRef.current && fallbackAudioContextRef.current.state !== 'closed') {
        try {
          fallbackAudioContextRef.current.close();
        } catch (e) {
          console.error('Error closing audio context:', e);
        }
      }

      if (voiceAgentRef.current) {
        voiceAgentRef.current.disconnect();
      }

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const flashOverlayClass = useMemo(
    () =>
      uiPhase === 3
        ? 'opacity-80 pointer-events-auto duration-500 ease-in-out'
        : 'opacity-0 pointer-events-none duration-[1500ms] ease-out',
    [uiPhase]
  );

  const backgroundStyle = useMemo(
    () =>
      uiPhase >= 4
        ? {
            backgroundImage: 'url("/brand/wave-gradient.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }
        : {},
    [uiPhase]
  );

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Page error:', error, errorInfo);
        announceToScreenReader(`An error occurred: ${error.message}`);
      }}
    >
      <>
        {/* Error/Status Message */}
        {voiceError && uiPhase >= 4 && (
          <div
            className="fixed top-4 right-4 z-[60] bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-md rounded-lg px-4 py-2 text-yellow-300 text-sm animate-fade-in"
            role="alert"
            aria-live="polite"
          >
            <span className="sr-only">Warning:</span> ⚠️ {voiceError}
          </div>
        )}

        <div
          className="flex flex-col min-h-screen bg-black relative overflow-hidden transition-all duration-1000"
          style={backgroundStyle}
          id="main-content"
        >
          {/* FLASH OVERLAY */}
          <div className={`fixed inset-0 z-[100] bg-purple-300 mix-blend-overlay ${flashOverlayClass}`}></div>
          <div className={`fixed inset-0 z-[99] bg-white/80 ${flashOverlayClass}`}></div>

          {/* Overlay */}
          {uiPhase >= 4 && <div className="absolute inset-0 bg-black/30 transition-opacity duration-1000"></div>}

          {/* HERO LOGO - Priority LCP Image */}
          <Image
            src="/brand/mehaal-logo.svg"
            alt={ARIA_LABELS.LOGO}
            className="fixed z-50 object-contain"
            style={logoStyle as any}
            priority
            draggable={false}
            width={400}
            height={400}
            aria-label={isSpeaking ? ARIA_LABELS.SPEAKING : ARIA_LABELS.LOGO}
          />

          {/* Content */}
          <div className={`relative z-10 transition-opacity duration-1000 ${uiPhase === 4 ? 'opacity-100' : 'opacity-0'}`}>
            <Header navItems={[]} showThemeSwitch={false} />
            <main>
              <Hero title="Coming Soon" subtitle="Intelligence beyond impossible" buttons={[]} />
            </main>
          </div>
        </div>
      </>
    </ErrorBoundary>
  );
}
