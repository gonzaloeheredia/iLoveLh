import express from 'express'
import { apiRouter } from './routes/index.js'
import { errorHandler } from './middleware/error.middleware.js'

export function createApp() {
  const app = express()

  app.use(express.json({ limit: '50mb' }))
  app.use('/api', apiRouter)
  app.use(errorHandler)

  return app
}
