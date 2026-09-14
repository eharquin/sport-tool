// Programme full body 3x/semaine (hypertrophie), 12 semaines.
// `options` = variantes possibles pour un même créneau ; le nom choisi est celui
// enregistré dans data.json (la progression est suivie par nom).
// `rest` = repos conseillé en secondes : 150-180 s sur les polyarticulaires lourds
// (squat, RDL, dips/tractions lestés), 90-120 s sur les polyarticulaires légers,
// 60 s sur l'isolation pour tenir la séance dans l'heure.
// `warmup` = profil d'échauffement (voir WARMUPS), `load` = 'total' (charge sur
// la barre/machine), 'added' (lest ajouté au poids de corps) ou 'band' (niveau
// d'élastique, sans unité) — sert au libellé du champ.
// `home_alternative` = variante maison du même créneau (chaise romaine, élastiques,
// sac à dos lesté) : charge plus limitée, compensée par un RIR plus bas (`rir`
// propre à la variante) et des reps plus hautes.

export const DAYS = {
  A: {
    label: 'Jour A',
    weekday: 1, // lundi
    exercises: [
      { options: ['Squat', 'Presse à cuisses'], sets: [3, 4], reps: [6, 10], weightStep: 2.5, rest: 180, warmup: 'heavyFirst', load: 'total',
        home_alternative: { options: ['Squat bulgare lesté (sac à dos)'], sets: [3, 3], reps: [10, 15], rir: [1, 1], perSide: true, load: 'added', warmup: 'heavy', rest: 120 } },
      { options: ['Dips lestés'], sets: [3, 4], reps: [6, 12], weightStep: 2.5, rest: 150, warmup: 'heavy', load: 'added',
        home_alternative: { options: ['Dips chaise romaine'], sets: [3, 4], reps: [8, 15], rir: [1, 2], load: 'added', warmup: 'heavy', rest: 120 } },
      { options: ['Tractions pronation'], sets: [3, 4], reps: [6, 12], weightStep: 2.5, rest: 150, warmup: 'heavy', load: 'added',
        home_alternative: { options: ['Tractions large (chaise romaine)'], sets: [3, 3], reps: [6, 12], rir: [1, 2], load: 'added', warmup: 'heavy', rest: 150 } },
      { options: ['Rowing barre', 'Rowing haltère'], sets: [3, 3], reps: [8, 15], weightStep: 2.5, rest: 120, warmup: 'heavy', load: 'total',
        home_alternative: { options: ['Rowing élastique'], sets: [3, 3], reps: [12, 20], rir: [1, 1], load: 'band', warmup: 'none', rest: 90 } },
      { options: ['Pompes lestées', 'Pompes déclinées'], sets: [2, 3], reps: [10, 20], weightStep: 2.5, rest: 90, warmup: 'isolation', load: 'added',
        home_alternative: { options: ['Pompes lestées', 'Pompes déclinées'], sets: [3, 3], reps: [10, 20], rir: [1, 2], load: 'added', warmup: 'isolation', rest: 90 } },
      { options: ['Élévations latérales'], sets: [2, 3], reps: [12, 25], weightStep: 1, rest: 60, warmup: 'isolation', load: 'total',
        home_alternative: { options: ['Élévations latérales élastique'], sets: [2, 3], reps: [15, 20], rir: [1, 1], load: 'band', warmup: 'none', rest: 60 } },
      { options: ['Cable crunch'], sets: [2, 3], reps: [10, 20], weightStep: 2.5, rest: 60, warmup: 'isolation', load: 'total',
        home_alternative: { options: ['Relevés de genoux (chaise romaine)'], sets: [2, 3], reps: [10, 30], rir: [1, 1], load: 'added', warmup: 'none', rest: 60, note: 'au max' } },
    ],
  },
  B: {
    label: 'Jour B',
    weekday: 3, // mercredi
    exercises: [
      { options: ['Soulevé de terre roumain'], sets: [3, 4], reps: [6, 10], weightStep: 2.5, rest: 180, warmup: 'heavyFirst', load: 'total',
        home_alternative: { options: ['RDL unilatéral lesté'], sets: [3, 3], reps: [10, 15], rir: [1, 2], perSide: true, load: 'added', warmup: 'heavy', rest: 120 } },
      { options: ['Chin-ups', 'Tractions supination'], sets: [3, 3], reps: [6, 12], weightStep: 2.5, rest: 150, warmup: 'heavy', load: 'added',
        home_alternative: { options: ['Tractions supination (chaise romaine)'], sets: [3, 3], reps: [6, 12], rir: [1, 2], load: 'added', warmup: 'heavy', rest: 150 } },
      { options: ['Dips lestés', 'Pompes lestées'], sets: [3, 3], reps: [8, 15], weightStep: 2.5, rest: 120, warmup: 'heavy', load: 'added',
        home_alternative: { options: ['Dips chaise romaine', 'Pompes lestées'], sets: [3, 3], reps: [10, 20], rir: [1, 2], load: 'added', warmup: 'heavy', rest: 120 } },
      { options: ['Fentes', 'Presse unilatérale'], sets: [2, 3], reps: [8, 15], weightStep: 2.5, perSide: true, rest: 120, warmup: 'heavy', load: 'total',
        home_alternative: { options: ['Fentes bulgares lestées'], sets: [2, 3], reps: [10, 15], rir: [1, 2], perSide: true, load: 'added', warmup: 'isolation', rest: 90 } },
      { options: ['Élévations latérales'], sets: [2, 3], reps: [12, 25], weightStep: 1, rest: 60, warmup: 'isolation', load: 'total',
        home_alternative: { options: ['Élévations latérales élastique'], sets: [2, 3], reps: [15, 20], rir: [1, 1], load: 'band', warmup: 'none', rest: 60 } },
      { options: ['Gainage'], sets: [2, 3], reps: [30, 90], weightStep: 2.5, unit: 's', rest: 60, warmup: 'none', load: 'added',
        home_alternative: { options: ['Gainage'], sets: [2, 3], reps: [30, 90], rir: [1, 3], unit: 's', load: 'added', warmup: 'none', rest: 60 } },
    ],
  },
  C: {
    label: 'Jour C',
    weekday: 5, // vendredi
    exercises: [
      { options: ['Presse à cuisses', 'Squat variante'], sets: [3, 4], reps: [8, 12], weightStep: 2.5, rest: 180, warmup: 'heavyFirst', load: 'total',
        home_alternative: { options: ['Squat bulgare (variante)'], sets: [3, 3], reps: [10, 15], rir: [1, 1], perSide: true, load: 'added', warmup: 'heavy', rest: 120 } },
      { options: ['Pompes lestées', 'Pompes déclinées'], sets: [3, 3], reps: [8, 20], weightStep: 2.5, rest: 120, warmup: 'isolation', load: 'added',
        home_alternative: { options: ['Pompes lestées', 'Pompes déclinées'], sets: [3, 3], reps: [10, 20], rir: [1, 2], load: 'added', warmup: 'isolation', rest: 90 } },
      { options: ['Tractions neutres', 'Rowing'], sets: [3, 3], reps: [8, 15], weightStep: 2.5, rest: 150, warmup: 'heavy', load: 'added',
        home_alternative: { options: ['Tractions neutres (chaise romaine)', 'Rowing élastique'], sets: [3, 3], reps: [8, 15], rir: [1, 2], load: 'added', warmup: 'heavy', rest: 150 } },
      { options: ['Leg curl'], sets: [2, 3], reps: [10, 15], weightStep: 2.5, rest: 90, warmup: 'isolation', load: 'total',
        home_alternative: { options: ['Leg curl élastique'], sets: [2, 3], reps: [15, 20], rir: [1, 1], load: 'band', warmup: 'none', rest: 60 } },
      { options: ['Mollets'], sets: [3, 3], reps: [10, 20], weightStep: 2.5, rest: 60, warmup: 'isolation', load: 'total',
        home_alternative: { options: ['Mollets unilatéraux sur marche (lestés)'], sets: [3, 3], reps: [15, 20], rir: [1, 1], perSide: true, load: 'added', warmup: 'isolation', rest: 60 } },
      { options: ['Curl biceps'], sets: [2, 3], reps: [8, 15], weightStep: 1, rest: 60, warmup: 'isolation', load: 'total',
        home_alternative: { options: ['Curl élastique'], sets: [2, 3], reps: [12, 20], rir: [1, 1], load: 'band', warmup: 'none', rest: 60 } },
      { options: ['Extension triceps'], sets: [2, 3], reps: [8, 15], weightStep: 1, rest: 60, warmup: 'isolation', load: 'total',
        home_alternative: { options: ['Extension triceps élastique'], sets: [2, 3], reps: [12, 20], rir: [1, 1], load: 'band', warmup: 'none', rest: 60 } },
    ],
  },
}

