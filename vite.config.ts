import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      host: true, 
      port: 5173, 
      allowedHosts: ['ongi.today', 'dev.ongi.today','www.ongi.today'], 
    },
    esbuild: {
      drop: isDev ? [] : ['console', 'debugger'],
    },
    build: {
      minify: isProd ? 'esbuild' : false,
    },
    // 개발 환경에서만 소스맵 생성
    ...(isDev && {
      css: { devSourcemap: true }
    }),
  };
});