import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAgent } from '../../hooks/useAgents'
import { useExecute } from '../../hooks/useExecute'
import LoadingSpinner from '../shared/LoadingSpinner'
import StatusBadge from '../shared/StatusBadge'
import PriorityBadge from '../shared/PriorityBadge'
import AgentAvatar from '../shared/AgentAvatar'
import { agentFullName, formatDate } from '../../utils/formatters'
import { AGENT_LEVELS } from '../../utils/constants'

export default function AgentDetail() {
  const { slug } = useParams()
  const { agent, loading } = useAgent(slug)
  const { executeTask, isRunning } = useExecute()
  const [executing, setExecuting] = useState(null)

  const handleExecute = async (taskId) => {
    setExecuting(taskId)
    try {
      await executeTask(taskId)
    } catch (err) {
      console.error('Execution failed:', err)
    } finally {
      setTimeout(() => setExecuting(null), 2000)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!agent) return <div className="text-gray-400">Agente no encontrado</div>

  const levelInfo = AGENT_LEVELS[agent.level] || { label: '—' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <AgentAvatar slug={slug} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-white">{agentFullName(slug)}</h1>
          <p className="text-gray-500 text-sm">
            Nivel {agent.level} — {levelInfo.label} — Modelo: {agent.model}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${agent.status === 'busy' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
          <span className="text-sm text-gray-400">{agent.status === 'busy' ? 'Trabajando' : 'Disponible'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info panel */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Rol</h2>
            <p className="text-gray-300 text-sm">{agent.role}</p>
          </div>

          {agent.capabilities?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Capacidades</h2>
              <ul className="space-y-1.5">
                {agent.capabilities.map((cap, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">-</span>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {agent.tools?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Herramientas</h2>
              <div className="flex flex-wrap gap-2">
                {agent.tools.map((tool, i) => (
                  <span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg">{tool}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Entradas / Salidas</h2>
            {agent.inputs?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Entradas:</p>
                {agent.inputs.map((inp, i) => (
                  <p key={i} className="text-sm text-gray-300">- {inp}</p>
                ))}
              </div>
            )}
            {agent.outputs?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Salidas:</p>
                {agent.outputs.map((out, i) => (
                  <p key={i} className="text-sm text-gray-300">- {out}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white mb-4">
              Tareas Asignadas ({agent.tasks?.length || 0})
            </h2>
            <div className="space-y-2">
              {agent.tasks?.map(task => {
                const taskRunning = isRunning(task.id) || executing === task.id
                return (
                  <div key={task.id} className={`flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg ${taskRunning ? 'ring-2 ring-blue-500/50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{task.id} — Campana: {task.campaignId}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-gray-500">{formatDate(task.deadline)}</span>
                      {['PENDING', 'REJECTED'].includes(task.status) && (
                        <button
                          onClick={() => handleExecute(task.id)}
                          disabled={taskRunning}
                          className="mt-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-xs px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          {taskRunning ? (
                            <><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></span> Ejecutando</>
                          ) : (
                            'Ejecutar'
                          )}
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <span className="mt-1 text-xs text-blue-400 flex items-center gap-1">
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></span>
                          Trabajando
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              {(!agent.tasks || agent.tasks.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-8">Sin tareas asignadas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
