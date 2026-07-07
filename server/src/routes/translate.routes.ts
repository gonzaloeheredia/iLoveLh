import { Router } from 'express'
import { translate, translateUploadMiddleware } from '../controllers/translate.controller.js'

export const translateRouter = Router()

translateRouter.post('/', translateUploadMiddleware, translate)
