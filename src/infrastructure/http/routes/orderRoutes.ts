import { Router } from 'express'
import { OrderController } from '../controllers/OrderController.js'

export function createOrderRouter(controller: OrderController): Router {
  const router = Router()

  router.post('/', (req, res) => controller.create(req, res))
  router.get('/:id', (req, res) => controller.getById(req, res))
  router.post('/:id/confirm', (req, res) => controller.confirm(req, res))
  router.post('/:id/cancel', (req, res) => controller.cancel(req, res))

  return router
}