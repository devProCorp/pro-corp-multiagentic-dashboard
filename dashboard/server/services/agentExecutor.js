import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getTask, getTasks, updateTask, createMessage, updateAgentStatus } from './dbService.js'
import { parseMarkdownFile } from './fileParser.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..')
const LOGS_DIR = path.join(__dirname, '..', 'data', 'logs')
const AGENTS_DIR = path.join(PROJECT_ROOT, '.claude', 'agents')

// Map agent slugs to their .claude/agents/ file names
const AGENT_MAP = {
  'orquestador-director': 'orquestador-director',
  'investigador-mercado': 'investigador-mercado',
  'estratega-campanas': 'estratega-campanas',
  'creador-contenido': 'creador-contenido',
  'desarrollador-martech': 'desarrollador-martech',
  'disenador-visual': 'disenador-visual',
  'gestor-proyectos': 'gestor-proyectos',
  'analista-datos': 'analista-datos',
  'creador-video': 'creador-video',
}

// Track running processes
const runningProcesses = new Map()

export function getRunningTasks() {
  const running = {}
  for (const [taskId, proc] of runningProcesses) {
    running[taskId] = { pid: proc.pid, startedAt: proc.startedAt }
  }
  return running
}

export function isTaskRunning(taskId) {
  return runningProcesses.has(taskId)
}

export async function executeTask(taskId) {
  const task = getTask(taskId)
  if (!task) throw new Error(`Task ${taskId} not found`)
  if (isTaskRunning(taskId)) throw new Error(`Task ${taskId} is already running`)

  const agentSlug = task.assignedAgent
  if (!AGENT_MAP[agentSlug]) throw new Error(`No agent mapping for ${agentSlug}`)

  // Ensure logs directory exists
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true })

  // Build context from campaign documents
  const context = buildTaskContext(task)

  // Build the prompt for the agent
  const prompt = buildPrompt(task, context)

  // Update task status to IN_PROGRESS
  updateTask(taskId, { status: 'IN_PROGRESS' })
  updateAgentStatus(agentSlug, { status: 'busy', activeTasks: 1 })

  // Create a message from orquestador to the agent
  createMessage({
    id: `msg-exec-${Date.now()}`,
    from: 'orquestador-director',
    to: agentSlug,
    taskId: taskId,
    priority: task.priority,
    context: `Ejecucion automatica desde dashboard — Campana ${task.campaignId}`,
    request: task.description,
    inputs: [],
    deadline: task.deadline,
    outputFormat: task.outputFormat,
  })

  // Log file for this execution
  const logFile = path.join(LOGS_DIR, `${taskId}-${Date.now()}.log`)

  return new Promise((resolve, reject) => {
    const args = [
      '-p', prompt,
      '--output-format', 'text',
      '--max-turns', agentSlug === 'creador-video' ? '200' : '30',
      '--dangerously-skip-permissions',
    ]

    const proc = spawn('claude', args, {
      cwd: PROJECT_ROOT,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let output = ''
    let errorOutput = ''

    proc.startedAt = new Date().toISOString()
    runningProcesses.set(taskId, proc)

    proc.stdout.on('data', (data) => {
      const text = data.toString()
      output += text
      fs.appendFileSync(logFile, text)
    })

    proc.stderr.on('data', (data) => {
      const text = data.toString()
      errorOutput += text
      fs.appendFileSync(logFile, `[STDERR] ${text}`)
    })

    proc.on('close', (code) => {
      runningProcesses.delete(taskId)

      if (code === 0) {
        // Save output
        const outputPath = task.outputPath
        if (outputPath) {
          const fullOutputDir = path.join(PROJECT_ROOT, outputPath.replace(/^\//, ''))
          if (!fs.existsSync(fullOutputDir)) fs.mkdirSync(fullOutputDir, { recursive: true })

          // If outputPath is a directory, save with task id as filename
          const isDir = outputPath.endsWith('/')
          const outputFile = isDir
            ? path.join(fullOutputDir, `${taskId}-output.md`)
            : fullOutputDir

          // Ensure parent dir exists
          const parentDir = path.dirname(isDir ? path.join(fullOutputDir, `${taskId}-output.md`) : fullOutputDir)
          if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true })

          fs.writeFileSync(outputFile, output, 'utf-8')
        }

        updateTask(taskId, { status: 'REVIEW' })
        updateAgentStatus(agentSlug, { status: 'idle', activeTasks: 0 })

        // Auto-trigger dependent tasks
        const allTasks = getTasks()
        const dependents = allTasks.filter(t =>
          t.dependencies &&
          t.dependencies.includes(taskId) &&
          t.status === 'PENDING'
        )
        for (const dep of dependents) {
          // Check if ALL dependencies are satisfied (REVIEW or APPROVED or DONE)
          const allDepsSatisfied = dep.dependencies.every(depId => {
            const depTask = allTasks.find(t => t.id === depId)
            return depTask && ['REVIEW', 'APPROVED', 'DONE'].includes(depTask.status)
          })
          if (allDepsSatisfied) {
            console.log(`[EXECUTOR] Auto-triggering dependent task ${dep.id}`)
            setTimeout(() => executeTask(dep.id).catch(err =>
              console.error(`[EXECUTOR] Failed to auto-trigger ${dep.id}:`, err.message)
            ), 2000)
          }
        }

        resolve({ taskId, status: 'completed', output: output.substring(0, 500), logFile })
      } else {
        updateTask(taskId, { status: 'BLOCKED' })
        updateAgentStatus(agentSlug, { status: 'idle', activeTasks: 0 })

        reject(new Error(`Agent process exited with code ${code}: ${errorOutput.substring(0, 300)}`))
      }
    })

    proc.on('error', (err) => {
      console.error(`[EXECUTOR] Process error for ${taskId}:`, err.message)
      fs.appendFileSync(logFile, `[ERROR] ${err.message}\n`)
      runningProcesses.delete(taskId)
      updateTask(taskId, { status: 'BLOCKED' })
      updateAgentStatus(agentSlug, { status: 'idle', activeTasks: 0 })
      reject(err)
    })

    console.log(`[EXECUTOR] Spawned claude for ${taskId} (PID: ${proc.pid})`)
  })
}

function buildTaskContext(task) {
  const context = { briefing: '', strategy: '', research: '' }

  // Try to load briefing creativo
  const briefingPath = path.join(PROJECT_ROOT, 'campaigns', task.clientSlug, task.campaignId, `${task.campaignId}-briefings-creativos.md`)
  if (fs.existsSync(briefingPath)) {
    const { content } = parseMarkdownFile(briefingPath)
    context.briefing = content
  }

  // Try to load strategy
  const strategyPath = path.join(PROJECT_ROOT, 'campaigns', task.clientSlug, task.campaignId, `${task.campaignId}-estrategia-campana.md`)
  if (fs.existsSync(strategyPath)) {
    const { content } = parseMarkdownFile(strategyPath)
    context.strategy = content.substring(0, 3000) // Limit to avoid token overflow
  }

  // Try to load research
  const researchPath = path.join(PROJECT_ROOT, 'data', 'research', task.clientSlug, `${task.campaignId}-investigacion-competitiva.md`)
  if (fs.existsSync(researchPath)) {
    const { content } = parseMarkdownFile(researchPath)
    context.research = content.substring(0, 2000)
  }

  return context
}

function loadAgentSystemPrompt(agentSlug) {
  const agentFile = path.join(AGENTS_DIR, `${AGENT_MAP[agentSlug]}.md`)
  if (fs.existsSync(agentFile)) {
    const raw = fs.readFileSync(agentFile, 'utf-8')
    // Strip frontmatter (between --- markers) to get just the prompt body
    const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/)
    return fmMatch ? fmMatch[1].trim() : raw
  }
  return null
}

