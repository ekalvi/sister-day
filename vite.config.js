import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { basename } from 'node:path'

// Stable per-project dev port: hash the directory name into 5173–5272 so
// each q5m sibling (out-and-back, wealth-desk, sister-day, …) lands on its own slot.
// strictPort means we fail loudly instead of silently moving if it's taken.
const projectName = basename(process.cwd())
const port = 5173 + (createHash('sha256').update(projectName).digest().readUInt16BE(0) % 100)

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  let commitSha = 'dev'
  if (command === 'build') {
    try {
      commitSha = execSync('git rev-parse HEAD').toString().trim()
    } catch {
      commitSha = 'unknown'
    }
  }
  return {
    plugins: [react()],
    server: { port, strictPort: true },
    define: {
      'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(commitSha),
    },
  }
})
