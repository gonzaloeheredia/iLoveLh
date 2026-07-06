import type { NextFunction, Request, Response } from 'express'
import { getHistorial, saveProcess } from '../services/process.service.js'
import { AppError } from '../middleware/error.middleware.js'

export function listHistorial(_req: Request, res: Response): void {
  res.json(getHistorial())
}

export function createProcess(req: Request, res: Response, next: NextFunction): void {
  try {
    const record = saveProcess(req.body)
    res.status(201).json(record)
  } catch {
    next(new AppError(500, 'Error al guardar el proceso.'))
  }
}
