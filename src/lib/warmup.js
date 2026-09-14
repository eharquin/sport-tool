import { WARMUPS } from '../config/program.js'

function roundTo(v, step) {
  return Math.round(v / step) * step
}

/**
 * Paliers d'échauffement concrets pour un exercice, à partir de la charge de la
 * 1re série de travail. Les paliers dont la charge calculée est identique au
 * précédent (ex. lest de travail trop faible) sont fusionnés.
 */
export function warmupPlan(slot, workingWeight) {
  const profile = WARMUPS[slot.warmup ?? 'none']
  if (!profile || !profile.steps.length) return null
  const stepKg = slot.weightStep ?? 2.5
  const rows = []
  for (const st of profile.steps) {
    const weight = st.pct === 0 ? 0 : roundTo(workingWeight * st.pct, stepKg)
    const prev = rows[rows.length - 1]
    if (prev && prev.weight === weight) continue
    if (st.pct > 0 && weight >= workingWeight) continue
    rows.push({
      weight,
      label:
        st.label ??
        (st.pct === 0
          ? slot.load === 'added'
            ? 'Poids de corps'
            : 'Barre légère'
          : slot.load === 'added'
            ? `+${weight} kg`
            : `${weight} kg`),
      reps: st.reps,
      rest: st.rest,
      restLabel: st.restLabel,
      optional: Boolean(st.optional),
    })
  }
  if (!rows.length) return null
  return { title: profile.label, note: profile.note, rows }
}
