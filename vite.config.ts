import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Allow overriding base path per-platform (useful for GitHub Pages: /<repo>/)
  // Defaults to './' to keep assets working from subpaths without extra config.
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE ?? './'

  return {
    plugins: [react()],
    base,
  }
})