import { useState, useEffect } from 'react'
import { api } from '../api/client'

export function useAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await api.get('/agents')
      setAgents(data)
    } catch (err) {
      console.error('Failed to load agents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return { agents, loading, refresh }
}

export function useAgent(slug) {
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    api.get(`/agents/${slug}`).then(setAgent).catch(console.error).finally(() => setLoading(false))
  }, [slug])

  return { agent, loading }
}
