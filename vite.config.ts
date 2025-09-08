import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: process.env.NODE_ENV === 'production' 
    ? (process.env.CUSTOM_DOMAIN === 'true' ? '/' : '/verly/erp/') 
    : '/',
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  }
})
