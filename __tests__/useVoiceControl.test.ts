/**
 * Voice Control Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVoiceControl } from 'components/useVoiceControl';

describe('useVoiceControl Hook', () => {
  let mockCallbacks: ReturnType<typeof createMockCallbacks>;

  beforeEach(() => {
    mockCallbacks = createMockCallbacks();
    vi.clearAllMocks();
  });

  function createMockCallbacks() {
    return {
      onSpeakingChange: vi.fn(),
      onTranscriptChange: vi.fn(),
      onIntensityChange: vi.fn(),
      onVoiceError: vi.fn(),
      onConnectionStateChange: vi.fn(),
      onReady: vi.fn(),
    };
  }

  it('should initialize voice control', async () => {
    const { result } = renderHook(() =>
      useVoiceControl({
        onSpeakingChange: mockCallbacks.onSpeakingChange,
        onTranscriptChange: mockCallbacks.onTranscriptChange,
        onIntensityChange: mockCallbacks.onIntensityChange,
        onVoiceError: mockCallbacks.onVoiceError,
        onConnectionStateChange: mockCallbacks.onConnectionStateChange,
        onReady: mockCallbacks.onReady,
      })
    );

    await waitFor(() => {
      expect(mockCallbacks.onReady).toHaveBeenCalledWith(true);
    });

    expect(result.current.voiceAgentRef).toBeDefined();
    expect(result.current.isCleaningUpRef).toBeDefined();
  });

  it('should have startAudioVisualizer method', async () => {
    const { result } = renderHook(() =>
      useVoiceControl({
        onSpeakingChange: mockCallbacks.onSpeakingChange,
        onTranscriptChange: mockCallbacks.onTranscriptChange,
        onIntensityChange: mockCallbacks.onIntensityChange,
        onVoiceError: mockCallbacks.onVoiceError,
        onConnectionStateChange: mockCallbacks.onConnectionStateChange,
        onReady: mockCallbacks.onReady,
      })
    );

    expect(typeof result.current.startAudioVisualizer).toBe('function');
  });

  it('should have speakWithBrowserVoice method', async () => {
    const { result } = renderHook(() =>
      useVoiceControl({
        onSpeakingChange: mockCallbacks.onSpeakingChange,
        onTranscriptChange: mockCallbacks.onTranscriptChange,
        onIntensityChange: mockCallbacks.onIntensityChange,
        onVoiceError: mockCallbacks.onVoiceError,
        onConnectionStateChange: mockCallbacks.onConnectionStateChange,
        onReady: mockCallbacks.onReady,
      })
    );

    expect(typeof result.current.speakWithBrowserVoice).toBe('function');
  });

  it('should have speakGreeting method', async () => {
    const { result } = renderHook(() =>
      useVoiceControl({
        onSpeakingChange: mockCallbacks.onSpeakingChange,
        onTranscriptChange: mockCallbacks.onTranscriptChange,
        onIntensityChange: mockCallbacks.onIntensityChange,
        onVoiceError: mockCallbacks.onVoiceError,
        onConnectionStateChange: mockCallbacks.onConnectionStateChange,
        onReady: mockCallbacks.onReady,
      })
    );

    expect(typeof result.current.speakGreeting).toBe('function');
  });

  it('should set fallback voice when no API key', async () => {
    // Temporarily clear API key
    const originalEnv = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    delete process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    const { result } = renderHook(() =>
      useVoiceControl({
        onSpeakingChange: mockCallbacks.onSpeakingChange,
        onTranscriptChange: mockCallbacks.onTranscriptChange,
        onIntensityChange: mockCallbacks.onIntensityChange,
        onVoiceError: mockCallbacks.onVoiceError,
        onConnectionStateChange: mockCallbacks.onConnectionStateChange,
        onReady: mockCallbacks.onReady,
      })
    );

    if (originalEnv) {
      process.env.NEXT_PUBLIC_OPENAI_API_KEY = originalEnv;
    }

    await act(async () => {
      await result.current.startAudioVisualizer();
    });

    expect(result.current.useFallbackVoice).toBe(true);
  });
});
