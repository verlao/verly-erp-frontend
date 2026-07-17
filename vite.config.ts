import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      // 'prompt': o SW novo AGUARDA e a gente mostra um aviso "Atualizar" (o
      // usuário decide quando recarregar — sem susto no meio de um orçamento).
      // A UI vive em PwaUpdatePrompt.vue via useRegisterSW; injectRegister:null
      // evita registro duplicado (só o composable registra).
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Verly ERP - Vidraçaria',
        short_name: 'Verly',
        description: 'Sistema de gestão Verly Vidraçaria',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'pt-BR',
        start_url: '/products',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Sempre servir o deploy mais novo: limpa caches de builds antigos e o SW
        // novo assume o controle imediatamente (sem esperar todas as abas fecharem).
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // false: o SW novo espera o clique em "Atualizar" (fluxo prompt) em vez
        // de assumir o controle sozinho.
        skipWaiting: false,
        runtimeCaching: [
          {
            // Navegação (o próprio HTML): network-first → um deploy novo aparece na
            // hora quando online; o cache serve só como fallback offline. Isso evita
            // o app shell velho ficar preso no cache (o bug do Cmd+Shift+R).
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'verly-html',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 1 },
            },
          },
          {
            // API: network-first com fallback de cache curto pra resiliência
            urlPattern: /^https:\/\/(staging-)?api\.verlyvidracaria\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'verly-api',
              expiration: { maxAgeSeconds: 300 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
    // Bundle analyzer (run with: npm run build -- --mode analyze)
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  base: '/',
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
