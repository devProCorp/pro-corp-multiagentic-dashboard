import { getTasks, getTask, updateTask, createMessage, updateAgentStatus } from './dbService.js'
import { executeTask, isTaskRunning } from './agentExecutor.js'

// Pipeline state
const pipelines = new Map()

export function getPipelines() {
  const result = {}
  for (const [id, pipeline] of pipelines) {
    result[id] = {
      ...pipeline,
      // Don't include the interval reference in JSON
      _checkInterval: undefined,
    }
  }
  return result
}

export function getPipeline(id) {
  const p = pipelines.get(id)
  if (!p) return null
  return { ...p, _checkInterval: undefined }
}

export function isPipelineRunning(campaignId) {
  const p = pipelines.get(campaignId)
  return p && p.status === 'running'
}

/**
 * Launch a full campaign pipeline.
 * This reads all tasks for the campaign, respects dependencies,
 * and automatically chains agent execution.
 */
export function launchPipeline(campaignId) {
  if (isPipelineRunning(campaignId)) {
    throw new Error(`Pipeline for ${campaignId} is already running`)
  }

  // Clear previous pipeline if it was stopped/completed
  if (pipelines.has(campaignId)) {
    const prev = pipelines.get(campaignId)
    if (prev._checkInterval) clearInterval(prev._checkInterval)
    pipelines.delete(campaignId)
  }

  const tasks = getTasks({ campaign: campaignId })
  if (tasks.length === 0) {
    throw new Error(`No tasks found for campaign ${campaignId}`)
  }

  const pipeline = {
    campaignId,
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalTasks: tasks.length,
    completedTasks: 0,
    currentPhase: 'starting',
    taskOrder: [],
    executionLog: [],
    errors: [],
  }

  // Build dependency graph and execution order
  pipeline.taskOrder = buildExecutionOrder(tasks)
  pipeline.currentPhase = 'executing'

  pipelines.set(campaignId, pipeline)

  // Log pipeline start
  addPipelineLog(pipeline, `Pipeline iniciado con ${tasks.length} tareas`)

  // Start the execution loop
  runPipelineLoop(campaignId)

  return pipeline
}

/**
 * Build execution order respecting dependencies.
 * Tasks with no dependencies go first, then tasks whose dependencies are met.
 */
function buildExecutionOrder(tasks) {
  const order = []
  const remaining = [...tasks]
  const completed = new Set()

  // Keep going until all tasks are ordered
  let maxIterations = tasks.length * 2
  while (remaining.length > 0 && maxIterations-- > 0) {
    const batch = []

    for (let i = remaining.length - 1; i >= 0; i--) {
      const task = remaining[i]
      const deps = task.dependencies || []
      const allDepsMet = deps.every(dep => completed.has(dep))

      if (allDepsMet) {
        batch.push(task.id)
        completed.add(task.id)
        remaining.splice(i, 1)
      }
    }

    if (batch.length > 0) {
      order.push(batch) // Each batch can run in parallel
    } else {
      // Circular dependency or unresolvable - add remaining as final batch
      order.push(remaining.map(t => t.id))
      break
    }
  }

  return order
}

/**
 * Main pipeline execution loop.
 * Checks every 10 seconds if new tasks can be started.
 */
function runPipelineLoop(campaignId) {
  const checkAndExecute = async () => {
    const pipeline = pipelines.get(campaignId)
    if (!pipeline || pipeline.status !== 'running') return

    const tasks = getTasks({ campaign: campaignId })

    // Count completed tasks
    const doneTasks = tasks.filter(t => ['DONE', 'APPROVED', 'REVIEW'].includes(t.status))
    pipeline.completedTasks = doneTasks.length

    // Check if all tasks are done
    const allDone = tasks.every(t => ['DONE', 'APPROVED', 'REVIEW'].includes(t.status))
    if (allDone) {
      pipeline.status = 'completed'
      pipeline.completedAt = new Date().toISOString()
      pipeline.currentPhase = 'completed'
      addPipelineLog(pipeline, `Pipeline completado! ${pipeline.completedTasks}/${pipeline.totalTasks} tareas terminadas`)
      clearInterval(pipeline._checkInterval)
      return
    }

    // Check for blocked tasks
    const blocked = tasks.filter(t => t.status === 'BLOCKED')
    if (blocked.length > 0) {
      pipeline.currentPhase = 'blocked'
      addPipelineLog(pipeline, `${blocked.length} tareas bloqueadas: ${blocked.map(t => t.id).join(', ')}`)
    }

    // Find tasks that can be executed now
    for (const batch of pipeline.taskOrder) {
      for (const taskId of batch) {
        const task = getTask(taskId)
        if (!task) continue

        // Skip if not pending or already running
        if (task.status !== 'PENDING') continue
        if (isTaskRunning(taskId)) continue

        // Check dependencies
        const deps = task.dependencies || []
        const allDepsDone = deps.every(depId => {
          const depTask = getTask(depId)
          return depTask && ['DONE', 'APPROVED', 'REVIEW'].includes(depTask.status)
        })

        if (!allDepsDone) continue

        // Check max parallel tasks per agent (max 3)
        const agentRunningTasks = tasks.filter(t =>
          t.assignedAgent === task.assignedAgent &&
          (t.status === 'IN_PROGRESS' || isTaskRunning(t.id))
        )
        if (agentRunningTasks.length >= 3) continue

        // Execute!
        addPipelineLog(pipeline, `Ejecutando ${taskId} → agente ${task.assignedAgent}`)
        pipeline.currentPhase = `executing: ${taskId}`

        // Send message from orquestador
        createMessage({
          id: `msg-pipe-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          from: 'orquestador-director',
          to: task.assignedAgent,
          taskId: taskId,
          priority: task.priority,
          context: `Pipeline automatico — Campana ${campaignId}`,
          request: task.description,
          inputs: [],
          deadline: task.deadline,
          outputFormat: task.outputFormat,
        })

        // Launch agent execution (fire and forget)
        executeTask(taskId)
          .then(() => {
            addPipelineLog(pipeline, `Tarea ${taskId} completada exitosamente`)
          })
          .catch(err => {
            pipeline.errors.push({ taskId, error: err.message, timestamp: new Date().toISOString() })
            addPipelineLog(pipeline, `ERROR en ${taskId}: ${err.message}`)
          })
      }
    }
  }

  // Run immediately, then check every 10 seconds
  checkAndExecute()
  const interval = setInterval(checkAndExecute, 10000)
  const pipeline = pipelines.get(campaignId)
  if (pipeline) pipeline._checkInterval = interval
}

function addPipelineLog(pipeline, message) {
  pipeline.executionLog.push({
    timestamp: new Date().toISOString(),
    message,
  })
  console.log(`[PIPELINE ${pipeline.campaignId}] ${message}`)
}

/**
 * Stop a running pipeline
 */
export function stopPipeline(campaignId) {
  const pipeline = pipelines.get(campaignId)
  if (!pipeline) throw new Error(`Pipeline ${campaignId} not found`)

  pipeline.status = 'stopped'
  pipeline.currentPhase = 'stopped by user'
  addPipelineLog(pipeline, 'Pipeline detenido manualmente')

  if (pipeline._checkInterval) {
    clearInterval(pipeline._checkInterval)
  }

  return pipeline
}
