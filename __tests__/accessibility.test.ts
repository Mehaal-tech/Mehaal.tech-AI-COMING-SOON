/**
 * Accessibility Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  getAccessibleGlowColor,
  prefersReducedMotion,
  prefersHighContrast,
  getAnimationDuration,
  getResponsiveFontSize,
} from 'lib/accessibility';

describe('Accessibility Utils', () => {
  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between two colors', () => {
      const white = [255, 255, 255] as [number, number, number];
      const black = [0, 0, 0] as [number, number, number];
      const ratio = getContrastRatio(black, white);
      
      expect(ratio).toBeGreaterThan(20); // White on black is 21:1
    });

    it('should meet WCAG AA standard for normal text', () => {
      const darkText = [33, 33, 33] as [number, number, number];
      const lightBg = [255, 255, 255] as [number, number, number];
      const ratio = getContrastRatio(darkText, lightBg);
      
      expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA for normal text
    });
  });

  describe('getAccessibleGlowColor', () => {
    it('should return valid HSL color string', () => {
      const color = getAccessibleGlowColor(277, 100);
      
      expect(color).toMatch(/hsl\(\d+,\s*\d+%,\s*\d+%\)/);
    });

    it('should increase lightness with intensity', () => {
      const color1 = getAccessibleGlowColor(277, 0);
      const color2 = getAccessibleGlowColor(277, 100);
      
      const lightness1 = parseInt(color1.match(/\d+%\)/)![0]);
      const lightness2 = parseInt(color2.match(/\d+%\)/)![0]);
      
      expect(lightness2).toBeGreaterThanOrEqual(lightness1);
    });
  });

  describe('prefersReducedMotion', () => {
    it('should return a boolean', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('prefersHighContrast', () => {
    it('should return a boolean', () => {
      const result = prefersHighContrast();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getAnimationDuration', () => {
    it('should return same duration if no reduced motion', () => {
      const baseDuration = 1000;
      const result = getAnimationDuration(baseDuration);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(baseDuration);
    });
  });

  describe('getResponsiveFontSize', () => {
    it('should return string with base size class', () => {
      const result = getResponsiveFontSize('text-lg');
      
      expect(result).toContain('text-lg');
    });

    it('should include font-bold for high contrast', () => {
      const result = getResponsiveFontSize('text-lg');
      
      expect(result).toBe('text-lg font-bold');
    });
  });
});
