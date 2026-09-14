import { fmtClock } from '../lib/time.js'

/** Chrono global de séance : démarrer / temps écoulé / terminer. */
export default function SessionTimer({ started, running, elapsedSec, onStart, onStop, onReset }) {
  if (!started) {
    return (
      <button type="button" className="btn small secondary session-timer" onClick={onStart}>
        ▶ Démarrer la séance
      </button>
    )
  }
  return (
    <div className="session-timer">
      <span className={`session-clock ${running ? 'running' : ''}`}>⏱ {fmtClock(elapsedSec)}</span>
      {running ? (
        <button type="button" className="btn small secondary" onClick={onStop}>
          ■ Terminer
        </button>
      ) : (
        <button type="button" className="btn-link" onClick={onReset}>
          réinitialiser
        </button>
      )}
    </div>
  )
}
