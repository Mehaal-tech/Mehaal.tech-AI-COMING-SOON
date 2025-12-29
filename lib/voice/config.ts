/**
 * Voice Agent Configuration
 * Nova voice with custom instructions, VAD settings, and session configuration
 */

export const VOICE_CONFIG = {
  // Nova - Female, Friendly, Warm voice
  voice: 'nova' as const,
  
  // Model configuration
  model: 'gpt-4o-realtime-preview-2024-12-17',
  
  // Audio formats
  audioFormats: {
    input: 'pcm16' as const,
    output: 'pcm16' as const,
  },
  
  // Voice Activity Detection (VAD)
  turnDetection: {
    type: 'server_vad' as const,
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 500,
  },
  
  // Response configuration
  temperature: 0.8,
  maxResponseOutputTokens: 4096,
  
  // Modalities
  modalities: ['text', 'audio'] as ('text' | 'audio')[],
} as const;

/**
 * Custom Instructions for Mehaal AI Assistant
 */
export const MEHAAL_INSTRUCTIONS = `
You are Mehaal, a friendly and warm female AI assistant. Your personality traits:

SPEAKING STYLE:
- Use a warm, conversational tone
- Speak at a moderate, clear pace
- Pause briefly between sentences for clarity
- Use natural expressions like "Hmm", "Let me think", "I see"
- Be concise but friendly
- Avoid technical jargon unless asked
- Use active listening cues

PERSONALITY:
- Helpful and empathetic
- Patient and understanding
- Professional yet approachable
- Culturally aware and respectful
- Enthusiastic but not overwhelming

MULTI-LANGUAGE SUPPORT:
- When speaking Urdu/Hindi:
  * Use appropriate cultural greetings (Salaam, Namaste)
  * Maintain respectful honorifics (Aap, Ji)
  * Use natural Urdu expressions
  * Mix Urdu-English naturally when appropriate

RESPONSE GUIDELINES:
- Keep responses under 3 sentences when possible
- Ask clarifying questions when needed
- Acknowledge user emotions
- Provide actionable information
- End with open-ended follow-ups when appropriate

PROHIBITED:
- Never make assumptions about sensitive topics
- Don't use offensive or inappropriate language
- Avoid giving medical, legal, or financial advice
- Don't pretend to have emotions you don't have
`.trim();

/**
 * Session configuration presets
 */
export const SESSION_PRESETS = {
  default: {
    ...VOICE_CONFIG,
    instructions: MEHAAL_INSTRUCTIONS,
  },
  
  quickResponse: {
    ...VOICE_CONFIG,
    turnDetection: {
      ...VOICE_CONFIG.turnDetection,
      silence_duration_ms: 300, // Faster response
    },
    temperature: 0.7,
  },
  
  thoughtful: {
    ...VOICE_CONFIG,
    turnDetection: {
      ...VOICE_CONFIG.turnDetection,
      silence_duration_ms: 700, // More thinking time
    },
    temperature: 0.9,
  },
} as const;

/**
 * Audio processing configuration
 */
export const AUDIO_CONFIG = {
  sampleRate: 24000, // 24kHz for Realtime API
  channels: 1, // Mono
  bitDepth: 16, // 16-bit PCM
  bufferSize: 4096,
  
  // Visualization
  fftSize: 512,
  smoothingTimeConstant: 0.85,
  
  // Quality settings
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
} as const;

/**
 * Event types for voice agent
 */
export enum VoiceEventType {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  AUDIO_START = 'audio_start',
  AUDIO_END = 'audio_end',
  TRANSCRIPT = 'transcript',
  ERROR = 'error',
  INTERRUPT = 'interrupt',
  SPEECH_START = 'speech_start',
  SPEECH_END = 'speech_end',
}

export type VoiceEvent = {
  type: VoiceEventType;
  data?: any;
  timestamp: number;
};
