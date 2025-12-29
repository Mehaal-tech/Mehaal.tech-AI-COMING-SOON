/**
 * Multi-language Support
 * Automatic language detection and voice adaptation
 */

export enum SupportedLanguage {
  ENGLISH = 'en',
  URDU = 'ur',
  HINDI = 'hi',
  ARABIC = 'ar',
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  voiceInstructions: string;
  greetings: string[];
  farewells: string[];
}

/**
 * Language configurations with cultural context
 */
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  [SupportedLanguage.ENGLISH]: {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    rtl: false,
    voiceInstructions: 'Speak in clear, neutral American English with a warm, friendly tone.',
    greetings: ['Hello', 'Hi there', 'Good to see you', 'Welcome'],
    farewells: ['Goodbye', 'Take care', 'See you soon', 'Have a great day'],
  },
  
  [SupportedLanguage.URDU]: {
    code: 'ur-PK',
    name: 'Urdu',
    nativeName: 'اردو',
    rtl: true,
    voiceInstructions: `
      Speak in Urdu with a natural Pakistani accent. 
      Use respectful honorifics (Aap, Ji, Sahib/Sahiba).
      Mix English words naturally when discussing technical topics.
      Maintain warm, culturally appropriate expressions.
      Use appropriate Islamic greetings (Assalamu Alaikum) when suitable.
    `,
    greetings: [
      'السلام علیکم',
      'آداب',
      'خوش آمدید',
      'کیا حال ہے؟',
    ],
    farewells: [
      'اللہ حافظ',
      'خدا حافظ',
      'پھر ملیں گے',
      'اللہ کی امان',
    ],
  },
  
  [SupportedLanguage.HINDI]: {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    rtl: false,
    voiceInstructions: `
      Speak in Hindi with a clear, neutral accent.
      Use respectful forms (Aap instead of Tum).
      Mix English words naturally for technical terms.
      Use appropriate cultural expressions and idioms.
    `,
    greetings: [
      'नमस्ते',
      'प्रणाम',
      'आपका स्वागत है',
      'कैसे हैं आप?',
    ],
    farewells: [
      'नमस्ते',
      'फिर मिलेंगे',
      'धन्यवाद',
      'शुभ दिन',
    ],
  },
  
  [SupportedLanguage.ARABIC]: {
    code: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    rtl: true,
    voiceInstructions: `
      Speak in Modern Standard Arabic with clarity.
      Use respectful forms and appropriate honorifics.
      Maintain formal yet warm tone.
      Use Islamic greetings appropriately.
    `,
    greetings: [
      'السلام عليكم',
      'مرحبا',
      'أهلا وسهلا',
      'كيف حالك؟',
    ],
    farewells: [
      'مع السلامة',
      'في أمان الله',
      'إلى اللقاء',
      'وداعا',
    ],
  },
};

/**
 * Language Detection Patterns
 */
const LANGUAGE_PATTERNS = {
  // Urdu/Arabic script (U+0600 to U+06FF)
  urdu: /[\u0600-\u06FF]/,
  
  // Devanagari script (Hindi) (U+0900 to U+097F)
  hindi: /[\u0900-\u097F]/,
  
  // Arabic script
  arabic: /[\u0600-\u06FF]/,
  
  // English (basic Latin)
  english: /^[a-zA-Z0-9\s.,!?'"()-]+$/,
};

/**
 * Detect language from text
 */
export function detectLanguage(text: string): SupportedLanguage {
  if (!text || text.trim().length === 0) {
    return SupportedLanguage.ENGLISH;
  }
  
  // Check for Devanagari (Hindi) first as it's most specific
  if (LANGUAGE_PATTERNS.hindi.test(text)) {
    return SupportedLanguage.HINDI;
  }
  
  // Check for Arabic/Urdu script
  if (LANGUAGE_PATTERNS.urdu.test(text)) {
    // Distinguish between Urdu and Arabic (simplified heuristic)
    // Urdu typically has more Persian/Urdu-specific letters
    return text.includes('ے') || text.includes('ں') 
      ? SupportedLanguage.URDU 
      : SupportedLanguage.ARABIC;
  }
  
  // Default to English
  return SupportedLanguage.ENGLISH;
}

/**
 * Get language-specific instructions
 */
export function getLanguageInstructions(language: SupportedLanguage): string {
  const config = LANGUAGE_CONFIGS[language];
  return config.voiceInstructions;
}

/**
 * Get random greeting in language
 */
export function getGreeting(language: SupportedLanguage): string {
  const config = LANGUAGE_CONFIGS[language];
  const randomIndex = Math.floor(Math.random() * config.greetings.length);
  return config.greetings[randomIndex];
}

/**
 * Get random farewell in language
 */
export function getFarewell(language: SupportedLanguage): string {
  const config = LANGUAGE_CONFIGS[language];
  const randomIndex = Math.floor(Math.random() * config.farewells.length);
  return config.farewells[randomIndex];
}

/**
 * Check if language is RTL (Right-to-Left)
 */
export function isRTL(language: SupportedLanguage): boolean {
  return LANGUAGE_CONFIGS[language].rtl;
}

/**
 * Get mixed language instructions for code-switching
 */
export function getMixedLanguageInstructions(
  primary: SupportedLanguage,
  secondary: SupportedLanguage
): string {
  const primaryConfig = LANGUAGE_CONFIGS[primary];
  const secondaryConfig = LANGUAGE_CONFIGS[secondary];
  
  return `
    Primary language: ${primaryConfig.name}
    Secondary language: ${secondaryConfig.name}
    
    Instructions:
    ${primaryConfig.voiceInstructions}
    
    You may naturally code-switch to ${secondaryConfig.name} for:
    - Technical terms
    - Modern concepts
    - When user switches language mid-conversation
    
    Maintain cultural sensitivity and naturalness in both languages.
  `.trim();
}

/**
 * Language-aware text formatting
 */
export function formatTextForLanguage(
  text: string,
  language: SupportedLanguage
): string {
  const config = LANGUAGE_CONFIGS[language];
  
  if (config.rtl) {
    // Add RTL mark for proper rendering
    return '\u200F' + text + '\u200F';
  }
  
  return text;
}
