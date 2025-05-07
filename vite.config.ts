import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://34.64.152.144:8080',
        changeOrigin: true,
        // 필요한 경우 다음 옵션을 추가할 수 있습니다
        // rewrite: (path) => path.replace(/^\/api/, '')
      },      
      '/auth/login': {
        target: 'http://34.64.152.144:8080',
        changeOrigin: true,
      }
    }
  }
})
