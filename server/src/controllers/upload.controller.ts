import type { Request, Response } from 'express'

export function uploadFile(req: Request, res: Response): void {
  if (!req.file) {
    res.status(400).json({ error: 'No se recibió ningún archivo.' })
    return
  }

  res.status(201).json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path,
  })
}
