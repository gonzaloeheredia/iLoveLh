import { Router } from 'express'
import { createReport } from '../controllers/report.controller.js'

export const reportRouter = Router()

reportRouter.post('/reports', createReport)
