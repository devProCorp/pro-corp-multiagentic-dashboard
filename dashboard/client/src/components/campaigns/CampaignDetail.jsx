import { useParams } from 'react-router-dom'
import { useCampaign } from '../../hooks/useCampaigns'
import { useTasks } from '../../hooks/useTasks'
import { usePipeline } from '../../hooks/usePipeline'
import LoadingSpinner from '../shared/LoadingSpinner'
import StatusBadge from '../shared/StatusBadge'
import PriorityBadge from '../shared/PriorityBadge'
import AgentAvatar from '../shared/AgentAvatar'
import { agentDisplayName, formatDate, formatDateTime, formatRelative } from '../../utils/formatters'
import { TASK_STATUSES } from '../../utils/constants'

const TIMELINE = [
  { date: '2026-04-12', label: 'Identidad visual aprobada', agent: 'disenador-visual' },
  { date: '2026-04-14', label: 'Primeros 10 posts + Reels', agent: 'creador-contenido' },
  { date: '2026-04-16', label: 'Landing page publicada', agent: 'desarrollador-martech' },
  { date: '2026-04-18', label: 'Hero Video publicado', agent: 'creador-video' },
  { date: '2026-04-21', label: 'LANZAMIENTO OFICIAL', agent: 'orquestador-director' },
  { date: '2026-05-14', label: 'Primer webinar', agent: 'estratega-campanas' },
  { date: '2026-06-30', label: 'Cierre Q2', agent: 'analista-datos' },
]

export default function CampaignDetail() {
  const { id } = useParams()
  const { campaign, loading } = useCampaign(id)
  const { tasks } = useTasks({ campaign: id })
  const { pipeline, launch, stop, loading: pipelineLoading } = usePipeline(id)

  if (loading) return <LoadingSpinner />
  if (!campaign) return <div className="text-gray-400">Campana no encontrada</div>

  const isRunning = pipeline?.status === 'running'
  const isCompleted = pipeline?.status === 'completed'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cliente: {campaign.client} — {formatDate(campaign.fecha)}
          </p>
        </div>

        {/* Pipeline Launch Button */}
        <div className="flex gap-2">
          {!isRunning && (
            <button
              onClick={launch}
              disabled={pipelineLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {pipelineLoading ? (
                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> Iniciando...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Lanzar Campana</>
              )}
            </button>
          )}
          {isRunning && (
            <button
              onClick={stop}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
              Detener Pipeline
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Status Panel */}
      {pipeline && (
        <div className={`border rounded-lg p-5 ${
          isRunning ? 'bg-blue-950/50 border-blue-500/30' :
          isCompleted ? 'bg-green-950/50 border-green-500/30' :
          'bg-gray-900 border-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isRunning && <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></span>}
              {isCompleted && <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              <h2 className="text-lg font-semibold text-white">
                Pipeline {isRunning ? 'en Ejecucion' : isCompleted ? 'Completado' : pipeline.status}
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              {pipeline.completedTasks}/{pipeline.totalTasks} tareas
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${pipeline.totalTasks > 0 ? (pipeline.completedTasks / pipeline.totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Execution phases */}
          {pipeline.taskOrder && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Fases de ejecucion (por dependencias):</p>
              <div className="flex gap-2 flex-wrap">
                {pipeline.taskOrder.map((batch, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      Fase {i + 1}: {batch.join(', ')}
                    </span>
                    {i < pipeline.taskOrder.length - 1 && (
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution log */}
          {pipeline.executionLog?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Log de ejecucion:</p>
              <div className="bg-gray-900/50 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
                {pipeline.executionLog.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-600 shrink-0">{formatDateTime(log.timestamp)}</span>
                    <span className={log.message.includes('ERROR') ? 'text-red-400' : log.message.includes('completado') ? 'text-green-400' : 'text-gray-300'}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {pipeline.errors?.length > 0 && (
            <div className="mt-3 bg-red-950/30 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-400 font-medium mb-1">Errores:</p>
              {pipeline.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-300">{err.taskId}: {err.error}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Timeline Critico</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
          {TIMELINE.map((item, i) => {
            const isPast = new Date(item.date) < new Date()
            return (
              <div key={i} className="relative pl-10 pb-6 last:pb-0">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                  isPast ? 'bg-green-500 border-green-500' : 'bg-gray-900 border-gray-500'
                }`}></div>
                <div className="flex items-center gap-3">
                  <AgentAvatar slug={item.agent} size="sm" />
                  <div>
                    <p className={`text-sm font-medium ${isPast ? 'text-green-400' : 'text-white'}`}>{item.label}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.date)} — {agentDisplayName(item.agent)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tareas ({tasks.length})</h2>
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className={`flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors ${
              task.status === 'IN_PROGRESS' ? 'ring-1 ring-blue-500/30' : ''
            }`}>
              <AgentAvatar slug={task.assignedAgent} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{task.title}</p>
                <p className="text-xs text-gray-500">{task.id} — {agentDisplayName(task.assignedAgent)}</p>
              </div>
              {task.status === 'IN_PROGRESS' && (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></span>
              )}
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              <span className="text-xs text-gray-500 w-24 text-right">{formatDate(task.deadline)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Documentos ({campaign.documents?.length || 0})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {campaign.documents?.map(doc => (
            <div key={doc.fileName} className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-white font-medium">{doc.fileName}</p>
              <p className="text-xs text-gray-500 mt-1">{doc.path}</p>
              <div className="flex gap-2 mt-2">
                {doc.estado && <StatusBadge status={doc.estado} />}
                {doc.agente && <span className="text-xs text-gray-400">{doc.agente}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
