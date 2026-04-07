import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const queryStr = new URLSearchParams(filters).toString()

  const refresh = useCallback(async () => {
    try {
      const data = await api.get(`/tasks${queryStr ? `?${queryStr}` : ''}`)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [queryStr])

  useEffect(() => { refresh() }, [refresh])

  const updateTask = async (id, updates) => {
    const updated = await api.patch(`/tasks/${id}`, updates)
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }

  const createTask = async (task) => {
    const created = await api.post('/tasks', task)
    setTasks(prev => [...prev, created])
    return created
  }

  return { tasks, loading, refresh, updateTask, createTask }
}
