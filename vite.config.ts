import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Using relative base path for maximum compatibility with GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
