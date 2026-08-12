import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function htmlEntryPointPlugin(): Plugin {
  return {
    name: 'html-entry-point-plugin',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!html.includes('/src/main.tsx')) {
          return html
            .replace(/<script type="module" crossorigin src=".*?"><\/script>/, '<script type="module" src="/src/main.tsx"></script>')
            .replace(/<link rel="stylesheet" crossorigin href=".*?">/, '');
        }
        return html;
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [htmlEntryPointPlugin(), react()],
  base: process.env.VITE_BASE_PATH || '/calender.github.io/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
