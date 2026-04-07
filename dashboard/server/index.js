import express from 'express'
import cors from 'cors'
import agentsRouter from './routes/agents.js'
import campaignsRouter from './routes/campaigns.js'
import tasksRouter from './routes/tasks.js'
import messagesRouter from './routes/messages.js'
import filesRouter from './routes/files.js'
import activityRouter from './routes/activity.js'
import executeRouter from './routes/execute.js'
import pipelineRouter from './routes/pipeline.js'

const app = express()
const PORT = process.env.PORT || 3005

app.use(cors())
app.use(express.json())

app.use('/api/agents', agentsRouter)
app.use('/api/campaigns', campaignsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/files', filesRouter)
app.use('/api/activity', activityRouter)
app.use('/api/execute', executeRouter)
app.use('/api/pipeline', pipelineRouter)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`PROCORP Dashboard API running on http://localhost:${PORT}`)
})
