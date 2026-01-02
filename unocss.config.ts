import { defineConfig } from '@unocss/vite';
import { presetMini } from '@unocss/preset-mini';

export default defineConfig({
  presets: [presetMini()],
  theme: {
    animation: {
      keyframes: {
        'logo-emerge': `{
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }`,
        'neon-glow-expand': `{
          0% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.3); }
          50% { box-shadow: 0 0 100vw 100vh rgba(0, 255, 255, 0.4); }
          100% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.3); }
        }`,
        'neon-pulse': `{
          0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 16px rgba(0, 255, 255, 0.4)); }
          50% { filter: drop-shadow(0 0 16px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 32px rgba(0, 255, 255, 0.6)); }
        }`,
        'float-up': `{
          0% { transform: translateY(0); }
          100% { transform: translateY(-80px); }
        }`,
        'float-left': `{
          0% { transform: translateX(0); }
          100% { transform: translateX(-200px); }
        }`,
        'float-right': `{
          0% { transform: translateX(0); }
          100% { transform: translateX(200px); }
        }`,
        'slide-in-left': `{
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }`,
        'slide-out-left': `{
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }`,
        'slide-in-right': `{
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }`,
        'slide-out-right': `{
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }`,
        'fade-in': `{
          0% { opacity: 0; }
          100% { opacity: 1; }
        }`,
        'scroll-bg': `{
          0% { background-position: 0 0; }
          100% { background-position: -100% 0; }
        }`,
        'mic-pulse': `{
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 255, 255, 0.5); }
          50% { transform: scale(1.1); box-shadow: 0 0 40px rgba(0, 255, 255, 0.8); }
        }`,
      }
    }
  },
  shortcuts: {
    'neon-glow': 'drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] drop-shadow-[0_0_16px_rgba(0,255,255,0.4)]',
    'neon-glow-strong': 'drop-shadow-[0_0_16px_rgba(0,255,255,0.8)] drop-shadow-[0_0_32px_rgba(0,255,255,0.6)]',
  }
});
