/**
 * Keyboard Shortcuts for Voice Agent
 * Provides keyboard shortcuts for accessibility
 */

import { onMount, onCleanup } from 'solid-js';

export function useKeyboardShortcuts(handlers: {
  onSpace?: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
}) {
  onMount(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.code) {
        case 'Space':
          if (handlers.onSpace) {
            e.preventDefault();
            handlers.onSpace();
          }
          break;
        case 'Escape':
          if (handlers.onEscape) {
            e.preventDefault();
            handlers.onEscape();
          }
          break;
        case 'Enter':
          if (handlers.onEnter) {
            e.preventDefault();
            handlers.onEnter();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyPress);
    });
  });
}
