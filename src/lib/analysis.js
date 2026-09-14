// Analyses dérivées : e1RM ajusté RIR, détection de stagnation, volume
// hebdomadaire par muscle. Tout est calculé depuis data.json, rien à saisir.

import { EXERCISE_MUSCLES, MUSCLES, PHASES, slotByName } from '../config/program.js'
import { mondayOf, parseISO, toISO } from './cycle.js'
import { byLocation, exerciseHistory, sessionLocation, sortedSessions } from './stats.js'

// ---------- e1RM ----------

/** Poids corporel connu à une date (dernière pesée ≤ date, sinon la première), ou null. */
export function bodyweightAt(entries, date) {
  if (!entries?.length) return null
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  let bw = null
  for (const e of sorted) {
    if (e.date <= date) bw = e.weight_kg
    else break
  }
  return bw ?? sorted[0].weight_kg
}

/**
 * 1RM estimé (Epley) ajusté par le RIR : les reps "en réserve" comptent comme
 * des reps réalisées. Pour les exercices lestés (`load: 'added'`), la charge
 * totale inclut le poids de corps et on retourne l'équivalent en lest
 * (e1RM total − poids de corps), comparable d'une séance à l'autre même si le
 * poids de corps bouge. Sans pesée connue, on estime sur le lest seul.
 * Peu fiable au-delà de ~12 reps effectives.
 */
export function e1rm(set, slot, bodyweight) {
  const effReps = set.reps + (set.rir ?? 0)
  const factor = 1 + effReps / 30
  if (slot?.load === 'added' && bodyweight) {
    return Math.round(((bodyweight + set.weight_added_kg) * factor - bodyweight) * 10) / 10
  }
  return Math.round(set.weight_added_kg * factor * 10) / 10
}

/** Historique d'un exercice enrichi du meilleur e1RM par séance. */
export function historyWithE1rm(sessions, name, bodyweightEntries) {
  const slot = slotByName(name)
  return exerciseHistory(sessions, name).map((h) => {
    const bw = bodyweightAt(bodyweightEntries, h.date)
    return { ...h, load: slot?.load ?? 'total', bestE1rm: Math.max(...h.sets.map((s) => e1rm(s, slot, bw))) }
  })
}

/**
 * Progrès minimal pour compter un nouveau record : 1 kg sur les exercices lestés
 * (le poids de corps fluctue de ±1 kg d'un jour à l'autre et entre dans le calcul),
 * sinon 1 % (au moins 0,1 kg).
 */
export function progressThreshold(best, load) {
  return load === 'added' ? 1 : Math.max(0.1, best * 0.01)
}

// ---------- Stagnation ----------

const DELOAD_PHASES = new Set(PHASES.filter((p) => p.key.startsWith('deload')).map((p) => p.key))
export const STAGNATION_SESSIONS = 3

/**
 * Un exercice stagne si ses `STAGNATION_SESSIONS` dernières séances (hors deload)
 * n'ont pas dépassé significativement (voir progressThreshold) le meilleur e1RM
 * atteint avant elles. Il faut au moins une
 * séance de référence en plus, donc 4 séances minimum.
 */
export function stagnation(history) {
  const rows = history.filter((h) => !DELOAD_PHASES.has(h.phase))
  if (rows.length < STAGNATION_SESSIONS + 1) return { stagnant: false, sessions: rows.length }
  let best = -Infinity
  let bestIdx = -1
  rows.forEach((h, i) => {
    if (bestIdx < 0 || h.bestE1rm >= best + progressThreshold(best, h.load)) {
      best = h.bestE1rm
      bestIdx = i
    }
  })
  const sinceBest = rows.length - 1 - bestIdx
  return { stagnant: sinceBest >= STAGNATION_SESSIONS, sinceBest, best, bestDate: rows[bestIdx].date, sessions: rows.length }
}

/**
 * Bilan de stagnation pour un lieu : liste des exercices avec assez d'historique,
 * ceux qui stagnent, et un signal de deload global si la moitié ou plus stagnent.
 */
export function stagnationReport(sessions, bodyweightEntries, location = 'gym') {
  const scoped = byLocation(sessions, location)
  const names = new Set()
  scoped.forEach((s) => s.exercises.forEach((e) => names.add(e.name)))
  const items = [...names]
    .map((name) => ({ name, ...stagnation(historyWithE1rm(scoped, name, bodyweightEntries)) }))
    .filter((it) => it.sessions >= STAGNATION_SESSIONS + 1)
  const stagnant = items.filter((it) => it.stagnant)
  const ratio = items.length ? stagnant.length / items.length : 0
  return { items, stagnant, ratio, suggestDeload: items.length >= 3 && ratio >= 0.5 }
}

// ---------- Volume hebdomadaire par muscle ----------

/**
 * Séries dures par muscle pour les `weeks` dernières semaines calendaires
 * (lundi → dimanche), tous lieux confondus. Une série compte pour la fraction
 * définie dans EXERCISE_MUSCLES.
 */
export function weeklyMuscleSets(sessions, weeks = 4, today = new Date()) {
  const lastMonday = mondayOf(today)
  const weekStarts = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(lastMonday)
    d.setDate(d.getDate() - 7 * (weeks - 1 - i))
    return toISO(d)
  })
  const idx = new Map(weekStarts.map((w, i) => [w, i]))
  const totals = Object.fromEntries(Object.keys(MUSCLES).map((m) => [m, Array(weeks).fill(0)]))
  const unknown = new Set()

  for (const s of sortedSessions(sessions)) {
    const wi = idx.get(toISO(mondayOf(parseISO(s.date))))
    if (wi === undefined) continue
    for (const ex of s.exercises) {
      const map = EXERCISE_MUSCLES[ex.name]
      if (!map) {
        unknown.add(ex.name)
        continue
      }
      for (const [muscle, frac] of Object.entries(map)) totals[muscle][wi] += ex.sets.length * frac
    }
  }

  return {
    weekStarts,
    rows: Object.entries(MUSCLES).map(([key, label]) => ({ key, label, perWeek: totals[key].map((v) => Math.round(v * 10) / 10) })),
    unknown: [...unknown],
    sessionsPerWeek: weekStarts.map((w) => sessions.filter((s) => toISO(mondayOf(parseISO(s.date))) === w).length),
  }
}

export { sessionLocation }
