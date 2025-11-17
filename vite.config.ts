import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    port: 1113,
    host: true,
    cors: {
      origin: [
        "https://flappypi.fun",
        "https://flappypi6856.pinet.com",
        "https://*.pinet.com",
        "https://*.minepi.com",
        "http://localhost:1111",
        "https://localhost:1111",
        "http://localhost:1112",
        "https://localhost:1112",
        "http://localhost:1113",
        "https://localhost:1113",
        "http://localhost:8080",
        "https://localhost:8080",
        "http://localhost:3000",
        "https://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3001",
        "http://192.168.1.12:1111",
        "https://192.168.1.12:1111",
        "http://192.168.1.12:1112",
        "https://192.168.1.12:1112",
        "http://192.168.1.12:1113",
        "https://192.168.1.12:1113",
        "http://192.168.1.20:1111",
        "https://192.168.1.20:1111",
        "http://192.168.1.20:1112",
        "https://192.168.1.20:1112",
        "http://192.168.1.20:8080",
        "https://192.168.1.20:8080",
        "http://192.168.1.20:3000",
        "https://192.168.1.20:3000",
        "http://192.168.1.20:3001",
        "https://192.168.1.20:3001"
      ],
      credentials: true,
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
        },
      },
    },
  },
})
