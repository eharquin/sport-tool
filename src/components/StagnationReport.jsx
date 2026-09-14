import { useMemo } from 'react'
import { STAGNATION_SESSIONS, stagnationReport } from '../lib/analysis.js'
import { formatDateFR } from '../lib/cycle.js'

/** Bilan : exercices qui stagnent (e1RM sans record depuis N séances) et signal de deload réactif. */
export default function StagnationReport({ sessions, bodyweight, location }) {
  const report = useMemo(() => stagnationReport(sessions, bodyweight, location), [sessions, bodyweight, location])
  if (!report.items.length) {
    return (
      <section className="card">
        <h3>Bilan de progression</h3>
        <p className="muted small">
          Disponible après {STAGNATION_SESSIONS + 1} séances d'un même exercice.
        </p>
      </section>
    )
  }
  return (
    <section className="card">
      <h3>Bilan de progression</h3>
      {report.suggestDeload && (
        <div className="notice error">
          {report.stagnant.length}/{report.items.length} exercices stagnent → envisage un deload cette semaine (RIR 4-5,
          volume ÷ 2), puis reprends avec des variantes.
        </div>
      )}
      {report.stagnant.length === 0 ? (
        <p className="ok">Tous les exercices suivis ont progressé récemment ✓</p>
      ) : (
        <ul className="stag-list">
          {report.stagnant.map((it) => (
            <li key={it.name}>
              <strong>{it.name}</strong> — record e1RM {it.best} kg le {formatDateFR(it.bestDate)}, {it.sinceBest} séances sans
              dépasser.
            </li>
          ))}
        </ul>
      )}
      <p className="muted small">
        Stagnation = {STAGNATION_SESSIONS} séances (hors deload) sans battre le meilleur e1RM. Pistes : changer de variante,
        vérifier repos/sommeil, ou deload sur cet exercice seul. {report.items.length - report.stagnant.length} exercice(s)
        progressent.
      </p>
    </section>
  )
}
