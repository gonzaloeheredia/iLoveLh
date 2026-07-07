import { Router } from 'express'
import { getUsageStats } from '../controllers/stats.controller.js'

export const statsRouter = Router()

statsRouter.get('/', getUsageStats)
