import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: 'serve-dev-html',
      transformIndexHtml(html) {
        if (command === 'serve') {
          return html
            .replace(/<script type="module" crossorigin src=".*?"><\/script>/, '<script type="module" src="/src/main.tsx"></script>')
            .replace(/<link rel="stylesheet" crossorigin href=".*?">/, '');
        }
        return html;
      },
    },
  ],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
