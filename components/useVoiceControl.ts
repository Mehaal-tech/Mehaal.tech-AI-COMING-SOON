'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createVoiceAgent, VoiceEventType, type VoiceEventType as VoiceEventTypeType, EmotionType } from 'lib/voice';
import { getLoadingStatus, type LoadingStatus } from './LoadingIndicator';
import { analytics } from 'lib/analytics';
import { errorRecovery, ErrorType } from 'lib/errorRecovery';

interface VoiceControlProps {
  onSpeakingChange: (isSpeaking: boolean) => void;
  onTranscriptChange: (transcript: string) => void;
  onIntensityChange: (intensity: number) => void;
  onVoiceError: (error: string) => void;
  onConnectionStateChange: (isConnected: boolean) => void;
  onReady: (isReady: boolean) => void;
  onLoadingStatusChange?: (status: LoadingStatus) => void;
}

/**
 * Voice Control Hook
 * Manages voice agent lifecycle and events
 */
export function useVoiceControl({
  onSpeakingChange,
  onTranscriptChange,
  onIntensityChange,
  onVoiceError,
  onConnectionStateChange,
  onReady,
  onLoadingStatusChange,
}: VoiceControlProps) {
  const voiceAgentRef = useRef<ReturnType<typeof createVoiceAgent> | null>(null);
  const isCleaningUpRef = useRef(false);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [useFallbackVoice, setUseFallbackVoice] = useState(false);
  const connectionStartTime = useRef<number>(0);

  // Initialize voice agent
  useEffect(() => {
    if (typeof window === 'undefined') return;

    isCleaningUpRef.current = false;

    voiceAgentRef.current = createVoiceAgent({
      onEvent: (event) => {
        console.log('Voice event:', event.type);

        if (event.type === VoiceEventType.SPEECH_START) {
          onSpeakingChange(true);
        } else if (event.type === VoiceEventType.SPEECH_END) {
          onSpeakingChange(false);
        } else if (event.type === VoiceEventType.ERROR) {
          console.error('Voice error:', event.data);
          onVoiceError(event.data || 'Unknown voice error');
        }
      },
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          onTranscriptChange(text);
        }
      },
      onIntensity: (newIntensity) => {
        onIntensityChange(newIntensity);
      },
    });

    onReady(true);

    return () => {
      isCleaningUpRef.current = true;

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      if (voiceAgentRef.current) {
        voiceAgentRef.current.destroy();
      }
    };
  }, [onSpeakingChange, onTranscriptChange, onIntensityChange, onVoiceError, onConnectionStateChange, onReady]);

  // Start audio visualizer with timeout handling
  const startAudioVisualizer = useCallback(async (timeoutMs: number = 10000) => {
    if (isCleaningUpRef.current) return;

    connectionStartTime.current = Date.now();
    analytics.track('connection_started');
    onLoadingStatusChange?.(getLoadingStatus('fetching-token'));

    return new Promise<void>(async (resolve, reject) => {
      try {
        // 1. Fetch Token from our secure route
        console.log('📍 Fetching secure token...');
        const response = await fetch('/api/voice', { method: 'POST' });
        const data = await response.json();

        if (!response.ok || !data.client_secret?.value) {
           analytics.track('token_failed', { error: data.error });
           throw new Error(data.error || 'Failed to get token');
        }

        const ephemeralKey = data.client_secret.value;
        console.log('✓ Token received');
        analytics.track('token_fetched');
        onLoadingStatusChange?.(getLoadingStatus('connecting'));

        if (!voiceAgentRef.current) throw new Error('Agent not initialized');

        // 2. Initialize and Connect with Token
        onLoadingStatusChange?.(getLoadingStatus('initializing'));
        await voiceAgentRef.current.initialize();
        await voiceAgentRef.current.connect(ephemeralKey);
        
        const connectionDuration = Date.now() - connectionStartTime.current;
        analytics.track('connection_success', { duration: connectionDuration });
        onConnectionStateChange(true);
        onLoadingStatusChange?.(getLoadingStatus('ready'));
        resolve();

      } catch (err: any) {
        console.error('❌ Connection Failed:', err);
        
        // Enhanced error handling
        const errorDetails = errorRecovery.handleError(err, 'connection');
        analytics.track('connection_failed', { 
          error: err.message,
          errorType: errorDetails.type,
        });
        
        onVoiceError(errorDetails.message);
        onLoadingStatusChange?.(getLoadingStatus('error'));
        setUseFallbackVoice(true);
        
        // Log recovery suggestion
        if (errorDetails.suggestedAction) {
          console.log('💡 Recovery suggestion:', errorDetails.suggestedAction);
        }
        
        resolve();
      }
    });
  }, [onVoiceError, onConnectionStateChange, onLoadingStatusChange]);

  // Speak with browser voice
  const speakWithBrowserVoice = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      onSpeakingChange(true);
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          (v.name.includes('Google') && v.name.includes('Female')) ||
          v.name.includes('Zira') ||
          (v.name.includes('Microsoft') && v.name.includes('Female')) ||
          v.name.includes('Samantha')
      );

      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.1;
      utterance.rate = 0.85;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        onSpeakingChange(false);
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        onSpeakingChange(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [onSpeakingChange]);

  // Speak greeting
  const speakGreeting = useCallback(async () => {
    const greetingText = 'Batayein... main apki kia khidmat kar sakti hun?';

    if (useFallbackVoice || !voiceAgentRef.current) {
      await speakWithBrowserVoice(greetingText);
      return;
    }

    const state = voiceAgentRef.current.getState();
    if (!state.isConnected) {
      console.log('Voice agent not yet connected, using fallback voice');
      setUseFallbackVoice(true);
      await speakWithBrowserVoice(greetingText);
      return;
    }

    onSpeakingChange(true);
    try {
      await voiceAgentRef.current.sendMessage(greetingText);
      onSpeakingChange(false);
    } catch (error) {
      console.error('Greeting error:', error);
      onSpeakingChange(false);
      setUseFallbackVoice(true);
      await speakWithBrowserVoice(greetingText);
    }
  }, [useFallbackVoice, speakWithBrowserVoice, onSpeakingChange]);

  return {
    voiceAgentRef,
    isCleaningUpRef,
    useFallbackVoice,
    startAudioVisualizer,
    speakWithBrowserVoice,
    speakGreeting,
  };
}
