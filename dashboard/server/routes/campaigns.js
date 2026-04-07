import { Router } from 'express'
import { loadAllCampaigns, loadCampaign } from '../services/campaignLoader.js'
import { getTasks } from '../services/dbService.js'

const router = Router()

router.get('/', (req, res) => {
  const campaigns = loadAllCampaigns()
  const tasks = getTasks()

  const enriched = campaigns.map(c => {
    const campaignTasks = tasks.filter(t => t.campaignId === c.id)
    return {
      ...c,
      taskSummary: {
        total: campaignTasks.length,
        done: campaignTasks.filter(t => t.status === 'DONE').length,
        review: campaignTasks.filter(t => t.status === 'REVIEW').length,
        inProgress: campaignTasks.filter(t => t.status === 'IN_PROGRESS').length,
        pending: campaignTasks.filter(t => t.status === 'PENDING').length,
        blocked: campaignTasks.filter(t => t.status === 'BLOCKED').length,
      },
      progress: campaignTasks.length > 0
        ? Math.round((campaignTasks.filter(t => ['DONE', 'APPROVED'].includes(t.status)).length / campaignTasks.length) * 100)
        : 0,
    }
  })

  res.json(enriched)
})

router.get('/:id', (req, res) => {
  // ID format: PROCORP-2026-001, client is first segment
  const parts = req.params.id.split('-')
  const client = parts[0]
  const campaign = loadCampaign(client, req.params.id)
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' })

  const tasks = getTasks({ campaign: req.params.id })

  res.json({ ...campaign, tasks })
})

export default router
