import Stepper from './Stepper.jsx'
import WarmupPlan from './WarmupPlan.jsx'
import { formatDateFR } from '../lib/cycle.js'
import { formatSets, lastPerformance, progressionHint } from '../lib/stats.js'
import { fmtClock } from '../lib/time.js'
import { bodyweightAt, e1rm, historyWithE1rm, stagnation } from '../lib/analysis.js'
import { byLocation } from '../lib/stats.js'

/**
 * Un exercice de la séance : choix de variante, dernière perf + conseil de
 * progression, et une ligne de steppers par série.
 */
export default function ExerciseCard({ slot, exercise, sessions, bodyweight, currentDate, location, rirTarget, onChange, onRest }) {
  const unit = slot.unit ? slot.unit : ''
  const last = lastPerformance(sessions, exercise.name, currentDate, location)
  const hint = progressionHint(last, slot.reps)
  const isBand = slot.load === 'band'
  const lastE1rm = last && !isBand ? Math.max(...last.sets.map((x) => e1rm(x, slot, bodyweightAt(bodyweight, last.date)))) : null
  const stag = stagnation(
    historyWithE1rm(
      byLocation(sessions, location).filter((x) => x.date !== currentDate),
      exercise.name,
      bodyweight,
    ),
  )

  // Modifier la charge de la série 1 entraîne les séries suivantes qui avaient
  // encore la même charge (évite de répéter les clics sur chaque série).
  const updateSet = (i, patch) => {
    const before = exercise.sets[i].weight_added_kg
    const propagate = i === 0 && 'weight_added_kg' in patch
    onChange({
      ...exercise,
      sets: exercise.sets.map((s, j) => {
        if (j === i) return { ...s, ...patch }
        if (propagate && j > i && s.weight_added_kg === before) return { ...s, weight_added_kg: patch.weight_added_kg }
        return s
      }),
    })
  }

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
          {slot.note && ` (${slot.note})`}
          {slot.rir && ` · RIR ${slot.rir[0] === slot.rir[1] ? slot.rir[0] : `${slot.rir[0]}-${slot.rir[1]}`}`}
          <span className="rest-hint"> · repos {fmtClock(slot.rest)}</span>
        </span>
      </header>

      <div className="last-perf">
        {last ? (
          <>
            <span className="muted">Dernière ({formatDateFR(last.date)}) :</span> {formatSets(last.sets, unit, slot.load)}
            <span className="muted"> @RIR {Math.round(last.sets.reduce((a, s) => a + s.rir, 0) / last.sets.length)}</span>
            {lastE1rm !== null && <span className="muted"> · e1RM {lastE1rm}</span>}
            {stag.stagnant ? (
              <div className="hint hint-stagnant">
                Stagne : {stag.sinceBest} séances sans battre l'e1RM de {stag.best} kg → change de variante ou allège
                cet exercice
              </div>
            ) : (
              hint && <div className={`hint hint-${hint.kind}`}>{hint.text}</div>
            )}
          </>
        ) : (
          <span className="muted">Première fois — pas d'historique</span>
        )}
      </div>

      {slot.load !== 'band' && <WarmupPlan slot={slot} workingWeight={exercise.sets[0]?.weight_added_kg ?? 0} onRest={onRest} exerciseName={exercise.name} />}

      <div className="sets">
        {exercise.sets.map((s, i) => (
          <div className="set-row" key={i}>
            <span className="set-num">{i + 1}</span>
            <Stepper
              label={slot.load === 'band' ? 'Élastique niv.' : slot.load === 'added' ? 'Lest kg' : 'Charge kg'}
              value={s.weight_added_kg}
              step={slot.load === 'band' ? 1 : slot.weightStep}
              decimals={slot.load === 'band' ? 0 : slot.weightStep < 1 ? 2 : 1}
              max={slot.load === 'band' ? 20 : 500}
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
