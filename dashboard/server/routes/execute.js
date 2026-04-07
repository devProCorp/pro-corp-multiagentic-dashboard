import { Router } from 'express'
import { executeTask, isTaskRunning, getRunningTasks } from '../services/agentExecutor.js'
import { getTask } from '../services/dbService.js'

const router = Router()

// Get all currently running tasks
router.get('/running', (req, res) => {
  res.json(getRunningTasks())
})

// Execute a task (trigger agent)
router.post('/:taskId', async (req, res) => {
  const { taskId } = req.params

  const task = getTask(taskId)
  if (!task) return res.status(404).json({ error: 'Task not found' })

  if (isTaskRunning(taskId)) {
    return res.status(409).json({ error: 'Task is already running', taskId })
  }

  // Start execution in background - respond immediately
  res.json({
    status: 'started',
    taskId,
    agent: task.assignedAgent,
    message: `Agente ${task.assignedAgent} iniciado para tarea ${taskId}`,
  })

  // Execute async (don't await - it runs in background)
  executeTask(taskId)
    .then(result => {
      console.log(`Task ${taskId} completed:`, result.status)
    })
    .catch(err => {
      console.error(`Task ${taskId} failed:`, err.message)
    })
})

// Stop a running task
router.delete('/:taskId', (req, res) => {
  const { taskId } = req.params

  if (!isTaskRunning(taskId)) {
    return res.status(404).json({ error: 'Task is not running' })
  }

  // The process map is in agentExecutor - we'd need to expose a stop function
  // For now, just report status
  res.json({ status: 'stop requested', taskId })
})

export default router
