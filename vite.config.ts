import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createProcessApi } from './server/processApi.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, 'data')
const processApi = createProcessApi(dataDir)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'process-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          processApi(req, res, next)
        })
      },
    },
  ],
})
