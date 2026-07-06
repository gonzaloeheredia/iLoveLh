import { Router } from 'express'
import { splitPdf, splitUploadMiddleware } from '../controllers/split.controller.js'

export const splitRouter = Router()

splitRouter.post('/', splitUploadMiddleware, splitPdf)