export const DAY_KEYS = ['A', 'B', 'C']

// Groupes musculaires suivis pour le volume hebdomadaire.
export const MUSCLES = {
  quads: 'Quadriceps',
  hamstrings: 'Ischios',
  glutes: 'Fessiers',
  calves: 'Mollets',
  chest: 'Pectoraux',
  back: 'Dos',
  side_delts: 'Deltoïdes lat.',
  biceps: 'Biceps',
  triceps: 'Triceps',
  core: 'Abdos / gainage',
}

// Contribution de chaque exercice (1 = série directe, 0.5 = travail indirect).
// Zone efficace usuelle : ~10-20 séries dures / muscle / semaine (voir VOLUME_ZONES).
export const EXERCISE_MUSCLES = {
  // Salle
  Squat: { quads: 1, glutes: 1 },
  'Presse à cuisses': { quads: 1, glutes: 0.5 },
  'Squat variante': { quads: 1, glutes: 1 },
  'Dips lestés': { chest: 1, triceps: 1 },
  'Tractions pronation': { back: 1, biceps: 0.5 },
  'Rowing barre': { back: 1, biceps: 0.5 },
  'Rowing haltère': { back: 1, biceps: 0.5 },
  Rowing: { back: 1, biceps: 0.5 },
  'Pompes lestées': { chest: 1, triceps: 0.5 },
  'Pompes déclinées': { chest: 1, triceps: 0.5 },
  'Élévations latérales': { side_delts: 1 },
  'Cable crunch': { core: 1 },
  'Soulevé de terre roumain': { hamstrings: 1, glutes: 1 },
  'Chin-ups': { back: 1, biceps: 1 },
  'Tractions supination': { back: 1, biceps: 1 },
  Fentes: { quads: 1, glutes: 1 },
  'Presse unilatérale': { quads: 1, glutes: 1 },
  Gainage: { core: 1 },
  'Tractions neutres': { back: 1, biceps: 0.5 },
  'Leg curl': { hamstrings: 1 },
  Mollets: { calves: 1 },
  'Curl biceps': { biceps: 1 },
  'Extension triceps': { triceps: 1 },
  // Maison
  'Squat bulgare lesté (sac à dos)': { quads: 1, glutes: 1 },
  'Squat bulgare (variante)': { quads: 1, glutes: 1 },
  'Fentes bulgares lestées': { quads: 1, glutes: 1 },
  'Dips chaise romaine': { chest: 1, triceps: 1 },
  'Tractions large (chaise romaine)': { back: 1, biceps: 0.5 },
  'Tractions supination (chaise romaine)': { back: 1, biceps: 1 },
  'Tractions neutres (chaise romaine)': { back: 1, biceps: 0.5 },
  'Rowing élastique': { back: 1, biceps: 0.5 },
  'Élévations latérales élastique': { side_delts: 1 },
  'Relevés de genoux (chaise romaine)': { core: 1 },
  'RDL unilatéral lesté': { hamstrings: 1, glutes: 1 },
  'Leg curl élastique': { hamstrings: 1 },
  'Mollets unilatéraux sur marche (lestés)': { calves: 1 },
  'Curl élastique': { biceps: 1 },
  'Extension triceps élastique': { triceps: 1 },
}

