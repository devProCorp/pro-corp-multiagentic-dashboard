import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export function usePipeline(campaignId) {
  const [pipeline, setPipeline] = useState(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!campaignId) return
    try {
      const res = await fetch(`/api/pipeline/${campaignId}`)
      if (res.ok) {
        const data = await res.json()
        if (data && !data.error) setPipeline(data)
        else setPipeline(null)
      } else {
        setPipeline(null)
      }
    } catch {
      setPipeline(null)
    }
  }, [campaignId])

  useEffect(() => {
    refresh()
    // Only poll if there's an active pipeline
    const interval = setInterval(() => {
      if (pipeline?.status === 'running') refresh()
    }, 5000)
    return () => clearInterval(interval)
  }, [refresh, pipeline?.status])

  const launch = async () => {
    setLoading(true)
    try {
      const result = await api.post(`/pipeline/launch/${campaignId}`)
      await refresh()
      return result
    } finally {
      setLoading(false)
    }
  }

  const stop = async () => {
    try {
      await api.post(`/pipeline/stop/${campaignId}`)
      await refresh()
    } catch (err) {
      console.error('Stop failed:', err)
    }
  }

  return { pipeline, launch, stop, loading, refresh }
}
