import { Router } from 'express'
import { mergePdfs, mergeUploadMiddleware } from '../controllers/merge.controller.js'

export const mergeRouter = Router()

mergeRouter.post('/', mergeUploadMiddleware, mergePdfs)
