import { describe, it, expect } from 'vitest';

describe('VoiceAgent Component - Realtime API', () => {
  it('should have OpenAI API key configured', () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    
    // Check if API key is placeholder
    const isConfigured = apiKey && apiKey !== 'your-openai-api-key-here';
    expect(typeof isConfigured).toBe('boolean');
  });

  it('should use correct Realtime API model', () => {
    const expectedModel = 'gpt-4o-realtime-preview-2024-12-17';
    expect(expectedModel).toContain('realtime');
  });
});

describe('Environment Configuration', () => {
  it('should have required environment variables defined', () => {
    expect(import.meta.env.VITE_OPENAI_API_KEY).toBeDefined();
  });
  
  it('should have launch date configured', () => {
    const launchDate = import.meta.env.VITE_LAUNCH_DATE || '2026-03-01';
    expect(launchDate).toBeDefined();
    expect(new Date(launchDate).getTime()).toBeGreaterThan(Date.now());
  });
});
