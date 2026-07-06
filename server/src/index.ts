import { createApp } from './app.js'
import { env } from './config/env.js'
import { verifyLibreOfficeOnStartup } from './services/libreoffice.service.js'

async function main() {
  await verifyLibreOfficeOnStartup()

  const app = createApp()

  app.listen(env.port, () => {
    console.log(`API escuchando en http://localhost:${env.port}`)
    console.log(`Archivos de subida: ${env.uploadDir}`)
  })
}

main().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error)
  process.exit(1)
})
