/**
 * Voice Agent Service
 * RealtimeAgent setup, session management, audio handling, and event system
 */

'use client';

import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { 
  VOICE_CONFIG, 
  MEHAAL_INSTRUCTIONS, 
  AUDIO_CONFIG,
  VoiceEventType,
  type VoiceEvent 
} from './config';
import { 
  detectLanguage, 
  getLanguageInstructions, 
  getMixedLanguageInstructions,
  SupportedLanguage 
} from './languages';
import { 
  detectEmotionFromContext, 
  generateDynamicInstructions, 
  ProfileManager,
  type EmotionType 
} from './profiles';

export interface VoiceAgentConfig {
  apiKey?: string;
  onEvent?: (event: VoiceEvent) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onAudioData?: (data: Float32Array) => void;
  onIntensity?: (intensity: number) => void;
}

export class VoiceAgentService {
  private agent: RealtimeAgent | null = null;
  private session: RealtimeSession | null = null;
  private profileManager: ProfileManager;
  private currentLanguage: SupportedLanguage = SupportedLanguage.ENGLISH;
  private isConnected = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  
  private config: VoiceAgentConfig;
  
  constructor(config: VoiceAgentConfig) {
    this.config = config;
    this.profileManager = new ProfileManager();
  }
  
  /**
   * Initialize voice agent
   */
  async initialize(): Promise<void> {
    try {
      // Create agent with base instructions
      this.agent = new RealtimeAgent({
        name: 'Mehaal',
        instructions: MEHAAL_INSTRUCTIONS,
      });
      
      // Create session with Nova voice
      this.session = new RealtimeSession(this.agent, {
        model: VOICE_CONFIG.model,
        config: {
          voice: VOICE_CONFIG.voice,
          inputAudioFormat: VOICE_CONFIG.audioFormats.input,
          outputAudioFormat: VOICE_CONFIG.audioFormats.output,
          turnDetection: VOICE_CONFIG.turnDetection,
          modalities: VOICE_CONFIG.modalities,
        },
      });
      
      this.setupEventHandlers();
      this.emitEvent(VoiceEventType.CONNECTED);
      
    } catch (error) {
      console.error('Voice agent initialization error:', error);
      this.emitEvent(VoiceEventType.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Connect to OpenAI Realtime API
   */
  async connect(apiKey?: string): Promise<void> {
    if (!this.session) {
      await this.initialize();
    }
    
    try {
      const key = apiKey || this.config.apiKey || process.env.OPENAI_API_KEY;
      
      if (!key) {
        throw new Error('OpenAI API key is required');
      }
      
      await this.session!.connect({ apiKey: key });
      this.isConnected = true;
      
      // Setup audio context for visualization
      await this.setupAudioVisualization();
      
      this.emitEvent(VoiceEventType.CONNECTED);
      
    } catch (error) {
      console.error('Connection error:', error);
      this.emitEvent(VoiceEventType.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Setup audio visualization
   */
  private async setupAudioVisualization(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: AUDIO_CONFIG.echoCancellation,
          noiseSuppression: AUDIO_CONFIG.noiseSuppression,
          autoGainControl: AUDIO_CONFIG.autoGainControl,
        },
      });
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = AUDIO_CONFIG.fftSize;
      this.analyser.smoothingTimeConstant = AUDIO_CONFIG.smoothingTimeConstant;
      
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      // Start analyzing audio for visualization
      this.analyzeAudio();
      
    } catch (error) {
      console.error('Audio setup error:', error);
    }
  }
  
  /**
   * Analyze audio for visualization (intensity)
   */
  private analyzeAudio(): void {
    if (!this.analyser || !this.audioContext) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const analyze = () => {
      if (!this.analyser || this.audioContext?.state === 'closed') return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate intensity
      let sum = 0;
      const meaningfulRange = Math.floor(bufferLength / 2);
      for (let i = 0; i < meaningfulRange; i++) {
        sum += dataArray[i];
      }
      const intensity = (sum / meaningfulRange) * 3.5;
      
      // Emit to callback
      if (this.config.onIntensity) {
        this.config.onIntensity(intensity);
      }
      
      // Emit audio data if needed
      if (this.config.onAudioData) {
        const floatArray = new Float32Array(dataArray.length);
        for (let i = 0; i < dataArray.length; i++) {
          floatArray[i] = dataArray[i] / 255.0;
        }
        this.config.onAudioData(floatArray);
      }
      
      this.animationFrameId = requestAnimationFrame(analyze);
    };
    
    analyze();
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.session) return;
    
    // Audio events
    this.session.on('audio', (event) => {
      this.emitEvent(VoiceEventType.AUDIO_START, event);
    });
    
    // Transcript events
    this.session.on('history_updated', (history) => {
      const lastItem = history[history.length - 1];
      if (lastItem && 'transcript' in lastItem) {
        const transcript = String(lastItem.transcript || '');
        const isFinal = lastItem.type === 'message';
        
        if (this.config.onTranscript) {
          this.config.onTranscript(transcript, isFinal);
        }
        
        // Detect language and emotion
        if (transcript && isFinal) {
          this.handleTranscript(transcript);
        }
      }
    });
  }
  
  /**
   * Handle transcript for language and emotion detection
   */
  private handleTranscript(transcript: string): void {
    // Detect language
    const detectedLanguage = detectLanguage(transcript);
    
    if (detectedLanguage !== this.currentLanguage) {
      this.currentLanguage = detectedLanguage;
      this.updateAgentInstructions();
    }
    
    // Detect emotion
    const detectedEmotion = detectEmotionFromContext({
      userMessage: transcript,
      previousEmotion: this.profileManager.getCurrentEmotion(),
    });
    
    const newEmotion = this.profileManager.setEmotion(detectedEmotion, true);
    
    if (newEmotion !== this.profileManager.getCurrentEmotion()) {
      this.updateAgentInstructions();
    }
  }
  
  /**
   * Update agent instructions based on language and emotion
   */
  private updateAgentInstructions(): void {
    if (!this.agent) return;
    
    const currentEmotion = this.profileManager.getCurrentEmotion();
    const languageInstructions = getLanguageInstructions(this.currentLanguage);
    
    const dynamicInstructions = generateDynamicInstructions(
      MEHAAL_INSTRUCTIONS,
      currentEmotion,
      languageInstructions
    );
    
    // Update agent instructions
    this.agent.instructions = dynamicInstructions;
  }
  
  /**
   * Send text message
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Session not connected');
    }
    
    try {
      await this.session.sendMessage(message);
    } catch (error) {
      console.error('Send message error:', error);
      this.emitEvent(VoiceEventType.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Send audio data
   */
  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Session not connected');
    }
    
