import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy', { locale: es })
}

export function formatDateTime(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy HH:mm', { locale: es })
}

export function formatRelative(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function agentDisplayName(slug) {
  const names = {
    'orquestador-director': 'Orquestador',
    'investigador-mercado': 'Investigador',
    'estratega-campanas': 'Estratega',
    'creador-contenido': 'Contenido',
    'creador-video': 'Video',
    'disenador-visual': 'Disenador',
    'desarrollador-martech': 'Desarrollador',
    'analista-datos': 'Analista',
    'gestor-proyectos': 'Gestor',
  }
  return names[slug] || slug
}

export function agentFullName(slug) {
  const names = {
    'orquestador-director': 'Orquestador Director',
    'investigador-mercado': 'Investigador de Mercado',
    'estratega-campanas': 'Estratega de Campanas',
    'creador-contenido': 'Creador de Contenido',
    'creador-video': 'Creador de Video',
    'disenador-visual': 'Disenador Visual',
    'desarrollador-martech': 'Desarrollador MarTech',
    'analista-datos': 'Analista de Datos',
    'gestor-proyectos': 'Gestor de Proyectos',
  }
  return names[slug] || slug
}
