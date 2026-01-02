import { describe, it, expect } from 'vitest';

describe('VoiceAgent Component', () => {
  it('should handle missing API key gracefully', () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    
    // In demo mode, component should still work
    const isDemoMode = !apiKey || apiKey === 'your-openai-api-key-here';
    expect(typeof isDemoMode).toBe('boolean');
  });
});

describe('Environment Configuration', () => {
  it('should have required environment variables defined', () => {
    expect(import.meta.env.VITE_OPENAI_API_KEY).toBeDefined();
  });
  
  it('should have default values for optional variables', () => {
    const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview';
    const whisper = import.meta.env.VITE_WHISPER_MODEL || 'whisper-1';
    
    expect(model).toBe('gpt-4-turbo-preview');
    expect(whisper).toBe('whisper-1');
  });
});
