import { createSignal, createEffect, JSX } from 'solid-js';

type Theme = 'default' | 'tenant-1' | 'tenant-2' | 'custom';

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
    aiGlow: string;
    aiGlowRgb: string;
  };
  glowIntensity: number;
}

const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  default: {
    colors: {
      primary: '#0066ff',
      secondary: '#00ccff',
      accent: '#ff00ff',
      bg: '#000000',
      text: '#ffffff',
      aiGlow: '#0066ff',
      aiGlowRgb: '0, 102, 255',
    },
    glowIntensity: 60,
  },
  'tenant-1': {
    colors: {
      primary: '#ff6b00',
      secondary: '#ff9d00',
      accent: '#ffcc00',
      bg: '#000000',
      text: '#ffffff',
      aiGlow: '#ff6b00',
      aiGlowRgb: '255, 107, 0',
    },
    glowIntensity: 70,
  },
  'tenant-2': {
    colors: {
      primary: '#00ff88',
      secondary: '#00ffcc',
      accent: '#00ddff',
      bg: '#000000',
      text: '#ffffff',
      aiGlow: '#00ff88',
      aiGlowRgb: '0, 255, 136',
    },
    glowIntensity: 80,
  },
  custom: {
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#c084fc',
      bg: '#000000',
      text: '#ffffff',
      aiGlow: '#8b5cf6',
      aiGlowRgb: '139, 92, 246',
    },
    glowIntensity: 65,
  },
};

// Global theme state
const [currentTheme, setCurrentTheme] = createSignal<Theme>('default');

/**
 * Apply theme to document root
 */
function applyTheme(theme: Theme) {
  const config = THEME_CONFIGS[theme];
  const root = document.documentElement;

  // Apply CSS variables
  root.style.setProperty('--color-brand-primary', config.colors.primary);
  root.style.setProperty('--color-brand-secondary', config.colors.secondary);
  root.style.setProperty('--color-brand-accent', config.colors.accent);
  root.style.setProperty('--color-brand-bg', config.colors.bg);
  root.style.setProperty('--color-brand-text', config.colors.text);
  root.style.setProperty('--color-ai-glow', config.colors.aiGlow);
  root.style.setProperty('--color-ai-glow-rgb', config.colors.aiGlowRgb);
  root.style.setProperty('--glow-intensity', String(config.glowIntensity));

  // Set data attribute for CSS targeting
  root.setAttribute('data-theme', theme);
}

/**
 * Initialize theme system
 */
export function initThemeEngine() {
  // Load theme from localStorage or use default
  const savedTheme = (localStorage.getItem('theme') as Theme) || 'default';
  setCurrentTheme(savedTheme);
  applyTheme(savedTheme);
}

/**
 * Switch to a different theme
 */
export function switchTheme(theme: Theme) {
  setCurrentTheme(theme);
  applyTheme(theme);
  localStorage.setItem('theme', theme);
  
  console.log('[Theme Engine] Switched to theme:', theme);
}

/**
 * Get current theme
 */
export function getTheme(): Theme {
  return currentTheme();
}

/**
 * Load custom theme configuration
 * 
 * TODO: Replace with API call to fetch tenant-specific theme
 */
export function loadCustomTheme(tenantId: string): ThemeConfig {
  console.log('[Theme Engine] Loading custom theme for tenant:', tenantId);
  
  // Mock custom theme loading
  return THEME_CONFIGS.custom;
}

/**
 * Theme Provider Component
 */
export function ThemeProvider(props: { children: JSX.Element }) {
  createEffect(() => {
    initThemeEngine();
  });

  return <>{props.children}</>;
}

export { currentTheme };
