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
  private isInitializing = false;
  private isConnecting = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private reconnectDelay = 1000; // ms
  
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
      console.log('🔧 Initializing voice agent...');
      
      // Prevent re-initialization if already in progress or done
      if (this.isInitializing) {
        console.log('ℹ️ Initialization already in progress, waiting...');
        return;
      }
      
      if (this.agent && this.session) {
        console.log('ℹ️ Agent already initialized, skipping');
        return;
      }
      
      this.isInitializing = true;
      
      // Create agent with base instructions
      this.agent = new RealtimeAgent({
        name: 'Mehaal',
        instructions: MEHAAL_INSTRUCTIONS,
      });
      
      console.log('✓ Agent created:', this.agent.name);
      
      // Create session with optimized OpenAI Realtime API settings
      this.session = new RealtimeSession(this.agent, {
        model: VOICE_CONFIG.model,
        config: {
          voice: VOICE_CONFIG.voice,
          inputAudioFormat: VOICE_CONFIG.audioFormats.input,
          outputAudioFormat: VOICE_CONFIG.audioFormats.output,
          turnDetection: VOICE_CONFIG.turnDetection,
          modalities: VOICE_CONFIG.modalities,
          inputAudioTranscription: VOICE_CONFIG.inputAudioTranscription,
        },
      });
      
      console.log('✓ Session created with model:', VOICE_CONFIG.model);
      
      // Event handlers will be setup AFTER connection succeeds
      console.log('✓ Session ready, event handlers will setup after connection');
      
      this.isInitializing = false;
      
    } catch (error) {
      console.error('❌ Voice agent initialization error:', error);
      this.isInitializing = false;
      this.emitEvent(VoiceEventType.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Connect to OpenAI Realtime API
   */
  async connect(apiKey?: string): Promise<void> {
    // Prevent double connection
    if (this.isConnecting) {
      console.log('⏳ Connection already in progress, skipping');
      return;
    }
    
    if (this.isConnected) {
      console.log('✅ Already connected, skipping');
      return;
    }
    
    if (!this.session) {
      console.log('📍 No session, calling initialize first...');
      await this.initialize();
    }
    
    this.isConnecting = true;
    console.log('🔗 CONNECT METHOD CALLED');
    
    try {
      const key = apiKey || this.config.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      console.log('✓ Got API key:', key ? 'yes' : 'no');
      
      if (!key) {
        throw new Error('OpenAI API key is required');
      }
      
      if (!key.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format');
      }
      
      console.log('🔗 Connecting to OpenAI Realtime API...');
      console.log('📋 API Key:', key.substring(0, 15) + '...');
      
      const session = this.session! as any;
      
      console.log('✓ Session exists, type:', typeof session);
      
      // Try direct connection
      console.log('📡 Attempting session.connect...');
      
      // Some SDK versions require different method names
      if (typeof session.connect === 'function') {
        console.log('✓ session.connect method exists');
        
        try {
          const result = session.connect({ apiKey: key });
          console.log('✓ connect() returned:', typeof result);
          
          if (result && typeof result.then === 'function') {
            console.log('✓ connect returned promise, awaiting...');
            await result;
            console.log('✓ Promise resolved');
          } else {
            console.log('ℹ️ connect returned undefined (event-based)');
          }
        } catch (connectErr) {
          console.error('❌ Error calling session.connect():', connectErr);
          throw connectErr;
        }
      } else if (typeof session.start === 'function') {
        console.log('✓ session.start method exists (using instead of connect)');
        try {
          await session.start({ apiKey: key });
          console.log('✓ start() completed');
        } catch (startErr) {
          console.error('❌ Error calling session.start():', startErr);
          throw startErr;
        }
      } else {
        console.log('⚠️ No connect or start method found on session');
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(session)).filter(m => typeof session[m] === 'function');
        console.log('Available session methods:', methods);
        throw new Error(`No connect/start method. Available: ${methods.join(', ')}`);
      }
      
      // Set connected state after brief delay to allow SDK to initialize
      console.log('⏳ Waiting 500ms for SDK initialization...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // NOW setup event handlers AFTER connection is successful
      this.setupEventHandlers();
      console.log('✓ Event handlers registered after connection');
      
      this.isConnected = true;
      this.isConnecting = false;
      console.log('✅ Successfully connected to OpenAI Realtime API');
      
      // Setup audio context for visualization
      await this.setupAudioVisualization();
      
      this.emitEvent(VoiceEventType.CONNECTED);
      
    } catch (error) {
      console.error('❌ Connection error:', error);
      this.isConnected = false;
      this.isConnecting = false;
      this.emitEvent(VoiceEventType.ERROR, error);
      throw error;
    }
  }
  
  /**
   * Setup audio visualization
   */
  private async setupAudioVisualization(): Promise<void> {
    try {
      console.log('🎧 Setting up audio input...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: AUDIO_CONFIG.echoCancellation,
          noiseSuppression: AUDIO_CONFIG.noiseSuppression,
          autoGainControl: AUDIO_CONFIG.autoGainControl,
        },
      });
      
      console.log('✅ Got user media stream');
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = AUDIO_CONFIG.fftSize;
      this.analyser.smoothingTimeConstant = AUDIO_CONFIG.smoothingTimeConstant;
      
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      console.log('✅ Audio context and analyser connected');
      
      // Start analyzing audio for visualization
      this.analyzeAudio();
      
      // Connect audio stream to RealtimeSession
      if (this.session) {
        try {
          const session = this.session as any;
          
          // Try to connect audio stream to session
          if (typeof session.addTrack === 'function') {
            console.log('📡 Adding audio track to session');
            session.addTrack(stream.getAudioTracks()[0]);
          } else if (typeof session.setAudioStream === 'function') {
            console.log('📡 Setting audio stream on session');
            session.setAudioStream(stream);
          } else {
            console.log('ℹ️ Session audio methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(session)).filter(m => m.includes('audio') || m.includes('track') || m.includes('stream')));
          }
        } catch (err) {
          console.warn('⚠️ Could not connect audio stream to session:', err);
        }
      }
      
    } catch (error) {
      console.error('❌ Audio setup error:', error);
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
    
    // Cast session to EventTarget for proper event handling
    const session = this.session as any;
    
    // Connection lifecycle events
    session.on?.('session.created', () => {
      console.log('✅ Session created event received');
      this.isConnected = true;
      this.emitEvent(VoiceEventType.CONNECTED);
    });
    
    session.on?.('session.updated', () => {
      console.log('ℹ️ Session updated');
    });
    
    // CRITICAL: Handle disconnect event - but only update state if we're actually connected
    session.on?.('disconnected', () => {
      console.log('⚠️ Session disconnected event received');
      if (this.isConnected) {
        this.isConnected = false;
        this.emitEvent(VoiceEventType.DISCONNECTED);
      }
    });
    
    session.on?.('session.deleted', () => {
      console.log('⚠️ Session deleted');
      this.isConnected = false;
    });
    
    // Error events
    session.on?.('error', (error: any) => {
      console.error('❌ Session error event:', error);
      this.emitEvent(VoiceEventType.ERROR, error);
    });
    
    // Audio input events
    session.on?.('input_audio_buffer.committed', () => {
      console.log('🎤 Audio committed');
    });
    
    session.on?.('input_audio_buffer.speech_started', () => {
      console.log('🎙️ Speech started');
      this.emitEvent(VoiceEventType.SPEECH_START);
    });
    
    session.on?.('input_audio_buffer.speech_stopped', () => {
      console.log('🤐 Speech stopped');
      this.emitEvent(VoiceEventType.SPEECH_END);
    });
    
    // Response events
    session.on?.('response.created', () => {
      console.log('💬 Response created');
    });
    
    session.on?.('response.started', () => {
      console.log('▶️ Response started');
    });
    
    session.on?.('response.audio.delta', (event: any) => {
      console.log('🔊 Response audio delta received');
    });
    
    session.on?.('response.audio_transcript.delta', (event: any) => {
      if (event.delta) {
        console.log('📝 Response transcript delta:', event.delta);
      }
    });
    
    session.on?.('response.text.delta', (event: any) => {
      if (event.delta) {
        console.log('📄 Response text:', event.delta);
      }
    });
    
    session.on?.('response.done', () => {
      console.log('✔️ Response completed');
    });
    
    // History updated events
    session.on?.('history_updated', (history: any) => {
      if (!history || history.length === 0) return;
      
      const lastItem = history[history.length - 1];
      if (!lastItem) return;
      
      // Extract transcript from various message types
      let transcript = '';
      
      if ('transcript' in lastItem && typeof lastItem.transcript === 'string') {
        transcript = lastItem.transcript;
      } else if ('content' in lastItem && typeof lastItem.content === 'string') {
        transcript = lastItem.content;
      }
      
      if (transcript) {
        const isFinal = lastItem.type === 'message';
        console.log('💭 Transcript:', transcript, 'Final:', isFinal);
        
        if (this.config.onTranscript) {
          this.config.onTranscript(transcript, isFinal);
        }
        
        // Detect language and emotion
        if (isFinal) {
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
