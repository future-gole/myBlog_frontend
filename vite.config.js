import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 关键配置
      '/api': {
        target: 'http://localhost:16160', // 你的未来后端地址
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:16160', // 同样指向 Spring Boot 后端地址
        changeOrigin: true,
      }
    }
  }
})
