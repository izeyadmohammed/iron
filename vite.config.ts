import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function stripStaticRootFallback(): Plugin {
  return {
    name: 'strip-static-root-fallback',
    transformIndexHtml(html) {
      return html.replace(
        /<!-- STATIC_FALLBACK_START -->[\s\S]*?<!-- STATIC_FALLBACK_END -->/g,
        ''
      );
    },
  };
}

const isStandaloneBuild = process.env.STANDALONE_BUILD === 'true';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), stripStaticRootFallback()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  build: isStandaloneBuild
    ? {
        outDir: 'standalone',
        emptyOutDir: true,
        copyPublicDir: false,
        rollupOptions: {
          input: 'src/main.tsx',
          output: {
            codeSplitting: false,
            entryFileNames: 'app.js',
            chunkFileNames: 'app-[name].js',
            assetFileNames: (assetInfo) =>
              assetInfo.name && assetInfo.name.endsWith('.css')
                ? 'app.css'
                : 'asset-[name][extname]',
          },
        },
      }
    : undefined,
});
