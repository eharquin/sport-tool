// Programme full body 3x/semaine (hypertrophie), 12 semaines.
// `options` = variantes possibles pour un même créneau ; le nom choisi est celui
// enregistré dans data.json (la progression est suivie par nom).
// `rest` = repos conseillé en secondes : 150-180 s sur les polyarticulaires lourds
// (squat, RDL, dips/tractions lestés), 90-120 s sur les polyarticulaires légers,
// 60 s sur l'isolation pour tenir la séance dans l'heure.
// `warmup` = profil d'échauffement (voir WARMUPS), `load` = 'total' (charge sur
// la barre/machine) ou 'added' (lest ajouté au poids de corps) — sert au libellé.

export const DAYS = {
  A: {
    label: 'Jour A',
    weekday: 1, // lundi
    exercises: [
      { options: ['Squat', 'Presse à cuisses'], sets: [3, 4], reps: [6, 10], weightStep: 2.5, rest: 180, warmup: 'heavyFirst', load: 'total' },
      { options: ['Dips lestés'], sets: [3, 4], reps: [6, 12], weightStep: 2.5, rest: 150, warmup: 'heavy', load: 'added' },
      { options: ['Tractions pronation'], sets: [3, 4], reps: [6, 12], weightStep: 2.5, rest: 150, warmup: 'heavy', load: 'added' },
      { options: ['Rowing barre', 'Rowing haltère'], sets: [3, 3], reps: [8, 15], weightStep: 2.5, rest: 120, warmup: 'heavy', load: 'total' },
      { options: ['Pompes lestées', 'Pompes déclinées'], sets: [2, 3], reps: [10, 20], weightStep: 2.5, rest: 90, warmup: 'isolation', load: 'added' },
      { options: ['Élévations latérales'], sets: [2, 3], reps: [12, 25], weightStep: 1, rest: 60, warmup: 'isolation', load: 'total' },
      { options: ['Cable crunch'], sets: [2, 3], reps: [10, 20], weightStep: 2.5, rest: 60, warmup: 'isolation', load: 'total' },
    ],
  },
  B: {
    label: 'Jour B',
    weekday: 3, // mercredi
    exercises: [
      { options: ['Soulevé de terre roumain'], sets: [3, 4], reps: [6, 10], weightStep: 2.5, rest: 180, warmup: 'heavyFirst', load: 'total' },
      { options: ['Chin-ups', 'Tractions supination'], sets: [3, 3], reps: [6, 12], weightStep: 2.5, rest: 150, warmup: 'heavy', load: 'added' },
      { options: ['Dips lestés', 'Pompes lestées'], sets: [3, 3], reps: [8, 15], weightStep: 2.5, rest: 120, warmup: 'heavy', load: 'added' },
      { options: ['Fentes', 'Presse unilatérale'], sets: [2, 3], reps: [8, 15], weightStep: 2.5, perSide: true, rest: 120, warmup: 'heavy', load: 'total' },
      { options: ['Élévations latérales'], sets: [2, 3], reps: [12, 25], weightStep: 1, rest: 60, warmup: 'isolation', load: 'total' },
      { options: ['Gainage'], sets: [2, 3], reps: [30, 90], weightStep: 2.5, unit: 's', rest: 60, warmup: 'none', load: 'added' },
    ],
  },
  C: {
    label: 'Jour C',
    weekday: 5, // vendredi
    exercises: [
      { options: ['Presse à cuisses', 'Squat variante'], sets: [3, 4], reps: [8, 12], weightStep: 2.5, rest: 180, warmup: 'heavyFirst', load: 'total' },
      { options: ['Pompes lestées', 'Pompes déclinées'], sets: [3, 3], reps: [8, 20], weightStep: 2.5, rest: 120, warmup: 'isolation', load: 'added' },
      { options: ['Tractions neutres', 'Rowing'], sets: [3, 3], reps: [8, 15], weightStep: 2.5, rest: 150, warmup: 'heavy', load: 'added' },
      { options: ['Leg curl'], sets: [2, 3], reps: [10, 15], weightStep: 2.5, rest: 90, warmup: 'isolation', load: 'total' },
      { options: ['Mollets'], sets: [3, 3], reps: [10, 20], weightStep: 2.5, rest: 60, warmup: 'isolation', load: 'total' },
      { options: ['Curl biceps'], sets: [2, 3], reps: [8, 15], weightStep: 1, rest: 60, warmup: 'isolation', load: 'total' },
      { options: ['Extension triceps'], sets: [2, 3], reps: [8, 15], weightStep: 1, rest: 60, warmup: 'isolation', load: 'total' },
    ],
  },
}

