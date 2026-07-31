import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'strip-pages-redirect-from-build',
      transformIndexHtml(html) {
        return html.replace(
          /<script>\s*\/\/ GitHub Pages[\s\S]*?<\/script>\s*/m,
          '',
        )
      },
    },
  ],
  // Relative base so assets resolve under /docs/ or Actions site root
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
