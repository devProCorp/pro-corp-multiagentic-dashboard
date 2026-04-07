import { Router } from 'express'
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../services/dbService.js'
import { nanoid } from 'nanoid'

const router = Router()

router.get('/', (req, res) => {
  const tasks = getTasks(req.query)
  res.json(tasks)
})

router.get('/:id', (req, res) => {
  const task = getTask(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
})

router.post('/', (req, res) => {
  const task = {
    id: req.body.id || `TASK-${nanoid(8)}`,
    campaignId: req.body.campaignId || '',
    clientSlug: req.body.clientSlug || '',
    title: req.body.title,
    description: req.body.description || '',
    assignedAgent: req.body.assignedAgent,
    status: 'PENDING',
    priority: req.body.priority || 'MEDIUM',
    dependencies: req.body.dependencies || [],
    deadline: req.body.deadline || null,
    outputFormat: req.body.outputFormat || 'Markdown',
    outputPath: req.body.outputPath || '',
    version: 'v1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const created = createTask(task)
  res.status(201).json(created)
})

router.patch('/:id', (req, res) => {
  const updated = updateTask(req.params.id, req.body)
  if (!updated) return res.status(404).json({ error: 'Task not found' })
  res.json(updated)
})

router.delete('/:id', (req, res) => {
  deleteTask(req.params.id)
  res.status(204).end()
})

export default router
