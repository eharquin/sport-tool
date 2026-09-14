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

// ---------- Calibration du RIR (séries AMRAP) ----------

export const RIR_TEST_INTERVAL_DAYS = 21

/**
 * Pour chaque série AMRAP (jusqu'à l'échec) précédée d'une série à la même charge :
 * reps attendues = reps + RIR de la série précédente ; biais = reps réelles − attendues.
 * Biais positif = tu avais plus de reps en réserve que tu ne le pensais (RIR sous-estimé).
 * La fatigue entre les deux séries rend la mesure légèrement conservatrice.
 */
export function rirCalibration(sessions) {
  const tests = []
  for (const s of sortedSessions(sessions)) {
    for (const ex of s.exercises) {
      ex.sets.forEach((set, i) => {
        if (!set.amrap || i === 0) return
        const prev = ex.sets[i - 1]
        if (prev.amrap || prev.weight_added_kg !== set.weight_added_kg) return
        const expected = prev.reps + prev.rir
        tests.push({ date: s.date, name: ex.name, expected, actual: set.reps, bias: set.reps - expected })
      })
    }
  }
  const avg = (arr) => (arr.length ? Math.round((arr.reduce((a, t) => a + t.bias, 0) / arr.length) * 10) / 10 : null)
  const byExercise = {}
  tests.forEach((t) => (byExercise[t.name] ??= []).push(t))
  const lastTest = tests.length ? tests[tests.length - 1].date : null
  const daysSince = lastTest ? Math.floor((Date.now() - parseISO(lastTest).getTime()) / 86400000) : null
  return {
    tests,
    bias: avg(tests),
    perExercise: Object.entries(byExercise).map(([name, arr]) => ({ name, n: arr.length, bias: avg(arr) })),
    lastTest,
    daysSince,
    testDue: sessions.length >= 4 && (daysSince === null || daysSince >= RIR_TEST_INTERVAL_DAYS),
  }
}

// ---------- Tendance du poids corporel ----------

// Variation hebdomadaire cible en % du poids de corps selon l'objectif.
export const WEIGHT_GOALS = {
  bulk: { label: 'Prise de masse', range: [0.25, 0.5], hint: '+0,25 à +0,5 %/sem limite le gain de gras' },
  maintain: { label: 'Maintien', range: [-0.15, 0.15], hint: 'stable à ±0,15 %/sem' },
  cut: { label: 'Sèche', range: [-1, -0.5], hint: '−0,5 à −1 %/sem préserve le muscle' },
}

/**
 * Pente du poids (régression linéaire sur les pesées des `days` derniers jours).
 * Nécessite ≥ 4 pesées réparties sur ≥ 14 jours. Retourne kg/semaine, %/semaine
 * et la position par rapport à la zone cible de l'objectif.
 */
export function bodyweightTrend(entries, goal = 'bulk', days = 28, today = new Date()) {
  const limit = new Date(today)
  limit.setDate(limit.getDate() - days)
  const pts = [...entries]
    .filter((e) => parseISO(e.date) >= limit)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ x: parseISO(e.date).getTime() / 86400000, y: e.weight_kg }))
  if (pts.length < 4) return { ok: false, reason: 'Il faut au moins 4 pesées sur les 4 dernières semaines.' }
  const span = pts[pts.length - 1].x - pts[0].x
  if (span < 14) return { ok: false, reason: 'Il faut des pesées réparties sur au moins 2 semaines.' }
  const n = pts.length
  const mx = pts.reduce((a, p) => a + p.x, 0) / n
  const my = pts.reduce((a, p) => a + p.y, 0) / n
  const slope = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / pts.reduce((a, p) => a + (p.x - mx) ** 2, 0)
  const perWeek = slope * 7
  const pctPerWeek = (perWeek / my) * 100
  const [lo, hi] = WEIGHT_GOALS[goal].range
  const status = pctPerWeek < lo ? 'below' : pctPerWeek > hi ? 'above' : 'within'
  return {
    ok: true,
    n,
    spanDays: Math.round(span),
    perWeek: Math.round(perWeek * 100) / 100,
    pctPerWeek: Math.round(pctPerWeek * 100) / 100,
    mean: Math.round(my * 10) / 10,
    status,
    goal: WEIGHT_GOALS[goal],
  }
}

export { sessionLocation }
