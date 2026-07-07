import type { Request, Response } from 'express'
import { getStats } from '../services/stats.service.js'

export function getUsageStats(_req: Request, res: Response): void {
  res.json(getStats())
}
