'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createVoiceAgent, VoiceEventType, type VoiceEventType as VoiceEventTypeType, EmotionType } from 'lib/voice';

interface VoiceControlProps {
  onSpeakingChange: (isSpeaking: boolean) => void;
  onTranscriptChange: (transcript: string) => void;
  onIntensityChange: (intensity: number) => void;
  onVoiceError: (error: string) => void;
  onConnectionStateChange: (isConnected: boolean) => void;
  onReady: (isReady: boolean) => void;
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
}: VoiceControlProps) {
  const voiceAgentRef = useRef<ReturnType<typeof createVoiceAgent> | null>(null);
  const isCleaningUpRef = useRef(false);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [useFallbackVoice, setUseFallbackVoice] = useState(false);

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

    console.log('📍 startAudioVisualizer called');

    return new Promise<void>((resolve, reject) => {
      // Set up timeout for API connection
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      connectionTimeoutRef.current = setTimeout(() => {
        console.warn('⏱️ Voice agent connection timeout');
        onVoiceError('Connection timeout - using browser voice');
        setUseFallbackVoice(true);
        resolve(); // Still resolve the promise
      }, timeoutMs);

      try {
        const hasApiKey = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        console.log('✓ API key check:', hasApiKey ? 'found' : 'not found');

        if (!hasApiKey) {
          console.warn('⚠️ No OpenAI API key found, using fallback browser voice');
          setUseFallbackVoice(true);
          onVoiceError('Using browser voice (OpenAI key not configured)');
          clearTimeout(connectionTimeoutRef.current!);
          resolve();
          return;
        }

        if (!voiceAgentRef.current) {
          console.error('❌ Voice agent not initialized');
          reject(new Error('Voice agent not initialized'));
          return;
        }

        console.log('✓ Voice agent ref exists');

        // Initialize and connect voice agent
        voiceAgentRef.current
          .initialize()
          .then(() => {
            console.log('✓ Initialize complete');
            return voiceAgentRef.current!.connect(process.env.NEXT_PUBLIC_OPENAI_API_KEY!);
          })
          .then(() => {
            console.log('✓ Connect complete');
            onConnectionStateChange(true);
            clearTimeout(connectionTimeoutRef.current!);
            resolve();
          })
          .catch((err: unknown) => {
            console.error('❌ Voice Agent Error:', err);
            onVoiceError(`OpenAI connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setUseFallbackVoice(true);
            clearTimeout(connectionTimeoutRef.current!);
            resolve(); // Still resolve, we'll use fallback
          });
      } catch (err) {
        console.error('❌ Voice Agent Error in startAudioVisualizer:', err);
        onVoiceError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setUseFallbackVoice(true);
        clearTimeout(connectionTimeoutRef.current!);
        reject(err);
      }
    });
  }, [onVoiceError, onConnectionStateChange]);

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
