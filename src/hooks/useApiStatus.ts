import { useState, useEffect, useCallback, useRef } from 'react'
import type { API } from '../types'

interface ApiStatusMap {
  [apiId: number]: 'up' | 'down' | 'checking' | 'unknown'
}

const CACHE_KEY = 'apiHubStatusCache'
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

interface CacheEntry {
  timestamp: number
  data: ApiStatusMap
}

function loadCache(): ApiStatusMap {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_TTL) return {}
    return entry.data
  } catch {
    return {}
  }
}

function saveCache(data: ApiStatusMap) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }))
  } catch { /* quota exceeded */ }
}

export function useApiStatus(apis: API[]) {
  const [statusMap, setStatusMap] = useState<ApiStatusMap>(() => {
    const cached = loadCache()
    const initial: ApiStatusMap = {}
    apis.forEach(api => {
      initial[api.id] = cached[api.id] || 'unknown'
    })
    return initial
  })

  const isCheckingRef = useRef(false)

  const checkBatch = useCallback(async (startIdx: number) => {
    if (isCheckingRef.current) return
    isCheckingRef.current = true

    const BATCH_SIZE = 5
    const BATCH_DELAY = 400
    const endIdx = Math.min(startIdx + BATCH_SIZE, apis.length)
    const batch = apis.slice(startIdx, endIdx)

    setStatusMap(prev => {
      const next = { ...prev }
      batch.forEach(api => { next[api.id] = 'checking' })
      return next
    })

    const results: ApiStatusMap = {}

    await Promise.all(batch.map(async (api) => {
      // Try direct fetch first (no-cors mode - won't read response but checks if server is up)
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        const res = await fetch(api.url, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' })
        clearTimeout(timeout)
        results[api.id] = res.type === 'opaque' || res.ok ? 'up' : 'down'
      } catch {
        // Fallback: try with AllOrigins proxy
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)
          const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(api.url)
          const res = await fetch(proxyUrl, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' })
          clearTimeout(timeout)
          results[api.id] = res.type === 'opaque' || res.ok ? 'up' : 'down'
        } catch {
          results[api.id] = 'down'
        }
      }
    }))

    setStatusMap(prev => {
      const next = { ...prev, ...results }
      saveCache(next)
      return next
    })

    isCheckingRef.current = false

    if (endIdx < apis.length) {
      setTimeout(() => checkBatch(endIdx), BATCH_DELAY)
    }
  }, [apis])

  useEffect(() => {
    const cached = loadCache()
    const hasCached = apis.some(api => cached[api.id])
    if (hasCached) {
      const timer = setTimeout(() => checkBatch(0), 2000)
      return () => clearTimeout(timer)
    } else {
      checkBatch(0)
    }
  }, [apis, checkBatch])

  const getStatus = useCallback((id: number) => {
    return statusMap[id] || 'unknown'
  }, [statusMap])

  const upCount = Object.values(statusMap).filter(s => s === 'up').length
  const downCount = Object.values(statusMap).filter(s => s === 'down').length
  const checkedCount = upCount + downCount

  return { getStatus, statusMap, upCount, downCount, checkedCount, total: apis.length }
}
