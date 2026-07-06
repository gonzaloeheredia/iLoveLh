import type { NextFunction, Request, Response } from 'express'
import { deleteProcess, getHistorial, saveProcess } from '../services/process.service.js'
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

export function removeProcess(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = req.params.id
    if (!id || Array.isArray(id)) {
      next(new AppError(400, 'ID de proceso inválido.'))
      return
    }
    deleteProcess(id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
