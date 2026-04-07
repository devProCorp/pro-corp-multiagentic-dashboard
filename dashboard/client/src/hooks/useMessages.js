import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export function useMessages(filters = {}) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const queryStr = new URLSearchParams(filters).toString()

  const refresh = useCallback(async () => {
    try {
      const data = await api.get(`/messages${queryStr ? `?${queryStr}` : ''}`)
      setMessages(data)
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoading(false)
    }
  }, [queryStr])

  useEffect(() => { refresh() }, [refresh])

  const sendMessage = async (msg) => {
    const created = await api.post('/messages', msg)
    setMessages(prev => [created, ...prev])
    return created
  }

  return { messages, loading, refresh, sendMessage }
}
