import { Link } from 'react-router-dom'
import { AGENT_COLORS, AGENT_LEVELS } from '../../utils/constants'
import { agentFullName } from '../../utils/formatters'

export default function AgentCard({ agent }) {
  const colors = AGENT_COLORS[agent.slug] || { bg: 'bg-gray-500', text: 'text-gray-400', ring: 'ring-gray-500/30' }
  const level = AGENT_LEVELS[agent.level] || { label: '—' }

  return (
    <Link
      to={`/agents/${agent.slug}`}
      className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center text-lg`}>
          {agent.emoji}
        </div>
        <div className="flex-1">
          <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
            {agentFullName(agent.slug)}
          </p>
          <p className="text-xs text-gray-500">Nivel {agent.level} — {level.label}</p>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'busy' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
      </div>

      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{agent.role}</p>

      {agent.taskSummary && (
        <div className="flex gap-2 text-xs">
          {agent.taskSummary.inProgress > 0 && (
            <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{agent.taskSummary.inProgress} activas</span>
          )}
          {agent.taskSummary.pending > 0 && (
            <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">{agent.taskSummary.pending} pendientes</span>
          )}
          {agent.taskSummary.review > 0 && (
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">{agent.taskSummary.review} en revision</span>
          )}
          {agent.taskSummary.total === 0 && (
            <span className="text-gray-600">Sin tareas asignadas</span>
          )}
        </div>
      )}
    </Link>
  )
}
