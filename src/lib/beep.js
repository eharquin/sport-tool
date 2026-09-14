// Signal sonore de fin de repos via WebAudio. Le contexte doit être créé lors
// d'un geste utilisateur (iOS) : on l'initialise au démarrage du chrono.

let ctx = null

export function primeAudio() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
  } catch {
    ctx = null
  }
}

export function beep(times = 3) {
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200])
  if (!ctx) return
  const t0 = ctx.currentTime
  for (let i = 0; i < times; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, t0 + i * 0.35)
    gain.gain.exponentialRampToValueAtTime(0.4, t0 + i * 0.35 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.35 + 0.25)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0 + i * 0.35)
    osc.stop(t0 + i * 0.35 + 0.3)
  }
}
