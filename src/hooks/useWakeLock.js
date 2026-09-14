import { useEffect } from 'react'

/**
 * Empêche l'écran de se verrouiller tant que `active` est vrai (API Screen Wake
 * Lock). Le verrou est perdu quand l'app passe en arrière-plan : on le redemande
 * au retour. Sans support (vieux navigateurs), ne fait rien.
 */
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock = null
    let cancelled = false

    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release()
      } catch {
        /* refusé (batterie faible, onglet caché…) : on retentera au prochain retour */
      }
    }
    const onVisible = () => document.visibilityState === 'visible' && request()

    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release()
    }
  }, [active])
}
