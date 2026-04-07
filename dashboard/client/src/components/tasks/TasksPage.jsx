import { useState } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { useAgents } from '../../hooks/useAgents'
import { useExecute } from '../../hooks/useExecute'
import LoadingSpinner from '../shared/LoadingSpinner'
import StatusBadge from '../shared/StatusBadge'
import PriorityBadge from '../shared/PriorityBadge'
import AgentAvatar from '../shared/AgentAvatar'
import { agentDisplayName, formatDate } from '../../utils/formatters'
import { STATUS_ORDER, TASK_STATUSES } from '../../utils/constants'
import TaskForm from './TaskForm'

export default function TasksPage() {
  const { tasks, loading, updateTask, createTask, refresh } = useTasks()
  const { agents } = useAgents()
  const { executeTask, isRunning } = useExecute()
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [executing, setExecuting] = useState(null)

  if (loading) return <LoadingSpinner />

  const columns = STATUS_ORDER.map(status => ({
    status,
    ...TASK_STATUSES[status],
    tasks: tasks.filter(t => t.status === status),
  }))

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus })
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({ ...prev, status: newStatus }))
    }
  }

  const handleExecute = async (taskId) => {
    setExecuting(taskId)
    try {
      await executeTask(taskId)
      // Refresh tasks after a short delay to see the status change
      setTimeout(() => { refresh(); setExecuting(null) }, 1500)
    } catch (err) {
      console.error('Execution failed:', err)
      setExecuting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tareas</h1>
          <p className="text-gray-500 text-sm mt-1">Kanban de todas las tareas del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nueva Tarea
        </button>
      </div>

      {showForm && (
        <TaskForm
          agents={agents}
          onSubmit={async (task) => { await createTask(task); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.status} className="flex-shrink-0 w-64">
            <div className={`flex items-center gap-2 mb-3 px-2`}>
              <div className={`w-3 h-3 rounded-full bg-${col.color}-500`}></div>
              <span className={`text-sm font-medium ${col.text}`}>{col.label}</span>
              <span className="text-xs text-gray-500 ml-auto">{col.tasks.length}</span>
            </div>

            <div className="space-y-2 min-h-[200px]">
              {col.tasks.map(task => {
                const taskIsRunning = isRunning(task.id) || executing === task.id
                return (
                  <div
                    key={task.id}
                    className={`bg-gray-900 border rounded-lg p-3 cursor-pointer hover:border-gray-600 transition-all ${col.border} ${taskIsRunning ? 'ring-2 ring-blue-500/50 animate-pulse' : ''}`}
                  >
                    <div onClick={() => setSelectedTask(task)}>
                      <div className="flex items-start gap-2 mb-2">
                        <AgentAvatar slug={task.assignedAgent} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium leading-tight">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{agentDisplayName(task.assignedAgent)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs text-gray-500">{formatDate(task.deadline)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{task.id}</p>
                    </div>

                    {/* Execute button */}
                    {['PENDING', 'REJECTED'].includes(task.status) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExecute(task.id) }}
                        disabled={taskIsRunning}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        {taskIsRunning ? (
                          <><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></span> Ejecutando...</>
                        ) : (
                          <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Ejecutar Agente</>
                        )}
                      </button>
                    )}

                    {task.status === 'IN_PROGRESS' && (
                      <div className="mt-2 w-full bg-blue-600/20 text-blue-400 text-xs font-medium py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5">
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></span>
                        Agente trabajando...
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedTask.title}</h3>
                <p className="text-sm text-gray-500">{selectedTask.id}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>

            <p className="text-sm text-gray-300 mb-4">{selectedTask.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Agente:</span>
                <div className="flex items-center gap-2 mt-1">
                  <AgentAvatar slug={selectedTask.assignedAgent} size="sm" />
                  <span className="text-white">{agentDisplayName(selectedTask.assignedAgent)}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Deadline:</span>
                <p className="text-white mt-1">{formatDate(selectedTask.deadline)}</p>
              </div>
              <div>
                <span className="text-gray-500">Prioridad:</span>
                <div className="mt-1"><PriorityBadge priority={selectedTask.priority} /></div>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <div className="mt-1"><StatusBadge status={selectedTask.status} /></div>
              </div>
            </div>

            {selectedTask.dependencies?.length > 0 && (
              <div className="mb-4">
                <span className="text-gray-500 text-sm">Dependencias:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTask.dependencies.map(dep => (
                    <span key={dep} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{dep}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Execute button in modal */}
            {['PENDING', 'REJECTED'].includes(selectedTask.status) && (
              <button
                onClick={() => handleExecute(selectedTask.id)}
                disabled={isRunning(selectedTask.id) || executing === selectedTask.id}
                className="w-full mb-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {(isRunning(selectedTask.id) || executing === selectedTask.id) ? (
                  <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> Agente ejecutando...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Ejecutar Agente</>
                )}
              </button>
            )}

            {selectedTask.status === 'IN_PROGRESS' && (
              <div className="w-full mb-4 bg-blue-600/20 text-blue-400 font-medium py-2.5 rounded-lg text-center flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></span>
                Agente trabajando en esta tarea...
              </div>
            )}

            {/* Status change buttons */}
            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs text-gray-500 mb-2">Cambiar estado:</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_ORDER.filter(s => s !== selectedTask.status).map(status => (
                  <button
                    key={status}
                    onClick={async () => {
                      await handleStatusChange(selectedTask.id, status)
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${TASK_STATUSES[status].bg} ${TASK_STATUSES[status].text} ${TASK_STATUSES[status].border} hover:opacity-80`}
                  >
                    {TASK_STATUSES[status].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
