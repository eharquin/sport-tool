import { fmtClock } from '../lib/time.js'

/** Barre de compte à rebours du repos : temps restant, barre de progression, +30 s / stop. */
export default function RestTimer({ timer, remaining, finished, onExtend, onStop }) {
  if (!timer) return null
  const pct = Math.min(100, (1 - remaining / timer.total) * 100)
  return (
    <div className={`rest-timer ${finished ? 'finished' : ''}`}>
      <div className="rest-bar" style={{ width: `${pct}%` }} />
      <div className="rest-content">
        <div className="rest-info">
          <span className="rest-label">{finished ? 'Repos terminé — go !' : `Repos${timer.label ? ` · ${timer.label}` : ''}`}</span>
          <span className="rest-clock">{fmtClock(remaining)}</span>
        </div>
        <button type="button" className="btn small secondary" onClick={() => onExtend(30)}>
          +30 s
        </button>
        <button type="button" className="btn small secondary" onClick={onStop}>
          {finished ? 'OK' : 'Stop'}
        </button>
      </div>
    </div>
  )
}
