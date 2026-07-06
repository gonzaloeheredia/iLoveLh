import { Router } from 'express'
import { createProcess, listHistorial, removeProcess } from '../controllers/process.controller.js'

export const processRouter = Router()

processRouter.get('/historial', listHistorial)
processRouter.post('/processes', createProcess)
processRouter.delete('/processes/:id', removeProcess)
