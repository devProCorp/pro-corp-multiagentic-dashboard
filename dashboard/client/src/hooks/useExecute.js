import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export function useExecute() {
  const [running, setRunning] = useState({})
  const [loading, setLoading] = useState(false)

  const refreshRunning = useCallback(async () => {
    try {
      const data = await api.get('/execute/running')
      setRunning(data)
    } catch (err) {
      console.error('Failed to fetch running tasks:', err)
    }
  }, [])

  useEffect(() => {
    refreshRunning()
    const interval = setInterval(refreshRunning, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [refreshRunning])

  const executeTask = async (taskId) => {
    setLoading(true)
    try {
      const result = await api.post(`/execute/${taskId}`)
      setRunning(prev => ({ ...prev, [taskId]: { startedAt: new Date().toISOString() } }))
      return result
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const isRunning = (taskId) => !!running[taskId]

  return { running, executeTask, isRunning, loading, refreshRunning }
}
