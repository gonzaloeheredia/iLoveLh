import { Router } from 'express'
import { createProcess, listHistorial } from '../controllers/process.controller.js'

export const processRouter = Router()

processRouter.get('/historial', listHistorial)
processRouter.post('/processes', createProcess)
