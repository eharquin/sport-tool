import { CYCLE_WEEKS, phaseForWeek, targetRir } from '../config/program.js'

export function todayISO() {
  return toISO(new Date())
}

export function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Lundi de la semaine contenant `d`
export function mondayOf(d) {
  const date = new Date(d)
  const dow = (date.getDay() + 6) % 7 // 0 = lundi
  date.setDate(date.getDate() - dow)
  date.setHours(0, 0, 0, 0)
  return date
}

// Jour du programme selon le jour de la semaine : lun/mar → A, mer/jeu → B, ven/sam/dim → C
export function dayForDate(iso) {
  const dow = parseISO(iso).getDay() // 0 = dimanche
  if (dow === 1 || dow === 2) return 'A'
  if (dow === 3 || dow === 4) return 'B'
  return 'C'
}

// Numéro de semaine dans le cycle (1..12) à partir de la date de début
export function weekForDate(iso, cycleStartISO) {
  if (!cycleStartISO) return 1
  const start = mondayOf(parseISO(cycleStartISO))
  const cur = mondayOf(parseISO(iso))
  const diff = Math.round((cur - start) / (7 * 24 * 3600 * 1000))
  return Math.min(Math.max(diff + 1, 1), CYCLE_WEEKS)
}

export function cycleInfo(iso, cycleStartISO) {
  const week = weekForDate(iso, cycleStartISO)
  return { week, phase: phaseForWeek(week), rir: targetRir(week) }
}

export function formatDateFR(iso) {
  return parseISO(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Nombre de jours entre aujourd'hui et `iso` (négatif si passé). */
export function daysUntil(iso) {
  if (!iso) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((parseISO(iso) - today) / 86400000)
}
