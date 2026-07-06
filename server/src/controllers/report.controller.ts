import type { NextFunction, Request, Response } from 'express'
import { saveReport } from '../services/process.service.js'
import { AppError } from '../middleware/error.middleware.js'

export function createReport(req: Request, res: Response, next: NextFunction): void {
  try {
    const record = saveReport(req.body)
    res.status(201).json(record)
  } catch {
    next(new AppError(500, 'Error al guardar el reporte.'))
  }
}
