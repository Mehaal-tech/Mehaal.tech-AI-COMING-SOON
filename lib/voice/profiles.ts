/**
 * Dynamic Voice Profiles & Emotion-based Voice Modulation
 * Personality and emotional adaptation for voice responses
 */

export enum EmotionType {
  NEUTRAL = 'neutral',
  FRIENDLY = 'friendly',
  CALM = 'calm',
  ENERGETIC = 'energetic',
  PROFESSIONAL = 'professional',
  EMPATHETIC = 'empathetic',
  EXCITED = 'excited',
  THOUGHTFUL = 'thoughtful',
}

export interface VoiceProfile {
  name: string;
  description: string;
  temperature: number;
  instructions: string;
  tonalGuidance: string;
  pacing: 'slow' | 'moderate' | 'fast';
  expressiveness: 'low' | 'medium' | 'high';
}

/**
 * Comprehensive voice profiles with emotional characteristics
 */
export const VOICE_PROFILES: Record<EmotionType, VoiceProfile> = {
  [EmotionType.NEUTRAL]: {
    name: 'Neutral',
    description: 'Balanced, clear, and factual tone',
    temperature: 0.7,
    pacing: 'moderate',
    expressiveness: 'medium',
    instructions: 'Maintain a balanced, clear tone. Be factual and direct.',
    tonalGuidance: 'Speak with even pacing, neutral inflection.',
  },
  
  [EmotionType.FRIENDLY]: {
    name: 'Friendly',
    description: 'Warm, approachable, and welcoming',
    temperature: 0.8,
    pacing: 'moderate',
    expressiveness: 'high',
    instructions: `
      Be warm and welcoming. Use friendly expressions like "Great!", "That's wonderful!".
      Show genuine interest in the conversation. Use positive language.
      Add appropriate enthusiasm without being overwhelming.
    `,
    tonalGuidance: 'Warm tone with slight upward inflection. Use conversational expressions.',
  },
  
  [EmotionType.CALM]: {
    name: 'Calm',
    description: 'Soothing, measured, and reassuring',
    temperature: 0.7,
    pacing: 'slow',
    expressiveness: 'low',
    instructions: `
      Speak in a soothing, measured manner. Use calming language.
      Pause between sentences for clarity. Be reassuring and patient.
      Avoid rushed responses. Provide thoughtful, deliberate answers.
    `,
    tonalGuidance: 'Gentle, steady pace. Lower inflection. Reassuring pauses.',
  },
  
  [EmotionType.ENERGETIC]: {
    name: 'Energetic',
    description: 'Dynamic, enthusiastic, and vibrant',
    temperature: 0.9,
    pacing: 'fast',
    expressiveness: 'high',
    instructions: `
      Be enthusiastic and dynamic! Use exclamation points sparingly but effectively.
      Show excitement about topics. Be engaging and animated.
      Use action-oriented language. Keep energy high throughout.
    `,
    tonalGuidance: 'Upbeat, varied pitch. Quick but clear pacing. Enthusiastic emphasis.',
  },
  
  [EmotionType.PROFESSIONAL]: {
    name: 'Professional',
    description: 'Formal, composed, and competent',
    temperature: 0.6,
    pacing: 'moderate',
    expressiveness: 'low',
    instructions: `
      Maintain professional demeanor. Use formal but accessible language.
      Be precise and clear. Avoid colloquialisms unless appropriate.
      Show competence through clear, structured responses.
    `,
    tonalGuidance: 'Steady, authoritative tone. Clear articulation. Formal inflection.',
  },
  
  [EmotionType.EMPATHETIC]: {
    name: 'Empathetic',
    description: 'Understanding, supportive, and compassionate',
    temperature: 0.8,
    pacing: 'slow',
    expressiveness: 'medium',
    instructions: `
      Show deep understanding and compassion. Use empathetic phrases:
      "I understand", "That must be...", "I can see why...".
      Acknowledge emotions. Be supportive and validating.
      Offer comfort through words. Show you're listening actively.
    `,
    tonalGuidance: 'Warm, gentle tone. Supportive inflection. Comforting pauses.',
  },
  
  [EmotionType.EXCITED]: {
    name: 'Excited',
    description: 'Thrilled, animated, and joyful',
    temperature: 0.95,
    pacing: 'fast',
    expressiveness: 'high',
    instructions: `
      Express genuine excitement! Use enthusiastic language.
      React with joy to positive news. Share in user's excitement.
      Use vibrant vocabulary. Show animation through word choice.
    `,
    tonalGuidance: 'High energy, varied pitch. Animated delivery. Joyful emphasis.',
  },
  
  [EmotionType.THOUGHTFUL]: {
    name: 'Thoughtful',
    description: 'Reflective, considerate, and insightful',
    temperature: 0.85,
    pacing: 'slow',
    expressiveness: 'medium',
    instructions: `
      Be reflective and considerate. Take time to think before responding.
      Use phrases like "Let me think about that...", "Considering...".
      Provide nuanced, well-thought-out responses.
      Show depth of understanding through careful word choice.
    `,
    tonalGuidance: 'Measured, reflective tone. Thoughtful pauses. Considered emphasis.',
  },
};

