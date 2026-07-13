import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// フロントエンドのビルド設定。
// dev サーバーでは /api を backend(Hono) へプロキシして CORS を回避する
// （本番は nginx が同じ役割を担う）。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8123,
    proxy: {
      '/api': {
        // ネイティブ実行時は launch.json の backend (PORT=3002) へ。
        // Docker 内など別環境では VITE_PROXY_TARGET で上書きする。
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
