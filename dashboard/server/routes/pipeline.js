import { Router } from 'express'
import { launchPipeline, getPipelines, getPipeline, stopPipeline, isPipelineRunning } from '../services/pipelineEngine.js'

const router = Router()

// Get all pipelines
router.get('/', (req, res) => {
  res.json(getPipelines())
})

// Get a specific pipeline
router.get('/:campaignId', (req, res) => {
  const pipeline = getPipeline(req.params.campaignId)
  if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' })
  res.json(pipeline)
})

// Launch a campaign pipeline
router.post('/launch/:campaignId', (req, res) => {
  try {
    const pipeline = launchPipeline(req.params.campaignId)
    res.json({
      status: 'launched',
      campaignId: req.params.campaignId,
      totalTasks: pipeline.totalTasks,
      taskOrder: pipeline.taskOrder,
      message: `Pipeline iniciado con ${pipeline.totalTasks} tareas en ${pipeline.taskOrder.length} fases`,
    })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Stop a pipeline
router.post('/stop/:campaignId', (req, res) => {
  try {
    const pipeline = stopPipeline(req.params.campaignId)
    res.json({ status: 'stopped', campaignId: req.params.campaignId })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
