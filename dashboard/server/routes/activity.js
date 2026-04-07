import { Router } from 'express'
import { getActivityLog } from '../services/dbService.js'

const router = Router()

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 50
  const logs = getActivityLog(limit)
  res.json(logs)
})

export default router
