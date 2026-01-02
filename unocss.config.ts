import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  presets: [presetUno()],
  rules: [
    // Custom animation rules will be added via safelist
  ],
  safelist: [
    'animate-spin',
    'animate-pulse',
  ],
  theme: {
    animation: {
      keyframes: {
        'logo-emerge': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'neon-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 16px rgba(0, 255, 255, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 32px rgba(0, 255, 255, 0.6))' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'scroll-bg': {
          '0%': { 'background-position': '0 0' },
          '100%': { 'background-position': '-100% 0' }
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'mic-pulse': {
          '0%, 100%': { transform: 'scale(1)', 'box-shadow': '0 0 20px rgba(0, 255, 255, 0.5)' },
          '50%': { transform: 'scale(1.1)', 'box-shadow': '0 0 40px rgba(0, 255, 255, 0.8)' }
        }
      }
    }
  }
});
