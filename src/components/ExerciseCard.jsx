import Stepper from './Stepper.jsx'
import { formatDateFR } from '../lib/cycle.js'
import { formatSets, lastPerformance, progressionHint } from '../lib/stats.js'
import { fmtClock } from '../lib/time.js'

/**
 * Un exercice de la séance : choix de variante, dernière perf + conseil de
 * progression, et une ligne de steppers par série.
 */
export default function ExerciseCard({ slot, exercise, sessions, currentDate, rirTarget, onChange, onRest }) {
  const unit = slot.unit ? slot.unit : ''
  const last = lastPerformance(sessions, exercise.name, currentDate)
  const hint = progressionHint(last, slot.reps)

  const updateSet = (i, patch) =>
    onChange({ ...exercise, sets: exercise.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) })

  const addSet = () => {
    const prev = exercise.sets[exercise.sets.length - 1] ?? { weight_added_kg: 0, reps: slot.reps[0], rir: rirTarget }
    onChange({ ...exercise, sets: [...exercise.sets, { ...prev }] })
  }

  const removeSet = () => {
    if (exercise.sets.length <= 1) return
    onChange({ ...exercise, sets: exercise.sets.slice(0, -1) })
  }

  const rename = (name) => onChange({ ...exercise, name })

  return (
    <section className="card exercise">
      <header className="exercise-head">
        {slot.options.length > 1 ? (
          <div className="chips">
            {slot.options.map((o) => (
              <button
                key={o}
                type="button"
                className={`chip ${exercise.name === o ? 'active' : ''}`}
                onClick={() => rename(o)}
              >
                {o}
              </button>
            ))}
          </div>
        ) : (
          <h3>{exercise.name}</h3>
        )}
        <span className="target">
          {slot.sets[0]}
          {slot.sets[1] !== slot.sets[0] && `-${slot.sets[1]}`}×{slot.reps[0]}-{slot.reps[1]}
          {unit}
          {slot.perSide && '/côté'}
          <span className="rest-hint"> · repos {fmtClock(slot.rest)}</span>
        </span>
      </header>

      <div className="last-perf">
        {last ? (
          <>
            <span className="muted">Dernière ({formatDateFR(last.date)}) :</span> {formatSets(last.sets, unit)}
            <span className="muted"> @RIR {Math.round(last.sets.reduce((a, s) => a + s.rir, 0) / last.sets.length)}</span>
            {hint && <div className={`hint hint-${hint.kind}`}>{hint.text}</div>}
          </>
        ) : (
          <span className="muted">Première fois — pas d'historique</span>
        )}
      </div>

      <div className="sets">
        {exercise.sets.map((s, i) => (
          <div className="set-row" key={i}>
            <span className="set-num">{i + 1}</span>
            <Stepper
              label="Lest kg"
              value={s.weight_added_kg}
              step={slot.weightStep}
              decimals={slot.weightStep < 1 ? 2 : 1}
              max={500}
              onChange={(v) => updateSet(i, { weight_added_kg: v })}
            />
            <Stepper
              label={unit === 's' ? 'Secondes' : 'Reps'}
              value={s.reps}
              step={unit === 's' ? 5 : 1}
              max={unit === 's' ? 600 : 100}
              onChange={(v) => updateSet(i, { reps: v })}
            />
            <Stepper label="RIR" value={s.rir} step={1} min={0} max={6} onChange={(v) => updateSet(i, { rir: v })} />
          </div>
        ))}
      </div>

      <div className="set-actions">
        <button type="button" className="btn small rest-btn" onClick={() => onRest(slot.rest, exercise.name)}>
          ▶ Repos {fmtClock(slot.rest)}
        </button>
        <span className="spacer" />
        <button type="button" className="btn small secondary" onClick={removeSet} disabled={exercise.sets.length <= 1}>
          − série
        </button>
        <button type="button" className="btn small secondary" onClick={addSet}>
          + série
        </button>
      </div>
    </section>
  )
}
