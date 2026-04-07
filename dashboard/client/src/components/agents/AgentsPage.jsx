import { useAgents } from '../../hooks/useAgents'
import LoadingSpinner from '../shared/LoadingSpinner'
import AgentAvatar from '../shared/AgentAvatar'
import { agentFullName } from '../../utils/formatters'
import { AGENT_LEVELS } from '../../utils/constants'
import { Link } from 'react-router-dom'

export default function AgentsPage() {
  const { agents, loading } = useAgents()

  if (loading) return <LoadingSpinner />

  const levels = [0, 1, 2, 3, 4]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agentes</h1>
        <p className="text-gray-500 text-sm mt-1">Jerarquia completa del sistema multi-agente</p>
      </div>

      {/* Hierarchy view */}
      {levels.map(level => {
        const levelAgents = agents.filter(a => a.level === level)
        if (levelAgents.length === 0) return null
        const levelInfo = AGENT_LEVELS[level]

        return (
          <div key={level}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Nivel {level} — {levelInfo.label}
              </span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levelAgents.map(agent => (
                <Link
                  key={agent.slug}
                  to={`/agents/${agent.slug}`}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <AgentAvatar slug={agent.slug} size="lg" />
                    <div>
                      <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                        {agentFullName(agent.slug)}
                      </p>
                      <p className="text-xs text-gray-500">{agent.model} — {agent.status}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">{agent.role}</p>

                  {/* Capabilities */}
                  {agent.capabilities?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1.5">Capacidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 4).map((cap, i) => (
                          <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded truncate max-w-[200px]">
                            {cap}
                          </span>
                        ))}
                        {agent.capabilities.length > 4 && (
                          <span className="text-xs text-gray-500">+{agent.capabilities.length - 4} mas</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tools */}
                  {agent.tools?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">Herramientas:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.tools.slice(0, 5).map((tool, i) => (
                          <span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                            {tool}
                          </span>
                        ))}
                        {agent.tools.length > 5 && (
                          <span className="text-xs text-gray-500">+{agent.tools.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Task summary */}
                  {agent.taskSummary && agent.taskSummary.total > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800 flex gap-3 text-xs">
                      <span className="text-gray-400">{agent.taskSummary.total} tareas</span>
                      {agent.taskSummary.review > 0 && <span className="text-yellow-400">{agent.taskSummary.review} en revision</span>}
                      {agent.taskSummary.pending > 0 && <span className="text-gray-400">{agent.taskSummary.pending} pendientes</span>}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