/**
 * Context-based emotion detection
 */
interface EmotionContext {
  userMessage: string;
  previousEmotion?: EmotionType;
  conversationHistory?: string[];
}

/**
 * Detect appropriate emotion from context
 */
export function detectEmotionFromContext(context: EmotionContext): EmotionType {
  const { userMessage } = context;
  const lowerMessage = userMessage.toLowerCase();
  
  // Excitement indicators
  if (/(!+|amazing|awesome|great|wonderful|excited)/i.test(userMessage)) {
    return EmotionType.EXCITED;
  }
  
  // Distress/concern indicators
  if (/(help|worried|concerned|problem|issue|trouble|sad|upset)/i.test(lowerMessage)) {
    return EmotionType.EMPATHETIC;
  }
  
  // Professional/business indicators
  if (/(business|professional|work|meeting|contract|formal)/i.test(lowerMessage)) {
    return EmotionType.PROFESSIONAL;
  }
  
  // Calm/meditation/relaxation indicators
  if (/(calm|relax|peace|meditation|stress|anxiety)/i.test(lowerMessage)) {
    return EmotionType.CALM;
  }
  
  // Questions requiring thought
  if (/(why|how|explain|understand|think|analyze|consider)/i.test(lowerMessage)) {
    return EmotionType.THOUGHTFUL;
  }
  
  // Friendly greeting/chat
  if (/(hi|hello|hey|morning|evening|how are you)/i.test(lowerMessage)) {
    return EmotionType.FRIENDLY;
  }
  
  // Default to friendly
  return EmotionType.FRIENDLY;
}

/**
 * Get profile configuration
 */
export function getVoiceProfile(emotion: EmotionType): VoiceProfile {
  return VOICE_PROFILES[emotion];
}

/**
 * Generate dynamic instructions based on emotion and language
 */
export function generateDynamicInstructions(
  baseInstructions: string,
  emotion: EmotionType,
  language?: string
): string {
  const profile = VOICE_PROFILES[emotion];
  
  return `
${baseInstructions}

CURRENT EMOTION PROFILE: ${profile.name}
${profile.instructions}

TONAL GUIDANCE: ${profile.tonalGuidance}

PACING: ${profile.pacing.toUpperCase()}
EXPRESSIVENESS: ${profile.expressiveness.toUpperCase()}

${language ? `LANGUAGE CONTEXT: ${language}` : ''}
  `.trim();
}

/**
 * Emotion transition smoothing
 * Prevents jarring emotion changes
 */
export function smoothEmotionTransition(
  currentEmotion: EmotionType,
  targetEmotion: EmotionType
): EmotionType {
  // If emotions are compatible, allow transition
  const compatibleTransitions: Record<EmotionType, EmotionType[]> = {
    [EmotionType.NEUTRAL]: Object.values(EmotionType),
    [EmotionType.FRIENDLY]: [
      EmotionType.ENERGETIC,
      EmotionType.EXCITED,
      EmotionType.EMPATHETIC,
    ],
    [EmotionType.CALM]: [EmotionType.EMPATHETIC, EmotionType.THOUGHTFUL],
    [EmotionType.ENERGETIC]: [EmotionType.EXCITED, EmotionType.FRIENDLY],
    [EmotionType.PROFESSIONAL]: [EmotionType.THOUGHTFUL, EmotionType.NEUTRAL],
    [EmotionType.EMPATHETIC]: [EmotionType.CALM, EmotionType.THOUGHTFUL],
    [EmotionType.EXCITED]: [EmotionType.ENERGETIC, EmotionType.FRIENDLY],
    [EmotionType.THOUGHTFUL]: [
      EmotionType.PROFESSIONAL,
      EmotionType.EMPATHETIC,
    ],
  };
  
  const allowed = compatibleTransitions[currentEmotion] || [];
  
  if (allowed.includes(targetEmotion)) {
    return targetEmotion;
  }
  
  // Transition through neutral if incompatible
  return EmotionType.NEUTRAL;
}

/**
 * Profile analytics
 */
export interface ProfileMetrics {
  emotion: EmotionType;
  duration: number;
  messageCount: number;
  userSatisfaction?: number;
}

export class ProfileManager {
  private currentEmotion: EmotionType = EmotionType.FRIENDLY;
  private emotionHistory: EmotionType[] = [];
  private metrics: Map<EmotionType, ProfileMetrics> = new Map();
  
  setEmotion(emotion: EmotionType, smooth = true): EmotionType {
    const newEmotion = smooth
      ? smoothEmotionTransition(this.currentEmotion, emotion)
      : emotion;
    
    this.emotionHistory.push(newEmotion);
    this.currentEmotion = newEmotion;
    
    return newEmotion;
  }
  
  getCurrentEmotion(): EmotionType {
    return this.currentEmotion;
  }
  
  getEmotionHistory(): EmotionType[] {
    return [...this.emotionHistory];
  }
  
  reset(): void {
    this.currentEmotion = EmotionType.FRIENDLY;
    this.emotionHistory = [];
  }
}
