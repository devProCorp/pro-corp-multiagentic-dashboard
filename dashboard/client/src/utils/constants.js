export const TASK_STATUSES = {
  PENDING:     { label: 'Pendiente',    color: 'gray',    bg: 'bg-gray-500/20',    text: 'text-gray-400',    border: 'border-gray-500/30' },
  IN_PROGRESS: { label: 'En Progreso',  color: 'blue',    bg: 'bg-blue-500/20',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  BLOCKED:     { label: 'Bloqueada',    color: 'red',     bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/30' },
  REVIEW:      { label: 'En Revision',  color: 'yellow',  bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  border: 'border-yellow-500/30' },
  APPROVED:    { label: 'Aprobada',     color: 'green',   bg: 'bg-green-500/20',   text: 'text-green-400',   border: 'border-green-500/30' },
  REJECTED:    { label: 'Rechazada',    color: 'orange',  bg: 'bg-orange-500/20',  text: 'text-orange-400',  border: 'border-orange-500/30' },
  DONE:        { label: 'Completada',   color: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
}

export const PRIORITIES = {
  HIGH:   { label: 'Alta',   color: 'red',    bg: 'bg-red-500/20',    text: 'text-red-400' },
  MEDIUM: { label: 'Media',  color: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  LOW:    { label: 'Baja',   color: 'gray',   bg: 'bg-gray-500/20',   text: 'text-gray-400' },
}

export const AGENT_LEVELS = {
  0: { label: 'Director',     color: 'blue' },
  1: { label: 'Estrategia',   color: 'yellow' },
  2: { label: 'Produccion',   color: 'cyan' },
  3: { label: 'Tecnologia',   color: 'orange' },
  4: { label: 'Operaciones',  color: 'purple' },
}

export const AGENT_COLORS = {
  'orquestador-director':  { bg: 'bg-blue-500',   ring: 'ring-blue-500/30',   text: 'text-blue-400' },
  'investigador-mercado':  { bg: 'bg-yellow-500', ring: 'ring-yellow-500/30', text: 'text-yellow-400' },
  'estratega-campanas':    { bg: 'bg-red-500',    ring: 'ring-red-500/30',    text: 'text-red-400' },
  'creador-contenido':     { bg: 'bg-cyan-500',   ring: 'ring-cyan-500/30',   text: 'text-cyan-400' },
  'creador-video':         { bg: 'bg-violet-500', ring: 'ring-violet-500/30', text: 'text-violet-400' },
  'disenador-visual':      { bg: 'bg-green-500',  ring: 'ring-green-500/30',  text: 'text-green-400' },
  'desarrollador-martech': { bg: 'bg-orange-500', ring: 'ring-orange-500/30', text: 'text-orange-400' },
  'analista-datos':        { bg: 'bg-pink-500',   ring: 'ring-pink-500/30',   text: 'text-pink-400' },
  'gestor-proyectos':      { bg: 'bg-purple-500', ring: 'ring-purple-500/30', text: 'text-purple-400' },
}

export const STATUS_ORDER = ['PENDING', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'APPROVED', 'REJECTED', 'DONE']
