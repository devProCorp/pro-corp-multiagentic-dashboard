import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json')

const DEFAULT_DB = {
  tasks: [],
  messages: [],
  agentStatus: {},
  activityLog: [],
}

export function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { ...DEFAULT_DB }
  }
}

export function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export function getTasks(filters = {}) {
  const db = readDb()
  let tasks = db.tasks

  if (filters.status) tasks = tasks.filter(t => t.status === filters.status)
  if (filters.agent) tasks = tasks.filter(t => t.assignedAgent === filters.agent)
  if (filters.campaign) tasks = tasks.filter(t => t.campaignId === filters.campaign)

  return tasks
}

export function getTask(id) {
  const db = readDb()
  return db.tasks.find(t => t.id === id) || null
}

export function createTask(task) {
  const db = readDb()
  db.tasks.push(task)
  addLog(db, task.assignedAgent, 'task_created', task.id, { title: task.title })
  writeDb(db)
  return task
}

export function updateTask(id, updates) {
  const db = readDb()
  const idx = db.tasks.findIndex(t => t.id === id)
  if (idx === -1) return null

  const oldStatus = db.tasks[idx].status
  db.tasks[idx] = { ...db.tasks[idx], ...updates, updatedAt: new Date().toISOString() }

  if (updates.status && updates.status !== oldStatus) {
    addLog(db, db.tasks[idx].assignedAgent, 'status_change', id, { from: oldStatus, to: updates.status })
  }

  writeDb(db)
  return db.tasks[idx]
}

export function deleteTask(id) {
  const db = readDb()
  db.tasks = db.tasks.filter(t => t.id !== id)
  writeDb(db)
}

export function getMessages(filters = {}) {
  const db = readDb()
  let messages = db.messages

  if (filters.taskId) messages = messages.filter(m => m.taskId === filters.taskId)
  if (filters.from) messages = messages.filter(m => m.from === filters.from)
  if (filters.to) messages = messages.filter(m => m.to === filters.to)

  return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export function createMessage(msg) {
  const db = readDb()
  msg.timestamp = msg.timestamp || new Date().toISOString()
  db.messages.push(msg)
  addLog(db, msg.from, 'message_sent', msg.taskId, { to: msg.to, request: msg.request?.substring(0, 80) })
  writeDb(db)
  return msg
}

export function getAgentStatus() {
  return readDb().agentStatus
}

export function updateAgentStatus(slug, status) {
  const db = readDb()
  db.agentStatus[slug] = { ...db.agentStatus[slug], ...status, lastActivity: new Date().toISOString() }
  writeDb(db)
  return db.agentStatus[slug]
}

export function getActivityLog(limit = 50) {
  const db = readDb()
  return db.activityLog.slice(-limit).reverse()
}

function addLog(db, agent, action, taskId, details) {
  db.activityLog.push({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    agent,
    action,
    taskId,
    details,
  })
}
