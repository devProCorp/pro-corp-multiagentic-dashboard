import { useState } from 'react'
import { useMessages } from '../../hooks/useMessages'
import { useAgents } from '../../hooks/useAgents'
import { useTasks } from '../../hooks/useTasks'
import LoadingSpinner from '../shared/LoadingSpinner'
import AgentAvatar from '../shared/AgentAvatar'
import PriorityBadge from '../shared/PriorityBadge'
import { agentFullName, agentDisplayName, formatDateTime } from '../../utils/formatters'

export default function OrchestrationPage() {
  const { messages, loading, sendMessage } = useMessages()
  const { agents } = useAgents()
  const { tasks } = useTasks()
  const [showComposer, setShowComposer] = useState(false)

  const [form, setForm] = useState({
    from: '',
    to: '',
    taskId: '',
    priority: 'MEDIUM',
    context: '',
    request: '',
    inputs: '',
    deadline: '',
    outputFormat: 'Markdown',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSend = async (e) => {
    e.preventDefault()
    await sendMessage({
      ...form,
      inputs: form.inputs ? form.inputs.split(',').map(s => s.trim()) : [],
    })
    setForm({ from: '', to: '', taskId: '', priority: 'MEDIUM', context: '', request: '', inputs: '', deadline: '', outputFormat: 'Markdown' })
    setShowComposer(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orquestacion</h1>
          <p className="text-gray-500 text-sm mt-1">Mensajes y comunicacion entre agentes</p>
        </div>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showComposer ? 'Cerrar' : '+ Nuevo Mensaje'}
        </button>
      </div>

      {/* Message Composer */}
      {showComposer && (
        <form onSubmit={handleSend} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Enviar Mensaje Inter-Agente</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">De (Agente)</label>
              <select value={form.from} onChange={e => update('from', e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="">Seleccionar</option>
                {agents.map(a => <option key={a.slug} value={a.slug}>{agentFullName(a.slug)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Para (Agente)</label>
              <select value={form.to} onChange={e => update('to', e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="">Seleccionar</option>
                {agents.map(a => <option key={a.slug} value={a.slug}>{agentFullName(a.slug)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Tarea Asociada</label>
              <select value={form.taskId} onChange={e => update('taskId', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="">Sin tarea</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.id} — {t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Prioridad</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Media</option>
                <option value="LOW">Baja</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-400 block mb-1">Contexto</label>
              <input value={form.context} onChange={e => update('context', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Contexto del proyecto" />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-400 block mb-1">Solicitud</label>
              <textarea value={form.request} onChange={e => update('request', e.target.value)} required rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Tarea especifica solicitada" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Inputs (separados por coma)</label>
              <input value={form.inputs} onChange={e => update('inputs', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="archivo1.md, datos.json" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Deadline</label>
              <input type="datetime-local" value={form.deadline} onChange={e => update('deadline', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex gap-3 mt-4 justify-end">
            <button type="button" onClick={() => setShowComposer(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancelar</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Enviar Mensaje</button>
          </div>
        </form>
      )}

      {/* Messages Feed */}
      <div className="space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <AgentAvatar slug={msg.from} size="sm" />
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{agentDisplayName(msg.from)}</span>
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <AgentAvatar slug={msg.to} size="sm" />
                <span className="text-white font-medium text-sm">{agentDisplayName(msg.to)}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <PriorityBadge priority={msg.priority} />
                <span className="text-xs text-gray-500">{formatDateTime(msg.timestamp)}</span>
              </div>
            </div>

            {msg.taskId && (
              <p className="text-xs text-blue-400 mb-2">Tarea: {msg.taskId}</p>
            )}

            {msg.context && (
              <p className="text-xs text-gray-500 mb-2">Contexto: {msg.context}</p>
            )}

            <p className="text-sm text-gray-300">{msg.request}</p>

            {msg.inputs?.length > 0 && (
              <div className="mt-2 flex gap-2">
                {msg.inputs.map((inp, i) => (
                  <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{inp}</span>
                ))}
              </div>
            )}

            {msg.deadline && (
              <p className="text-xs text-gray-500 mt-2">Deadline: {formatDateTime(msg.deadline)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
