import { useCallback, useEffect, useRef, useState } from 'react'
import { beep, primeAudio } from '../lib/beep.js'

/**
 * Compte à rebours de repos basé sur un horodatage de fin (reste juste même si
 * l'onglet est mis en pause). Bip + vibration à zéro.
 */
export function useRestTimer() {
  const [timer, setTimer] = useState(null) // { endAt, total, label }
  const [now, setNow] = useState(() => Date.now())
  const doneRef = useRef(false)

  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [timer])

  const remaining = timer ? Math.max(0, Math.ceil((timer.endAt - now) / 1000)) : 0

  useEffect(() => {
    if (timer && remaining === 0 && !doneRef.current) {
      doneRef.current = true
      beep()
    }
  }, [timer, remaining])

  const start = useCallback((seconds, label = '') => {
    primeAudio()
    doneRef.current = false
    setNow(Date.now())
    setTimer({ endAt: Date.now() + seconds * 1000, total: seconds, label })
  }, [])

  const extend = useCallback((seconds) => {
    doneRef.current = false
    setTimer((t) => (t ? { ...t, endAt: Math.max(t.endAt, Date.now()) + seconds * 1000, total: t.total + seconds } : t))
  }, [])

  const stop = useCallback(() => setTimer(null), [])

  return { timer, remaining, running: Boolean(timer) && remaining > 0, finished: Boolean(timer) && remaining === 0, start, extend, stop }
}
