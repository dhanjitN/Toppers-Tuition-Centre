import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function copyServerData() {
  let projectRoot
  let outputDirectory

  return {
    name: 'copy-server-data',
    apply: 'build',
    configResolved(config) {
      projectRoot = config.root
      outputDirectory = resolve(config.root, config.build.outDir, 'server')
    },
    closeBundle() {
      mkdirSync(outputDirectory, { recursive: true })
      for (const file of ['students.json', 'schedule.json']) {
        copyFileSync(resolve(projectRoot, 'server', file), resolve(outputDirectory, file))
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), copyServerData()],
})
