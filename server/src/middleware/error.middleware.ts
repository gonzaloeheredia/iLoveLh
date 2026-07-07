import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.code ? { code: err.code } : {}),
    })
    return
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'El archivo supera el tamaño máximo permitido.'
        : err.message

    res.status(400).json({ error: message })
    return
  }

  if (err instanceof Error) {
    res.status(500).json({ error: err.message })
    return
  }

  res.status(500).json({ error: 'Error interno del servidor.' })
}