// Consigne technique affichée sous le nom de l'exercice. Accent sur l'amplitude
// complète et le travail en position étirée (hypertrophie supérieure à volume
// égal), avec partials en bas de course en fin de série sur les mouvements adaptés.
export const EXERCISE_CUES = {
  Squat: 'Profond, pause brève en bas, genoux dans l\'axe des pieds.',
  'Presse à cuisses': 'Amplitude max sans décoller le bas du dos ; ne verrouille pas en haut.',
  'Squat variante': 'Profond, pause brève en bas ; partials en bas de course quand tu bloques.',
  'Squat bulgare lesté (sac à dos)': 'Genou arrière vers le sol, buste un peu penché ; partials bas en fin de série.',
  'Squat bulgare (variante)': 'Grande amplitude, tempo lent à la descente ; partials bas en fin de série.',
  'Dips lestés': 'Descends jusqu\'à l\'étirement des pecs (épaule sous le coude), buste penché ; partials bas en fin de série.',
  'Dips chaise romaine': 'Descends jusqu\'à l\'étirement des pecs, buste penché ; partials bas en fin de série.',
  'Tractions pronation': 'Bras tendus en bas (étirement complet), poitrine vers la barre ; partials bas si tu bloques.',
  'Tractions large (chaise romaine)': 'Bras tendus en bas, coudes vers les hanches ; partials bas si tu bloques.',
  'Tractions neutres': 'Étirement complet en bas, poitrine vers la barre ; contrôle la descente.',
  'Tractions neutres (chaise romaine)': 'Étirement complet en bas, poitrine vers la barre ; contrôle la descente.',
  'Chin-ups': 'Bras tendus en bas, menton au-dessus de la barre ; descente lente.',
  'Tractions supination': 'Bras tendus en bas, menton au-dessus de la barre ; descente lente.',
  'Tractions supination (chaise romaine)': 'Bras tendus en bas, menton au-dessus de la barre ; descente lente.',
  'Rowing barre': 'Étire complètement en bas, tire vers le nombril, dos plat ; contrôle la descente.',
  'Rowing haltère': 'Laisse l\'omoplate s\'étirer en bas, tire vers la hanche ; contrôle la descente.',
  Rowing: 'Étirement complet en bas, tire vers le nombril ; contrôle la descente.',
  'Rowing élastique': 'Buste penché, laisse les bras s\'étirer vers l\'ancrage, tire vers le nombril, 1 s en contraction.',
  'Pompes lestées': 'Poitrine près du sol, coudes ~45°, gainage ; partials bas en fin de série.',
  'Pompes déclinées': 'Poitrine près du sol, coudes ~45°, gainage ; partials bas en fin de série.',
  'Élévations latérales': 'Légère inclinaison avant, monte à l\'horizontale, descente contrôlée, pas d\'élan.',
  'Élévations latérales élastique': 'Élastique sous le pied opposé pour tendre dès le bas ; monte à l\'horizontale, sans élan.',
  'Cable crunch': 'Enroule la colonne (pas les hanches), étire complètement en haut.',
  'Relevés de genoux (chaise romaine)': 'Bascule le bassin en haut, descente contrôlée, pas d\'élan.',
  'Soulevé de terre roumain': 'Hanches en arrière, dos plat, descends jusqu\'à l\'étirement max des ischios, barre le long des jambes.',
  'RDL unilatéral lesté': 'Hanches en arrière, dos plat, descends jusqu\'à l\'étirement max ; l\'autre main sur un appui pour l\'équilibre.',
  Fentes: 'Grand pas, genou arrière proche du sol, pousse dans le talon.',
  'Presse unilatérale': 'Amplitude complète, pousse dans le talon, genou dans l\'axe.',
  'Fentes bulgares lestées': 'Genou arrière proche du sol, buste un peu penché, pousse dans le talon.',
  Gainage: 'Bassin rétroversé, fessiers serrés ; augmente la durée ou passe aux variantes (bras tendus, pieds surélevés).',
  'Leg curl': 'Étire complètement en position tendue, 1 s de pause en contraction, descente lente.',
  'Leg curl élastique': 'Allongé, élastique ancré bas ; étirement complet, 1 s en contraction, descente lente.',
  Mollets: 'Descends jusqu\'à l\'étirement complet avec pause 1-2 s en bas ; monte sur la pointe.',
  'Mollets unilatéraux sur marche (lestés)': 'Talon bas au max avec pause 1-2 s ; monte sur la pointe ; appui léger pour l\'équilibre.',
  'Curl biceps': 'Coudes tendus en bas (étirement complet), pas d\'élan, descente contrôlée.',
  'Curl élastique': 'Coudes tendus en bas, épaules fixes, descente contrôlée.',
  'Extension triceps': 'Version overhead = triceps en position étirée ; coudes fixes, amplitude complète.',
  'Extension triceps élastique': 'Overhead ou nuque (triceps étiré), coudes fixes, amplitude complète.',
}

// Séries dures / muscle / semaine : bornes pour le code couleur.
export const VOLUME_ZONES = { low: 6, target: 10, high: 20 }

export const LOCATIONS = {
  gym: { label: 'Salle', icon: '🏋️' },
  home: { label: 'Maison', icon: '🏠' },
}

export const HOME_NOTE =
  'Mode maison : charge limitée (poids de corps, sac à dos, élastiques) → vise un RIR plus bas (0-1, 1-2 sur les gros mouvements) et des reps plus hautes (15-20+) pour garder un stimulus équivalent.'

/** Créneau (salle ou maison) qui contient l'exercice `name`, pour retrouver son type de charge. */
export function slotByName(name) {
  for (const day of DAY_KEYS) {
    for (const loc of ['gym', 'home']) {
      const found = slotsFor(day, loc).find((slot) => slot.options.includes(name))
      if (found) return found
    }
  }
  return null
}

/** Créneaux d'un jour pour un lieu donné, normalisés (la variante maison hérite des champs absents). */
export function slotsFor(day, location) {
  return DAYS[day].exercises.map((slot) => {
    if (location !== 'home' || !slot.home_alternative) return slot
    const { home_alternative, ...gym } = slot
    return { ...gym, ...home_alternative }
  })
}

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
