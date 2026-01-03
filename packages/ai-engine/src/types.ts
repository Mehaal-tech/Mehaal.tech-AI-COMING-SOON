export interface VoiceAgentConfig {
  model: string;
  voiceId: string;
  apiKey?: string;
}

export interface AudioStream {
  play(): Promise<void>;
  stop(): void;
  onEnd(callback: () => void): void;
}

export interface SpeechResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface Command {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
}

export interface MemoryEntry {
  id: string;
  timestamp: number;
  content: string;
  metadata?: Record<string, any>;
}
