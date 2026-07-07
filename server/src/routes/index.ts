import { Router } from 'express'
import { healthRouter } from './health.routes.js'
import { uploadRouter } from './upload.routes.js'
import { processRouter } from './process.routes.js'
import { reportRouter } from './report.routes.js'
import { mergeRouter } from './merge.routes.js'
import { splitRouter } from './split.routes.js'
import { conversionRouter } from './conversion.routes.js'
import { summarizeRouter } from './summarize.routes.js'
import { translateRouter } from './translate.routes.js'
import { statsRouter } from './stats.routes.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/upload', uploadRouter)
apiRouter.use('/merge', mergeRouter)
apiRouter.use('/split', splitRouter)
apiRouter.use('/summarize', summarizeRouter)
apiRouter.use('/translate', translateRouter)
apiRouter.use(conversionRouter)
apiRouter.use(processRouter)
apiRouter.use(reportRouter)
apiRouter.use('/stats', statsRouter)
