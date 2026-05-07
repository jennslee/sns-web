import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: isProd ? '/sns-web/' : '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/ws':  { target: 'ws://localhost:8000',  changeOrigin: true, ws: true },
    },
  },
})
