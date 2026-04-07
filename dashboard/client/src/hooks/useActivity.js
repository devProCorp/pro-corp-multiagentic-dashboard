import { useState, useEffect } from 'react'
import { api } from '../api/client'

export function useActivity(limit = 50) {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await api.get(`/activity?limit=${limit}`)
      setActivity(data)
    } catch (err) {
      console.error('Failed to load activity:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [limit])

  return { activity, loading, refresh }
}
