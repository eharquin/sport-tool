// Calculs dérivés des données : dernière perf, indices de progression,
// moyennes mobiles / hebdomadaires.

import { mondayOf, parseISO, toISO } from './cycle.js'

export function sortedSessions(sessions) {
  return [...sessions].sort((a, b) => a.date.localeCompare(b.date))
}

/** Dernière séance (la plus récente) contenant l'exercice `name`, hors `excludeDate`. */
export function lastPerformance(sessions, name, excludeDate) {
  const list = sortedSessions(sessions).filter((s) => s.date !== excludeDate)
  for (let i = list.length - 1; i >= 0; i--) {
    const ex = list[i].exercises.find((e) => e.name === name)
    if (ex && ex.sets.length) return { date: list[i].date, sets: ex.sets }
  }
  return null
}

/** Historique complet d'un exercice, une entrée par séance. */
export function exerciseHistory(sessions, name) {
  return sortedSessions(sessions)
    .map((s) => {
      const ex = s.exercises.find((e) => e.name === name)
      if (!ex || !ex.sets.length) return null
      const weights = ex.sets.map((x) => x.weight_added_kg)
      const reps = ex.sets.map((x) => x.reps)
      return {
        date: s.date,
        week: s.week,
        maxWeight: Math.max(...weights),
        avgReps: Math.round((reps.reduce((a, b) => a + b, 0) / reps.length) * 10) / 10,
        totalReps: reps.reduce((a, b) => a + b, 0),
        volume: ex.sets.reduce((a, x) => a + x.weight_added_kg * x.reps, 0),
        avgRir: Math.round((ex.sets.reduce((a, x) => a + x.rir, 0) / ex.sets.length) * 10) / 10,
        sets: ex.sets,
      }
    })
    .filter(Boolean)
}

/** Noms de tous les exercices déjà enregistrés. */
export function allExerciseNames(sessions) {
  const names = new Set()
  sessions.forEach((s) => s.exercises.forEach((e) => names.add(e.name)))
  return [...names].sort((a, b) => a.localeCompare(b, 'fr'))
}

/**
 * Conseil de double progression : si toutes les séries de la dernière perf ont
 * atteint le haut de la fourchette → augmenter la charge, sinon viser plus de reps.
 */
export function progressionHint(last, repRange) {
  if (!last) return null
  const [, max] = repRange
  const allTop = last.sets.every((s) => s.reps >= max)
  const anyBelowMin = last.sets.some((s) => s.reps < repRange[0])
  if (allTop) return { kind: 'weight', text: `Toutes les séries à ${max}+ → monte la charge` }
  if (anyBelowMin) return { kind: 'hold', text: `Sous ${repRange[0]} reps → garde la charge, vise ${repRange[0]}` }
  return { kind: 'reps', text: `Vise plus de reps (objectif ${max})` }
}

export function formatSets(sets, unit = '') {
  return sets.map((s) => `${s.weight_added_kg > 0 ? `+${s.weight_added_kg}` : '0'}×${s.reps}${unit}`).join('  ')
}

/** Poids corporel trié + moyenne mobile glissante sur 7 jours calendaires. */
export function bodyweightSeries(entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.map((e, i) => {
    const limit = parseISO(e.date)
    limit.setDate(limit.getDate() - 6)
    const window = sorted.slice(0, i + 1).filter((x) => parseISO(x.date) >= limit)
    const ma = window.reduce((a, x) => a + x.weight_kg, 0) / window.length
    return { date: e.date, weight: e.weight_kg, ma7: Math.round(ma * 100) / 100 }
  })
}

/** Moyenne par semaine (lundi → dimanche), la plus récente en premier. */
export function weeklyAverages(entries) {
  const groups = new Map()
  entries.forEach((e) => {
    const key = toISO(mondayOf(parseISO(e.date)))
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(e.weight_kg)
  })
  return [...groups.entries()]
    .map(([weekStart, ws]) => ({
      weekStart,
      avg: Math.round((ws.reduce((a, b) => a + b, 0) / ws.length) * 100) / 100,
      count: ws.length,
    }))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
}
