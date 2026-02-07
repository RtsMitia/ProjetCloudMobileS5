/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // shim alias to avoid Vite dep optimizer issues with 'swipe-back'
      'swipe-back': path.resolve(__dirname, './src/shims/swipe-back.js')
    },
  },
  // prevent Vite from trying to pre-bundle a problematic module
  optimizeDeps: {
    exclude: ['swipe-back']
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
