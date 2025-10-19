import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // Bundle analyzer (run with: npm run build -- --mode analyze)
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  base: process.env.NODE_ENV === 'production'
    ? (process.env.CUSTOM_DOMAIN === 'true' ? '/' : '/verly/erp/')
    : '/',
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  },

  // Build optimizations for production
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false
      }
    } as any,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['lucide-vue-next'],
          'utils': ['axios', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false
  },

  // Dev server config
  server: {
    port: 5173,
    host: true
  },

  // Preview server config
  preview: {
    port: 4173,
    host: true
  }
})