    try {
      await this.session.sendAudio(audioData);
    } catch (error) {
      console.error('Send audio error:', error);
      this.emitEvent(VoiceEventType.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Interrupt current response
   */
  interrupt(): void {
    if (!this.session) return;
    
    try {
      this.session.interrupt();
      this.emitEvent(VoiceEventType.INTERRUPT);
    } catch (error) {
      console.error('Interrupt error:', error);
    }
  }
  
  /**
   * Change emotion manually
   */
  setEmotion(emotion: EmotionType): void {
    this.profileManager.setEmotion(emotion, true);
    this.updateAgentInstructions();
  }
  
  /**
   * Change language manually
   */
  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    this.updateAgentInstructions();
  }
  
  /**
   * Get current state
   */
  getState() {
    return {
      isConnected: this.isConnected,
      currentLanguage: this.currentLanguage,
      currentEmotion: this.profileManager.getCurrentEmotion(),
      emotionHistory: this.profileManager.getEmotionHistory(),
    };
  }
  
  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    try {
      // Stop audio analysis
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      
      // Close audio context
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }
      
      // Disconnect session
      if (this.session) {
        // Note: RealtimeSession might not have disconnect method
        // Check SDK documentation for proper cleanup
        this.session = null;
      }
      
      this.isConnected = false;
      this.emitEvent(VoiceEventType.DISCONNECTED);
      
    } catch (error) {
      console.error('Disconnect error:', error);
      this.emitEvent(VoiceEventType.ERROR, error);
    }
  }
  
  /**
   * Emit event to callback
   */
  private emitEvent(type: VoiceEventType, data?: any): void {
    if (this.config.onEvent) {
      const event: VoiceEvent = {
        type,
        data,
        timestamp: Date.now(),
      };
      this.config.onEvent(event);
    }
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    this.disconnect();
    this.profileManager.reset();
  }
}

/**
 * Factory function to create voice agent
 */
export function createVoiceAgent(config: VoiceAgentConfig): VoiceAgentService {
  return new VoiceAgentService(config);
}
