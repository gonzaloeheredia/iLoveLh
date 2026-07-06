import { Router } from 'express'
import { healthRouter } from './health.routes.js'
import { uploadRouter } from './upload.routes.js'
import { processRouter } from './process.routes.js'
import { reportRouter } from './report.routes.js'
import { mergeRouter } from './merge.routes.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/upload', uploadRouter)
apiRouter.use('/merge', mergeRouter)
apiRouter.use(processRouter)
apiRouter.use(reportRouter)
