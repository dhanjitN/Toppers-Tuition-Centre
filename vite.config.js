import { copyFileSync, mkdirSync, readFile } from 'node:fs'
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
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const file = request.url?.split('?')[0]
        if (file !== '/server/students.json' && file !== '/server/schedule.json') {
          next()
          return
        }

        if (request.method !== 'GET' && request.method !== 'HEAD') {
          response.statusCode = 405
          response.end()
          return
        }

        readFile(resolve(projectRoot, file.slice('/server/'.length)), (error, contents) => {
          if (error) {
            next(error)
            return
          }

          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'no-cache')
          response.end(request.method === 'HEAD' ? undefined : contents)
        })
      })
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
