import { useMemo, useState } from 'react'
import { LOCATIONS, phaseForWeek, slotByName } from '../config/program.js'
import { formatDateFR } from '../lib/cycle.js'
import { deleteSession } from '../lib/ops.js'
import { formatSets, sessionLocation, sortedSessions } from '../lib/stats.js'

/** Historique des séances : consultation, modification (renvoie vers l'écran Séance), suppression. */
export default function SessionList({ data, onEdit, onCommit }) {
  const sessions = useMemo(() => sortedSessions(data.sessions).reverse(), [data.sessions])
  const [open, setOpen] = useState(null) // clé date-day de la séance dépliée
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const key = (s) => `${s.date}-${s.day}`

  const remove = async (s) => {
    setBusy(true)
    setNotice(null)
    try {
      const { queued } = await onCommit(deleteSession(s.date, s.day), `Suppression séance ${s.date} - Jour ${s.day}`)
      setConfirm(null)
      setOpen(null)
      setNotice({ ok: true, msg: `Séance du ${formatDateFR(s.date)} supprimée${queued ? ' (hors-ligne, en attente)' : ' ✓'}` })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec : ${e.message}` })
    } finally {
      setBusy(false)
    }
  }

  if (!sessions.length) {
    return (
      <div className="screen">
        <h2>Séances</h2>
        <p className="muted">Aucune séance enregistrée.</p>
      </div>
    )
  }

  return (
    <div className="screen">
      <h2>Séances</h2>
      <p className="muted small">{sessions.length} séance(s). Tape une séance pour la détailler, la modifier ou la supprimer.</p>
      {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}

      {sessions.map((s) => {
        const k = key(s)
        const loc = sessionLocation(s)
        const isOpen = open === k
        return (
          <section className={`card session-item ${isOpen ? 'open' : ''}`} key={k}>
            <button type="button" className="session-summary" onClick={() => setOpen(isOpen ? null : k)}>
              <span className="session-date">
                {formatDateFR(s.date)} · <strong>Jour {s.day}</strong> {LOCATIONS[loc].icon}
              </span>
              <span className="muted small">
                S{s.week} {phaseForWeek(s.week)?.label ?? s.phase} · {s.exercises.length} ex.
                {s.duration_min ? ` · ${s.duration_min} min` : ''}
                {s.notes ? ' · 📝' : ''}
              </span>
            </button>

            {isOpen && (
              <>
                <table className="table">
                  <tbody>
                    {s.exercises.map((ex) => (
                      <tr key={ex.name}>
                        <td>{ex.name}</td>
                        <td className="mono">{formatSets(ex.sets, slotByName(ex.name)?.unit ?? '', slotByName(ex.name)?.load)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {s.notes && <p className="session-notes">📝 {s.notes}</p>}
                {confirm === k ? (
                  <div className="actions">
                    <button type="button" className="btn secondary" onClick={() => setConfirm(null)} disabled={busy}>
                      Annuler
                    </button>
                    <button type="button" className="btn danger" onClick={() => remove(s)} disabled={busy}>
                      {busy ? 'Suppression…' : 'Confirmer la suppression'}
                    </button>
                  </div>
                ) : (
                  <div className="actions">
                    <button type="button" className="btn secondary danger-text" onClick={() => setConfirm(k)}>
                      Supprimer
                    </button>
                    <button type="button" className="btn primary" onClick={() => onEdit({ date: s.date, day: s.day, location: loc })}>
                      Modifier
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )
      })}
    </div>
  )
}
