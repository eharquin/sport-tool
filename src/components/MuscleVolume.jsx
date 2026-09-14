import { useMemo } from 'react'
import { VOLUME_ZONES } from '../config/program.js'
import { weeklyMuscleSets } from '../lib/analysis.js'
import { formatDateFR } from '../lib/cycle.js'

function zone(v) {
  if (v === 0) return 'none'
  if (v < VOLUME_ZONES.low) return 'low'
  if (v < VOLUME_ZONES.target) return 'below'
  if (v <= VOLUME_ZONES.high) return 'target'
  return 'high'
}

/** Séries dures / muscle / semaine sur les 4 dernières semaines, tous lieux confondus. */
export default function MuscleVolume({ sessions }) {
  const vol = useMemo(() => weeklyMuscleSets(sessions, 4), [sessions])
  if (!sessions.length) return null

  return (
    <section className="card">
      <h3>Volume hebdo par muscle</h3>
      <p className="muted small">
        Séries dures par semaine (salle + maison). Cible ~{VOLUME_ZONES.target}-{VOLUME_ZONES.high} ; sous{' '}
        {VOLUME_ZONES.low} = maintien seulement. Travail indirect compté ½ (ex. biceps sur tractions).
      </p>
      <div className="table-wrap">
        <table className="table volume">
          <thead>
            <tr>
              <th>Muscle</th>
              {vol.weekStarts.map((w, i) => (
                <th key={w} className="num">
                  {i === vol.weekStarts.length - 1 ? 'En cours' : formatDateFR(w).replace(/^\w+\.? /, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vol.rows.map((r) => (
              <tr key={r.key}>
                <td>{r.label}</td>
                {r.perWeek.map((v, i) => (
                  <td key={i} className={`num vol-${zone(v)}`}>
                    {v || '·'}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="muted">
              <td>Séances</td>
              {vol.sessionsPerWeek.map((n, i) => (
                <td key={i} className="num">
                  {n}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span className="vol-low">&lt;{VOLUME_ZONES.low} faible</span>
        <span className="vol-below">{VOLUME_ZONES.low}-{VOLUME_ZONES.target - 1} bas</span>
        <span className="vol-target">{VOLUME_ZONES.target}-{VOLUME_ZONES.high} cible</span>
        <span className="vol-high">&gt;{VOLUME_ZONES.high} élevé</span>
      </div>
      {vol.unknown.length > 0 && (
        <p className="muted small">Non comptés (muscles inconnus) : {vol.unknown.join(', ')}</p>
      )}
    </section>
  )
}
