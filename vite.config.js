import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Absolute base for project Pages: https://<user>.github.io/performance-rag/
  base: '/performance-rag/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
