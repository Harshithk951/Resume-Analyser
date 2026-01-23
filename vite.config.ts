import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = path.resolve(process.cwd(), 'env')

  // Allow overriding base path per-platform (useful for GitHub Pages: /<repo>/)
  // Defaults to './' to keep assets working from subpaths without extra config.
  // `loadEnv` reads `.env*` files; in some restricted environments that read may be blocked.
  // Fall back to `process.env` so builds can still proceed.
  let env: Record<string, string> = {}
  try {
    env = loadEnv(mode, envDir, '')
  } catch {
    // ignore env file read issues; rely on actual environment variables instead
    env = {}
  }

  const base = env.VITE_BASE ?? process.env.VITE_BASE ?? './'

  return {
    plugins: [react()],
    base,
    envDir,
  }
})