import type { AudioStream } from './types';

/**
 * Voice Agent - Dummy Implementation
 * 
 * TODO: Replace with OpenAI Realtime Voice API
 * Integration point: https://platform.openai.com/docs/api-reference/realtime
 * 
 * Required changes:
 * 1. Add WebSocket connection to OpenAI Realtime API
 * 2. Implement audio streaming
 * 3. Handle real-time transcription
 * 4. Manage conversation state
 */

// Dummy audio stream
class DummyAudioStream implements AudioStream {
  private duration: number;
  private endCallback?: () => void;

  constructor(duration: number) {
    this.duration = duration;
  }

  async play(): Promise<void> {
    // Simulate audio playback
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.endCallback) {
          this.endCallback();
        }
        resolve();
      }, this.duration);
    });
  }

  stop(): void {
    // Stop playback
  }

  onEnd(callback: () => void): void {
    this.endCallback = callback;
  }
}

/**
 * Speak text using AI voice
 * @param text - Text to speak
 * @returns Promise that resolves when speech is complete
 * 
 * TODO: Replace with OpenAI Realtime Voice synthesis
 */
export async function speakText(text: string): Promise<void> {
  // Calculate dummy duration (100ms per word)
  const words = text.split(' ').length;
  const duration = words * 100;

  const stream = new DummyAudioStream(duration);
  await stream.play();
}

/**
 * Start listening for user speech
 * 
 * TODO: Replace with OpenAI Realtime Voice recognition
 */
export function startListening(): void {
  console.log('[Voice Agent] Started listening (dummy)');
  
  // Simulate speech detection
  setTimeout(() => {
    const dummyResult = {
      text: 'User spoke something',
      confidence: 0.95,
      isFinal: true,
    };
    
    // Trigger speech end callback
    onSpeechDetected(dummyResult.text);
  }, 3000);
}

/**
 * Stop listening
 * 
 * TODO: Replace with OpenAI Realtime Voice stop
 */
export function stopListening(): void {
  console.log('[Voice Agent] Stopped listening (dummy)');
}

/**
 * Internal callback when speech is detected
 */
function onSpeechDetected(text: string): void {
  console.log('[Voice Agent] Speech detected:', text);
  // This should trigger state transition in the UI
}

/**
 * Configure voice agent
 * 
 * TODO: Initialize OpenAI Realtime connection with config
 */
export function configureVoiceAgent(config: { apiKey?: string; model?: string }): void {
  console.log('[Voice Agent] Configured (dummy):', config);
}