function buildPrompt(task, context) {
  // Load the agent's specialized system prompt from .claude/agents/
  const agentPrompt = loadAgentSystemPrompt(task.assignedAgent)

  let prompt = ''

  if (agentPrompt) {
    prompt += `${agentPrompt}\n\n---\n\n`
  } else {
    prompt += `Eres un agente especializado de PROCORPMDigital.\n\n`
  }

  prompt += `## Tarea Asignada
- **ID**: ${task.id}
- **Titulo**: ${task.title}
- **Descripcion**: ${task.description}
- **Cliente**: ${task.clientSlug}
- **Campana**: ${task.campaignId}
- **Prioridad**: ${task.priority}
- **Formato de salida**: ${task.outputFormat}
- **Deadline**: ${task.deadline}

## Instrucciones de Ejecucion
1. Ejecuta la tarea descrita de forma completa y profesional
2. Todo el contenido debe estar en espanol
3. Incluye frontmatter YAML con metadatos (agente, task_id, version, fecha, cliente, campana, estado)
4. Guarda los archivos resultantes en la carpeta correspondiente del proyecto
5. Se especifico, detallado y accionable en tus entregables
6. Si tienes herramientas de navegador (browser_navigate, browser_click, etc.), USALAS para producir contenido real
`

  if (context.briefing) {
    prompt += `\n## Briefing Creativo (referencia)\n${context.briefing.substring(0, 4000)}\n`
  }

  if (context.strategy) {
    prompt += `\n## Estrategia de Campana (contexto)\n${context.strategy.substring(0, 2000)}\n`
  }

  return prompt
}
