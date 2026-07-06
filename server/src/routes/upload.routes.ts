import { Router } from 'express'
import { uploadFile } from '../controllers/upload.controller.js'
import { upload } from '../middleware/upload.middleware.js'

export const uploadRouter = Router()

uploadRouter.post('/', upload.single('file'), uploadFile)