export const DAY_KEYS = ['A', 'B', 'C']

// Paliers d'échauffement en % de la charge de travail (1re série saisie).
// `rest` = valeur utilisée par le chrono, `restLabel` = fourchette affichée.
export const WARMUPS = {
  // Premier exercice lourd de la séance (squat, presse, RDL) : 4 paliers
  heavyFirst: {
    label: 'Premier exercice lourd',
    steps: [
      { pct: 0, reps: '10-15', rest: 40, restLabel: '30-45 s', label: 'À vide / très léger' },
      { pct: 0.4, reps: '8', rest: 50, restLabel: '45-60 s' },
      { pct: 0.6, reps: '5', rest: 75, restLabel: '1:00-1:30' },
      { pct: 0.8, reps: '2-3', rest: 105, restLabel: '1:30-2:00' },
    ],
  },
  // Lourds suivants (dips/tractions lestés, rowing, fentes) : corps déjà chaud, 2 paliers
  heavy: {
    label: 'Exercice lourd (corps déjà chaud)',
    steps: [
      { pct: 0, reps: '8-10', rest: 60, restLabel: '~1:00' },
      { pct: 0.65, reps: '4-5', rest: 60, restLabel: '~1:00' },
    ],
  },
  // Isolation : une série légère optionnelle, à sauter si le muscle vient d'être sollicité
  isolation: {
    label: 'Isolation — optionnel',
    note: 'À sauter si le muscle vient de travailler (ex. curl après rowing, triceps après dips).',
    steps: [{ pct: 0.5, reps: '10-12', rest: 45, restLabel: '~45 s', optional: true }],
  },
  none: { label: '', steps: [] },
}

// Périodisation sur 12 semaines. `rir` = [min, max] cible.
export const PHASES = [
  { key: 'reacclimatation', label: 'Réacclimatation', weeks: [1, 2], rir: [3, 4] },
  { key: 'accumulation1', label: 'Accumulation 1', weeks: [3, 6], rir: [2, 3] },
  { key: 'deload1', label: 'Deload (optionnel)', weeks: [7, 7], rir: [4, 5] },
  { key: 'accumulation2', label: 'Accumulation 2', weeks: [8, 11], rir: [1, 2] },
  { key: 'deload2', label: 'Deload / bilan', weeks: [12, 12], rir: [4, 5] },
]

export const CYCLE_WEEKS = 12

// RIR cible affiné par semaine (accumulation 1 : ~3 puis ~2).
export function targetRir(week) {
  if (week <= 2) return { min: 3, max: 4, label: '3-4' }
  if (week <= 4) return { min: 3, max: 3, label: '~3' }
  if (week <= 6) return { min: 2, max: 2, label: '~2' }
  if (week === 7) return { min: 4, max: 5, label: '4-5' }
  if (week <= 11) return { min: 1, max: 2, label: '1-2' }
  return { min: 4, max: 5, label: '4-5' }
}

export function phaseForWeek(week) {
  const w = Math.min(Math.max(week, 1), CYCLE_WEEKS)
  return PHASES.find((p) => w >= p.weeks[0] && w <= p.weeks[1])
}
