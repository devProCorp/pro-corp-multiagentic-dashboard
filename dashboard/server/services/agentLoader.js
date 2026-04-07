import fs from 'fs'
import path from 'path'
import { parseMarkdownFile, parseSections, parseListItems } from './fileParser.js'

const PROJECT_ROOT = path.resolve(process.cwd(), '..', '..')

const AGENT_META = {
  'orquestador-director':  { level: 0, emoji: '🎯', role: 'Coordina todos los agentes, gestiona prioridades' },
  'investigador-mercado':  { level: 1, emoji: '🔍', role: 'Analiza mercados, competencia y tendencias' },
  'estratega-campanas':    { level: 1, emoji: '🧠', role: 'Disena estrategias y briefings creativos' },
  'creador-contenido':     { level: 2, emoji: '✍️', role: 'Redacta copies, blogs, emails, posts' },
  'creador-video':         { level: 2, emoji: '🎬', role: 'Guiones, storyboards, directrices de produccion' },
  'disenador-visual':      { level: 2, emoji: '🎨', role: 'Identidad, banners, creatividades graficas' },
  'desarrollador-martech': { level: 3, emoji: '💻', role: 'Landing pages, integraciones, automatizaciones' },
  'analista-datos':        { level: 3, emoji: '📊', role: 'Metricas, reportes, optimizacion basada en datos' },
  'gestor-proyectos':      { level: 4, emoji: '📋', role: 'Cronogramas, deadlines, control de calidad' },
}

const SLUG_TO_DIR = {
  'orquestador-director': 'orquestador',
  'investigador-mercado': 'investigador',
  'estratega-campanas': 'estratega',
  'creador-contenido': 'contenido',
  'creador-video': 'video',
  'disenador-visual': 'diseno',
  'desarrollador-martech': 'desarrollador',
  'analista-datos': 'analista',
  'gestor-proyectos': 'gestor-proyectos',
}

export function loadAllAgents() {
  const agents = []

  for (const [slug, meta] of Object.entries(AGENT_META)) {
    const agent = loadAgent(slug)
    if (agent) agents.push(agent)
  }

  return agents.sort((a, b) => a.level - b.level)
}

export function loadAgent(slug) {
  const meta = AGENT_META[slug]
  if (!meta) return null

  const dirName = SLUG_TO_DIR[slug]
  let capabilities = []
  let inputs = []
  let outputs = []
  let tools = []

  // Load from agents/{dir}/system-prompt.md
  const systemPromptPath = path.join(PROJECT_ROOT, 'agents', dirName, 'system-prompt.md')
  if (fs.existsSync(systemPromptPath)) {
    const { content } = parseMarkdownFile(systemPromptPath)
    const sections = parseSections(content)

    capabilities = parseListItems(sections['Capacidades'] || '')
    inputs = parseListItems(sections['Entradas'] || '')
    outputs = parseListItems(sections['Salidas'] || '')

    const toolsSection = sections['Herramientas'] || ''
    tools = toolsSection.trim().split('\n').filter(Boolean).map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
    if (tools.length === 1) tools = tools[0].split(',').map(t => t.trim())
  }

  // Load from .claude/agents/{slug}.md
  let color = 'gray'
  let model = 'sonnet'
  const claudeAgentPath = path.join(PROJECT_ROOT, '.claude', 'agents', `${slug}.md`)
  if (fs.existsSync(claudeAgentPath)) {
    const { data } = parseMarkdownFile(claudeAgentPath)
    color = data.color || 'gray'
    model = data.model || 'sonnet'
  }

  return {
    slug,
    name: meta.role.split(',')[0],
    emoji: meta.emoji,
    level: meta.level,
    role: meta.role,
    color,
    model,
    capabilities,
    inputs,
    outputs,
    tools,
  }
}
