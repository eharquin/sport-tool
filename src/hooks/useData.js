import { useCallback, useEffect, useState } from 'react'
import { commitData, EMPTY_DATA, fetchData } from '../lib/github.js'
import { isConfigured, loadCache, saveCache } from '../lib/storage.js'

/**
 * Source de vérité = data.json sur GitHub. Le cache localStorage sert
 * d'affichage immédiat / hors-ligne en attendant le refetch.
 */
export function useData(settings) {
  const [data, setData] = useState(() => loadCache() ?? EMPTY_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  const refresh = useCallback(async () => {
    if (!isConfigured(settings)) return
    setLoading(true)
    setError(null)
    try {
      const { data: fresh } = await fetchData(settings)
      setData(fresh)
      saveCache(fresh)
      setLastSync(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [settings])

  useEffect(() => {
    refresh()
  }, [refresh])

  /** Applique une mutation et commit sur GitHub. Lève en cas d'échec. */
  const commit = useCallback(
    async (mutate, message) => {
      const { data: next } = await commitData(settings, mutate, message)
      setData(next)
      saveCache(next)
      setLastSync(new Date())
      return next
    },
    [settings],
  )

  return { data, loading, error, lastSync, refresh, commit }
}
