import { Router } from 'express'
import { summarize, summarizeUploadMiddleware } from '../controllers/summarize.controller.js'

export const summarizeRouter = Router()

summarizeRouter.post('/', summarizeUploadMiddleware, summarize)
