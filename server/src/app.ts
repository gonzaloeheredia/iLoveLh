import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { errorHandler } from './middleware/error.middleware.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.clientOrigins,
      exposedHeaders: ['Content-Disposition', 'X-Output-Dir'],
    }),
  )
  app.use(express.json({ limit: '50mb' }))
  app.use('/api', apiRouter)
  app.use(errorHandler)

  return app
}
