'use client';

import { useRef, useCallback } from 'react';
import { useVoiceControl } from './useVoiceControl';
import type { LoadingStatus } from './LoadingIndicator';

export interface VoiceControlState {
  isSpeaking: boolean;
  transcript: string;
  intensity: number;
  voiceError: string;
  isConnected: boolean;
}

interface VoiceControlManagerProps {
  onStateChange: (state: Partial<VoiceControlState>) => void;
  onVoiceReady: (ready: boolean) => void;
  onLoadingStatusChange?: (status: LoadingStatus) => void;
}

export function useVoiceControlManager({ onStateChange, onVoiceReady, onLoadingStatusChange }: VoiceControlManagerProps) {
  const smoothedIntensityRef = useRef(0);
  const hasSpokenRef = useRef(false);
  const fallbackAudioContextRef = useRef<AudioContext | null>(null);
  const fallbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const fallbackRafIdRef = useRef<number | null>(null);
  const isCleaningUpRef = useRef(false);

  const { voiceAgentRef, startAudioVisualizer, speakGreeting } = useVoiceControl({
    onSpeakingChange: (isSpeaking) => onStateChange({ isSpeaking }),
    onTranscriptChange: (transcript) => onStateChange({ transcript }),
    onIntensityChange: (newIntensity) => {
      smoothedIntensityRef.current += (newIntensity - smoothedIntensityRef.current) * 0.15;
      onStateChange({ intensity: Math.round(smoothedIntensityRef.current) });
    },
    onVoiceError: (voiceError) => onStateChange({ voiceError }),
    onConnectionStateChange: (isConnected) => onStateChange({ isConnected }),
    onReady: onVoiceReady,
    onLoadingStatusChange,
  });

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
    onStateChange({ intensity: Math.round(smoothedIntensityRef.current) });

    fallbackRafIdRef.current = requestAnimationFrame(analyzeFallbackAudio);
  }, [onStateChange]);

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
      onStateChange({ voiceError: 'Microphone access denied' });
    }
  }, [analyzeFallbackAudio, onStateChange]);

  const cleanup = useCallback(() => {
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
  }, [voiceAgentRef]);

  return {
    voiceAgentRef,
    startAudioVisualizer,
    speakGreeting,
    setupFallbackAudio,
    cleanup,
    hasSpokenRef,
  };
}
