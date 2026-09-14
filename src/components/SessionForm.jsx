import { useEffect, useMemo, useState } from 'react'
import { DAYS, DAY_KEYS } from '../config/program.js'
import { cycleInfo, dayForDate, formatDateFR, todayISO } from '../lib/cycle.js'
import { lastPerformance, sortedSessions } from '../lib/stats.js'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage.js'
import { useRestTimer } from '../hooks/useRestTimer.js'
import { useSessionTimer } from '../hooks/useSessionTimer.js'
import { useWakeLock } from '../hooks/useWakeLock.js'
import ExerciseCard from './ExerciseCard.jsx'
import PhaseBanner from './PhaseBanner.jsx'
import RestTimer from './RestTimer.jsx'
import SessionTimer from './SessionTimer.jsx'

/** Construit une séance pré-remplie à partir du programme + dernières perfs. */
function buildSession(date, day, sessions, rirTarget) {
  const existing = sessions.find((s) => s.date === date && s.day === day)
  if (existing) return structuredClone(existing)

  const exercises = DAYS[day].exercises.map((slot) => {
    // Variante la plus récemment utilisée parmi les options du créneau
    let name = slot.options[0]
    let latest = null
    for (const opt of slot.options) {
      const last = lastPerformance(sessions, opt, date)
      if (last && (!latest || last.date > latest.date)) {
        latest = last
        name = opt
      }
    }
    const nbSets = latest ? latest.sets.length : slot.sets[0]
    const sets = Array.from({ length: nbSets }, (_, i) => {
      const ref = latest ? latest.sets[Math.min(i, latest.sets.length - 1)] : null
      return {
        weight_added_kg: ref ? ref.weight_added_kg : 0,
        reps: ref ? ref.reps : slot.reps[0],
        rir: rirTarget,
      }
    })
    return { name, sets }
  })

  return { date, day, exercises }
}

export default function SessionForm({ data, settings, onCommit }) {
  const [date, setDate] = useState(todayISO)
  const [day, setDay] = useState(() => dayForDate(todayISO()))
  const [session, setSession] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const rest = useRestTimer()
  const chrono = useSessionTimer()
  // Écran maintenu allumé pendant un repos (le téléphone ne se verrouille pas)
  useWakeLock(rest.running)

  const { week, phase, rir } = useMemo(() => cycleInfo(date, settings.cycleStart), [date, settings.cycleStart])
  const sessions = useMemo(() => sortedSessions(data.sessions), [data.sessions])
  const alreadySaved = sessions.some((s) => s.date === date && s.day === day)

  // Chargement du brouillon (si même date/jour) ou construction d'une séance neuve
  useEffect(() => {
    const draft = loadDraft()
    if (draft && draft.date === date && draft.day === day) {
      setSession(draft)
    } else {
      setSession(buildSession(date, day, sessions, rir.max))
    }
    // On ne reconstruit pas quand `sessions` change (refetch) pour ne pas écraser la saisie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, day])

  // Persistance du brouillon à chaque modification
  useEffect(() => {
    if (session) saveDraft(session)
  }, [session])

  const updateExercise = (i, ex) =>
    setSession((s) => ({ ...s, exercises: s.exercises.map((e, j) => (j === i ? ex : e)) }))

  const reset = () => {
    clearDraft()
    setSession(buildSession(date, day, sessions, rir.max))
  }

  const startRest = (seconds, label) => {
    if (!chrono.started) chrono.start()
    rest.start(seconds, label)
  }

  const save = async () => {
    setSaving(true)
    setNotice(null)
    const payload = { ...session, date, day, week, phase: phase.key }
    if (chrono.started) payload.duration_min = Math.max(1, Math.round(chrono.elapsedSec / 60))
    try {
      await onCommit(
        (d) => {
          d.sessions = d.sessions.filter((s) => !(s.date === date && s.day === day))
          d.sessions.push(payload)
          d.sessions.sort((a, b) => a.date.localeCompare(b.date))
          return d
        },
        `Séance ${date} - Jour ${day}`,
      )
      clearDraft()
      chrono.reset()
      rest.stop()
      setNotice({ ok: true, msg: `Séance ${formatDateFR(date)} commitée sur GitHub ✓` })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec de la sauvegarde : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  // Entre un changement de jour/date et la reconstruction par l'effet, `session`
  // correspond encore à l'ancien jour : on n'affiche rien pendant ce rendu.
  if (!session || session.day !== day || session.date !== date) return null

  return (
    <div className="screen">
      <PhaseBanner week={week} phase={phase} rir={rir} cycleStart={settings.cycleStart} />

      <div className="session-head">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="date-input" />
        <div className="chips">
          {DAY_KEYS.map((k) => (
            <button key={k} type="button" className={`chip ${day === k ? 'active' : ''}`} onClick={() => setDay(k)}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <SessionTimer {...chrono} onStart={chrono.start} onStop={chrono.stop} onReset={chrono.reset} />

      {alreadySaved && <div className="notice">Séance déjà enregistrée ce jour — la sauvegarde la remplacera.</div>}

      {session.exercises.map((ex, i) => (
        <ExerciseCard
          key={`${day}-${i}`}
          slot={DAYS[day].exercises[i]}
          exercise={ex}
          sessions={sessions}
          currentDate={date}
          rirTarget={rir.max}
          onChange={(next) => updateExercise(i, next)}
          onRest={startRest}
        />
      ))}

      {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}

      <div className="actions sticky">
        <RestTimer timer={rest.timer} remaining={rest.remaining} finished={rest.finished} onExtend={rest.extend} onStop={rest.stop} />
        <button type="button" className="btn secondary" onClick={reset} disabled={saving}>
          Réinitialiser
        </button>
        <button type="button" className="btn primary" onClick={save} disabled={saving}>
          {saving ? 'Commit en cours…' : 'Sauvegarder sur GitHub'}
        </button>
      </div>
    </div>
  )
}
