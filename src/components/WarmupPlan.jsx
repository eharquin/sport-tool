import { useState } from 'react'
import { warmupPlan } from '../lib/warmup.js'

/**
 * Paliers d'échauffement calculés depuis la charge de la 1re série de travail,
 * avec un bouton repos par palier. Déplié par défaut pour le premier lourd.
 */
export default function WarmupPlan({ slot, workingWeight, onRest, exerciseName }) {
  const plan = warmupPlan(slot, workingWeight)
  const [open, setOpen] = useState(slot.warmup === 'heavyFirst')
  if (!plan) return null

  return (
    <div className={`warmup ${open ? 'open' : ''}`}>
      <button type="button" className="warmup-toggle" onClick={() => setOpen((o) => !o)}>
        <span>
          Échauffement · {plan.rows.length} palier{plan.rows.length > 1 ? 's' : ''}
          <span className="muted"> — {plan.title}</span>
        </span>
        <span className="warmup-chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <>
          {plan.note && <p className="muted small warmup-note">{plan.note}</p>}
          <ol className="warmup-list">
            {plan.rows.map((r, i) => (
              <li key={i} className="warmup-row">
                <span className="warmup-num">{i + 1}</span>
                <span className="warmup-load">{r.label}</span>
                <span className="warmup-reps">× {r.reps}</span>
                <button
                  type="button"
                  className="btn small warmup-rest"
                  onClick={() => onRest(r.rest, `${exerciseName} · échauffement ${i + 1}`)}
                >
                  ▶ {r.restLabel}
                </button>
              </li>
            ))}
            <li className="warmup-row work">
              <span className="warmup-num">→</span>
              <span className="warmup-load">
                {slot.load === 'added' && workingWeight > 0 ? '+' : ''}
                {workingWeight} kg
              </span>
              <span className="warmup-reps muted">série de travail</span>
            </li>
          </ol>
        </>
      )}
    </div>
  )
}
