import { useCallback, useEffect, useState } from 'react'

const KEY = 'muscu.session-timer'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

/**
 * Chrono global de la séance. Persisté en localStorage ({ startedAt, endedAt })
 * pour survivre à un rechargement ou une mise en veille.
 */
export function useSessionTimer() {
  const [state, setState] = useState(load) // null | { startedAt, endedAt? }
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    try {
      if (state) localStorage.setItem(KEY, JSON.stringify(state))
      else localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [state])

  useEffect(() => {
    if (!state || state.endedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [state])

  const elapsedSec = state ? Math.floor(((state.endedAt ?? now) - state.startedAt) / 1000) : 0

  const start = useCallback(() => setState({ startedAt: Date.now() }), [])
  const stop = useCallback(() => setState((s) => (s && !s.endedAt ? { ...s, endedAt: Date.now() } : s)), [])
  const reset = useCallback(() => setState(null), [])

  return { started: Boolean(state), running: Boolean(state) && !state.endedAt, elapsedSec, start, stop, reset }
}
