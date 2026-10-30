import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages serves this repository project site from /QuizRush/.
  // Vercel and local development continue to use the root path.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/QuizRush/' : '/',
  plugins: [react(), tailwindcss()],
})
