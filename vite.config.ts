import path from 'node:path';
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    optimizeLodashImports(),
    tailwindcss(),
    wasm(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`
    }),

    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    }),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true
      },
      include: ['**/*.svg']
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'vite-plugin-node-polyfills/polyfills/buffer',
      process: 'vite-plugin-node-polyfills/polyfills/process',
      util: 'vite-plugin-node-polyfills/polyfills/util'
    }
  },
  optimizeDeps: {
    exclude: ['@syntect/wasm'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: ['vite-plugin-node-polyfills/shims/buffer', 'vite-plugin-node-polyfills/shims/process']
    }
  }
});
