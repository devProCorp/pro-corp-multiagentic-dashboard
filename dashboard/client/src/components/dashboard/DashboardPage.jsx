import { useAgents } from '../../hooks/useAgents'
import { useTasks } from '../../hooks/useTasks'
import { useCampaigns } from '../../hooks/useCampaigns'
import { useActivity } from '../../hooks/useActivity'
import AgentCard from './AgentCard'
import LoadingSpinner from '../shared/LoadingSpinner'
import StatusBadge from '../shared/StatusBadge'
import AgentAvatar from '../shared/AgentAvatar'
import { agentDisplayName, formatRelative } from '../../utils/formatters'
import { TASK_STATUSES } from '../../utils/constants'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { agents, loading: loadingAgents } = useAgents()
  const { tasks, loading: loadingTasks } = useTasks()
  const { campaigns, loading: loadingCampaigns } = useCampaigns()
  const { activity, loading: loadingActivity } = useActivity(20)

  if (loadingAgents || loadingTasks) return <LoadingSpinner />

  const statusCounts = {}
  for (const s of Object.keys(TASK_STATUSES)) {
    statusCounts[s] = tasks.filter(t => t.status === s).length
  }
  const activeAgents = agents.filter(a => a.status === 'busy').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Vista general del sistema multi-agente</p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(TASK_STATUSES).map(([key, config]) => (
          <div key={key} className={`rounded-lg border p-3 ${config.bg} ${config.border}`}>
            <p className={`text-2xl font-bold ${config.text}`}>{statusCounts[key] || 0}</p>
            <p className="text-xs text-gray-400 mt-0.5">{config.label}</p>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <p className="text-3xl font-bold text-white">{tasks.length}</p>
          <p className="text-sm text-gray-400">Total Tareas</p>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <p className="text-3xl font-bold text-blue-400">{activeAgents}</p>
          <p className="text-sm text-gray-400">Agentes Activos</p>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <p className="text-3xl font-bold text-green-400">{campaigns.length}</p>
          <p className="text-sm text-gray-400">Campanas Activas</p>
        </div>
      </div>

      {/* Agents Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Agentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map(agent => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      </div>

      {/* Campaigns + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Campanas Activas</h2>
          {!loadingCampaigns && campaigns.map(c => (
            <Link key={c.id} to={`/campaigns/${c.id}`} className="block p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{c.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{c.client} — {c.documentCount} documentos</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={c.status} />
                  <div className="mt-1.5 w-32 bg-gray-700 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${c.progress}%` }}></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {!loadingActivity && activity.map(log => (
              <div key={log.id} className="flex items-start gap-3">
                <AgentAvatar slug={log.agent} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">{agentDisplayName(log.agent)}</span>
                    {' '}
                    {log.action === 'status_change' && (
                      <>cambio estado de <StatusBadge status={log.details?.from} /> a <StatusBadge status={log.details?.to} /></>
                    )}
                    {log.action === 'task_created' && `creo tarea: ${log.details?.title}`}
                    {log.action === 'message_sent' && `envio mensaje a ${agentDisplayName(log.details?.to)}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{log.taskId} — {formatRelative(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
