/**
 * Vitest Setup File
 * Configuration for test environment
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock speechSynthesis API
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
  },
});

// Mock AudioContext
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: class AudioContext {
    createAnalyser() {
      return {
        fftSize: 2048,
        smoothingTimeConstant: 0.85,
        getByteFrequencyData: vi.fn(),
      };
    }
    createMediaStreamSource() {
      return { connect: vi.fn() };
    }
    close() {
      return Promise.resolve();
    }
  },
});
