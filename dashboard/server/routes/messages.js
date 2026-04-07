import { Router } from 'express'
import { getMessages, createMessage } from '../services/dbService.js'
import { nanoid } from 'nanoid'

const router = Router()

router.get('/', (req, res) => {
  const messages = getMessages(req.query)
  res.json(messages)
})

router.post('/', (req, res) => {
  const msg = {
    id: `msg-${nanoid(8)}`,
    from: req.body.from,
    to: req.body.to,
    taskId: req.body.taskId || '',
    priority: req.body.priority || 'MEDIUM',
    context: req.body.context || '',
    request: req.body.request,
    inputs: req.body.inputs || [],
    deadline: req.body.deadline || null,
    outputFormat: req.body.outputFormat || '',
  }

  const created = createMessage(msg)
  res.status(201).json(created)
})

export default router
