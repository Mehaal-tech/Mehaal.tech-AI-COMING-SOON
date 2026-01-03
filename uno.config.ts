import { defineConfig, presetUno, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      // Base tokens
      'base-black': '#000000',
      'base-white': '#ffffff',
      'base-gray': {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
        950: '#09090b',
      },
      // Brand tokens - can be overridden by theme
      'brand-primary': 'var(--color-brand-primary, #0066ff)',
      'brand-secondary': 'var(--color-brand-secondary, #00ccff)',
      'brand-accent': 'var(--color-brand-accent, #ff00ff)',
      'brand-bg': 'var(--color-brand-bg, #000000)',
      'brand-text': 'var(--color-brand-text, #ffffff)',
      // AI glow
      'ai-glow': 'var(--color-ai-glow, #0066ff)',
    },
    animation: {
      keyframes: {
        'breathe-glow': `{
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }`,
        'slide-in-right': `{
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }`,
        'emerge': `{
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }`,
      },
      durations: {
        'breathe-glow': '4s',
        'slide-in-right': '0.8s',
        'emerge': '1.2s',
      },
      timingFns: {
        'breathe-glow': 'ease-in-out',
        'slide-in-right': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'emerge': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  shortcuts: {
    'glow-effect': 'drop-shadow-[0_0_20px_var(--color-ai-glow)]',
    'container-center': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  },
  rules: [
    // Custom glow intensity
    [/^glow-intensity-(\d+)$/, ([, d]) => ({ 
      '--glow-intensity': `${d}%`,
      filter: `drop-shadow(0 0 20px rgba(var(--color-ai-glow-rgb), calc(var(--glow-intensity) / 100)))`,
    })],
  ],
});
