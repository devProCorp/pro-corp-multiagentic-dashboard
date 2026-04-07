import { useState, useEffect } from 'react'
import { api } from '../api/client'

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await api.get('/campaigns')
      setCampaigns(data)
    } catch (err) {
      console.error('Failed to load campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return { campaigns, loading, refresh }
}

export function useCampaign(id) {
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/campaigns/${id}`).then(setCampaign).catch(console.error).finally(() => setLoading(false))
  }, [id])

  return { campaign, loading }
}
