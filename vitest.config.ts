/**
 * Unit Tests Configuration
 * Vitest setup for the Mehaal.Tech project
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'openai-agents-js/',
        '.next/',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, './components'),
      lib: path.resolve(__dirname, './lib'),
      styles: path.resolve(__dirname, './styles'),
    },
  },
});
