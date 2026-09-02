import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages (branch: main) serves this source index.html, so the file on
// disk points at ./assets/app.js. Vite swaps that to /src/main.tsx for dev/build.
export default defineConfig({
  plugins: [
    {
      name: 'pages-source-entry',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          return html
            .replace(
              '<link rel="stylesheet" href="./assets/app-v16.css" />',
              ''
            )
            .replace(
              '<script type="module" src="./assets/app-v16.js"></script>',
              '<script type="module" src="/src/main.tsx"></script>'
            );
        },
      },
    },
    react(),
  ],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app-v16.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'assets/app-v16.css';
          return 'assets/[name][extname]';
        },
      },
    },
  },
});
