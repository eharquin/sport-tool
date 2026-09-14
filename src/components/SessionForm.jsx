import { useEffect, useMemo, useRef, useState } from 'react'
import { DAY_KEYS, HOME_NOTE, LOCATIONS, slotsFor } from '../config/program.js'
import { cycleInfo, dayForDate, formatDateFR, todayISO } from '../lib/cycle.js'
import { lastPerformance, sessionLocation, sortedSessions } from '../lib/stats.js'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage.js'
import { rirCalibration, stagnationReport } from '../lib/analysis.js'
import { upsertSession } from '../lib/ops.js'
import { useRestTimer } from '../hooks/useRestTimer.js'
import { useSessionTimer } from '../hooks/useSessionTimer.js'
import { useWakeLock } from '../hooks/useWakeLock.js'
import ExerciseCard from './ExerciseCard.jsx'
import PhaseBanner from './PhaseBanner.jsx'
import RestTimer from './RestTimer.jsx'
import SessionTimer from './SessionTimer.jsx'

/** RIR pré-rempli : celui de la variante maison si défini, sinon la cible de la phase. */
function slotRir(slot, phaseRir) {
  return slot.rir ? slot.rir[1] : phaseRir
}

/** Construit une séance pré-remplie à partir du programme + dernières perfs du même lieu. */
function buildSession(date, day, location, sessions, phaseRir) {
  const existing = sessions.find((s) => s.date === date && s.day === day && sessionLocation(s) === location)
  if (existing) return { ...structuredClone(existing), location }

  const exercises = slotsFor(day, location).map((slot) => {
    const rirTarget = slotRir(slot, phaseRir)
    // Variante la plus récemment utilisée parmi les options du créneau
    let name = slot.options[0]
    let latest = null
    for (const opt of slot.options) {
      const last = lastPerformance(sessions, opt, date, location)
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

  return { date, day, location, exercises }
}

export default function SessionForm({ data, settings, onCommit, edit }) {
  const [date, setDate] = useState(() => edit?.date ?? todayISO())
  const [day, setDay] = useState(() => edit?.day ?? dayForDate(todayISO()))
  const [location, setLocation] = useState(() => edit?.location ?? loadDraft()?.location ?? 'gym')

  // Demande de modification d'une séance passée (depuis l'écran Séances)
  useEffect(() => {
    if (!edit) return
    setDate(edit.date)
    setDay(edit.day)
    setLocation(edit.location)
  }, [edit])
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
  const slots = useMemo(() => slotsFor(day, location), [day, location])
  const report = useMemo(() => stagnationReport(sessions, data.bodyweight, location), [sessions, data.bodyweight, location])
  const cal = useMemo(() => rirCalibration(sessions), [sessions])

  // Vrai dès que l'utilisateur a modifié quelque chose : on ne reconstruit plus la séance.
  const dirty = useRef(false)

  // Chargement du brouillon (si même date/jour/lieu) ou construction d'une séance neuve
  useEffect(() => {
    const draft = loadDraft()
    if (draft && draft.date === date && draft.day === day && (draft.location ?? 'gym') === location) {
      dirty.current = true
      setSession(draft)
    } else {
      dirty.current = false
      setSession(buildSession(date, day, location, sessions, rir.max))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, day, location])

  // Données GitHub arrivées après le premier rendu (installation neuve, refetch) :
  // on reconstruit le pré-remplissage tant que rien n'a été saisi.
  useEffect(() => {
    if (!dirty.current) setSession(buildSession(date, day, location, sessions, rir.max))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions])

  // Persistance du brouillon à chaque modification (seulement après une saisie)
  useEffect(() => {
    if (session && dirty.current) saveDraft(session)
  }, [session])

  const updateNotes = (notes) => {
    dirty.current = true
    setSession((s) => ({ ...s, notes }))
  }

  const updateExercise = (i, ex) => {
    dirty.current = true
    setSession((s) => ({ ...s, exercises: s.exercises.map((e, j) => (j === i ? ex : e)) }))
  }

  const reset = () => {
    clearDraft()
    dirty.current = false
    setSession(buildSession(date, day, location, sessions, rir.max))
  }

  const startRest = (seconds, label) => {
    if (!chrono.started) chrono.start()
    rest.start(seconds, label)
  }

  const save = async () => {
    setSaving(true)
    setNotice(null)
    // `done` (coche de séance en cours) reste dans le brouillon, pas dans data.json
    const exercises = session.exercises.map((ex) => ({ ...ex, sets: ex.sets.map(({ done: _done, ...set }) => set) }))
    const payload = { ...session, exercises, date, day, location, week, phase: phase.key }
    if (!payload.notes?.trim()) delete payload.notes
    else payload.notes = payload.notes.trim()
    if (chrono.started) payload.duration_min = Math.max(1, Math.round(chrono.elapsedSec / 60))
    try {
      const { queued } = await onCommit(upsertSession(payload), `Séance ${date} - Jour ${day}${location === 'home' ? ' (maison)' : ''}`)
      clearDraft()
      chrono.reset()
      rest.stop()
      setNotice(
        queued
          ? { ok: true, msg: `Hors-ligne : séance ${formatDateFR(date)} enregistrée, elle sera commitée au retour du réseau.` }
          : { ok: true, msg: `Séance ${formatDateFR(date)} commitée sur GitHub ✓` },
      )
    } catch (e) {
      setNotice({ ok: false, msg: `Échec de la sauvegarde : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  // Entre un changement de jour/date et la reconstruction par l'effet, `session`
  // correspond encore à l'ancien jour : on n'affiche rien pendant ce rendu.
  if (!session || session.day !== day || session.date !== date || (session.location ?? 'gym') !== location) return null

  return (
    <div className="screen">
      <PhaseBanner week={week} phase={phase} rir={rir} cycleStart={settings.cycleStart} location={location} />

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

      <div className="segmented" role="group" aria-label="Lieu">
        {Object.entries(LOCATIONS).map(([k, l]) => (
          <button key={k} type="button" className={`seg ${location === k ? 'active' : ''}`} onClick={() => setLocation(k)}>
            {l.icon} {l.label}
          </button>
        ))}
      </div>
      {location === 'home' && <div className="notice home-note">{HOME_NOTE}</div>}

      <SessionTimer {...chrono} onStart={chrono.start} onStop={chrono.stop} onReset={chrono.reset} />

      {report.suggestDeload && (
        <div className="notice error">
          {report.stagnant.length}/{report.items.length} exercices stagnent → deload conseillé cette semaine (RIR 4-5, volume ÷ 2).
        </div>
      )}

      {cal.testDue && !session.exercises.some((ex) => ex.sets.some((x) => x.amrap)) && (
        <div className="notice">
          Calibration RIR : {cal.lastTest ? `dernier test il y a ${cal.daysSince} j` : 'aucun test'} → fais une dernière série
          AMRAP sur un exercice aujourd'hui (bouton « AMRAP »).
        </div>
      )}

      {alreadySaved && <div className="notice">Séance déjà enregistrée ce jour — la sauvegarde la remplacera.</div>}

      {session.exercises.map((ex, i) => (
        <ExerciseCard
          key={`${day}-${location}-${i}`}
          slot={slots[i]}
          exercise={ex}
          sessions={sessions}
          bodyweight={data.bodyweight}
          currentDate={date}
          location={location}
          rirTarget={slotRir(slots[i], rir.max)}
          onChange={(next) => updateExercise(i, next)}
          onRest={startRest}
        />
      ))}

      <section className="card">
        <label className="field">
          <span>Notes de séance (douleur, matériel, ressenti…)</span>
          <textarea
            className="notes"
            rows={2}
            value={session.notes ?? ''}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Ex. épaule gauche sensible sur les dips"
          />
        </label>
      </section>

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
