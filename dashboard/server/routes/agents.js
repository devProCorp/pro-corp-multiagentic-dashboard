import { Router } from 'express'
import { loadAllAgents, loadAgent } from '../services/agentLoader.js'
import { getAgentStatus, updateAgentStatus, getTasks } from '../services/dbService.js'

const router = Router()

router.get('/', (req, res) => {
  const agents = loadAllAgents()
  const statuses = getAgentStatus()
  const tasks = getTasks()

  const enriched = agents.map(agent => {
    const agentTasks = tasks.filter(t => t.assignedAgent === agent.slug)
    const status = statuses[agent.slug] || { status: 'idle', activeTasks: 0 }

    return {
      ...agent,
      ...status,
      taskSummary: {
        total: agentTasks.length,
        pending: agentTasks.filter(t => t.status === 'PENDING').length,
        inProgress: agentTasks.filter(t => t.status === 'IN_PROGRESS').length,
        review: agentTasks.filter(t => t.status === 'REVIEW').length,
        done: agentTasks.filter(t => t.status === 'DONE').length,
      },
    }
  })

  res.json(enriched)
})

router.get('/:slug', (req, res) => {
  const agent = loadAgent(req.params.slug)
  if (!agent) return res.status(404).json({ error: 'Agent not found' })

  const statuses = getAgentStatus()
  const tasks = getTasks({ agent: req.params.slug })

  res.json({
    ...agent,
    ...(statuses[req.params.slug] || { status: 'idle', activeTasks: 0 }),
    tasks,
  })
})

router.patch('/:slug/status', (req, res) => {
  const updated = updateAgentStatus(req.params.slug, req.body)
  res.json(updated)
})

export default router
