import { useState } from 'react'
import { agentFullName } from '../../utils/formatters'

export default function TaskForm({ agents, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedAgent: '',
    priority: 'MEDIUM',
    campaignId: 'PROCORP-2026-001',
    clientSlug: 'PROCORP',
    deadline: '',
    outputFormat: 'Markdown',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Nueva Tarea</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm text-gray-400 block mb-1">Titulo</label>
          <input
            value={form.title}
            onChange={e => update('title', e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Titulo de la tarea"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm text-gray-400 block mb-1">Descripcion</label>
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Descripcion detallada"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Agente</label>
          <select
            value={form.assignedAgent}
            onChange={e => update('assignedAgent', e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Seleccionar agente</option>
            {agents.map(a => (
              <option key={a.slug} value={a.slug}>{agentFullName(a.slug)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Prioridad</label>
          <select
            value={form.priority}
            onChange={e => update('priority', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Deadline</label>
          <input
            type="date"
            value={form.deadline}
            onChange={e => update('deadline', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Campana</label>
          <input
            value={form.campaignId}
            onChange={e => update('campaignId', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
          Cancelar
        </button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Crear Tarea
        </button>
      </div>
    </form>
  )
}
