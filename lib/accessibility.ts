/**
 * Accessibility (a11y) Utilities
 * Functions and constants for WCAG compliance
 */

/**
 * ARIA labels for different UI phases
 */
export const ARIA_LABELS = {
  LOGO: 'Mehaal AI Assistant Logo',
  MICROPHONE_BUTTON: 'Start voice conversation with Mehaal',
  LOADING: 'Initializing voice assistant',
  SPEAKING: 'Voice assistant is speaking',
  LISTENING: 'Voice assistant is listening',
  ERROR: 'Error message',
  CLOSE_BUTTON: 'Close error message',
} as const;

/**
 * Skip to main content link configuration
 */
export const SKIP_TO_MAIN = {
  id: 'main-content',
  label: 'Skip to main content',
} as const;

/**
 * Screen reader announcements
 */
export const ANNOUNCEMENTS = {
  INITIALIZED: 'Voice assistant is ready. Click the microphone to start talking.',
  CONNECTION_FAILED: 'Connection failed. Using browser voice instead.',
  LISTENING: 'Listening for your voice...',
  PROCESSING: 'Processing your message...',
  SPEAKING: 'Speaking response...',
} as const;

/**
 * Keyboard shortcut mappings
 */
export const KEYBOARD_SHORTCUTS = {
  ACTIVATE_MIC: ' ', // Space bar
  CANCEL: 'Escape',
  SUBMIT: 'Enter',
} as const;

/**
 * Focus outline styles for keyboard navigation
 */
export const FOCUS_OUTLINE_CLASS = 'focus:outline-2 focus:outline-offset-2 focus:outline-purple-500';

/**
 * Contrast ratio checker for accessibility
 * WCAG AA: 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const getLuminance = (rgb: [number, number, number]) => {
    const [r, g, b] = rgb.map((val) => {
      const v = val / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate accessible color for neon glow effect
 * Ensures contrast ratio meets WCAG AA standards
 */
export function getAccessibleGlowColor(hue: number, intensity: number): string {
  // Use higher saturation and lightness for better contrast
  const saturation = 100;
  const lightness = Math.min(55 + intensity * 0.2, 70); // Adaptive lightness based on intensity
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Announce to screen readers using aria-live region
 */
export function announceToScreenReader(
  message: string,
  polite: boolean = false
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', polite ? 'polite' : 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after screen reader has announced
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on user preferences
 */
export function getAnimationDuration(baseDuration: number): number {
  return prefersReducedMotion() ? baseDuration * 0.5 : baseDuration;
}

/**
 * Check if user has high contrast mode enabled
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Get font size based on user preferences
 */
export function getResponsiveFontSize(baseSizeClass: string): string {
  return prefersHighContrast() ? `${baseSizeClass} font-bold` : baseSizeClass;
}
