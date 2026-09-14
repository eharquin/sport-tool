# Muscu — suivi programme hypertrophie (full body 3x/semaine)

PWA mobile-first (Vite + React + Recharts) qui lit/écrit un `data.json` versionné
dans un repo GitHub via l'API REST. Aucun backend : le token GitHub reste dans le
localStorage du téléphone.

## Mise en route

1. **Repo de données** : crée un repo GitHub (privé conseillé), ex. `muscu-data`.
   Le fichier `data.json` sera créé automatiquement au premier commit depuis l'app
   (ou copie `data.example.json` dedans).
2. **Token** : GitHub → Settings → Developer settings → Fine-grained tokens →
   *Only select repositories* = `muscu-data`, permission **Contents: Read and write**.
3. **App** : `npm install && npm run dev`, ouvre l'onglet Réglages, renseigne
   owner / repo / token / date de début du cycle, « Tester la connexion », « Enregistrer ».
4. **Déploiement** : pousse ce repo sur GitHub, active Pages (Settings → Pages →
   Source : *GitHub Actions*). Le workflow `.github/workflows/deploy.yml` build et
   déploie à chaque push sur `main`. Sur le téléphone : ouvrir l'URL → « Ajouter à
   l'écran d'accueil ».

## Structure

```
src/
  config/program.js      # exercices par jour A/B/C, fourchettes, phases, RIR cible
  lib/github.js          # GET/PUT contents API, retry sur conflit de sha
  lib/cycle.js           # jour A/B/C, semaine du cycle, phase
  lib/stats.js           # dernière perf, conseil double progression, moyennes
  lib/warmup.js          # calcul des paliers d'échauffement
  lib/analysis.js        # e1RM ajusté RIR, détection de stagnation, volume hebdo / muscle
  lib/storage.js         # localStorage : réglages, cache data, brouillon
  hooks/useSettings.js, useData.js
  hooks/useRestTimer.js, useSessionTimer.js, useWakeLock.js  # chronos, écran maintenu allumé
  components/
    SessionForm.jsx      # écran Séance du jour
    ExerciseCard.jsx     # un exercice : variante, dernière perf, séries
    Stepper.jsx          # champ numérique gros boutons +/-
    WarmupPlan.jsx       # paliers d'échauffement calculés (% de la charge de travail)
    RestTimer.jsx        # compte à rebours de repos (+30 s / stop, bip à zéro)
    SessionTimer.jsx     # chrono global de la séance
    PhaseBanner.jsx      # semaine / phase / RIR cible
    ProgressCharts.jsx   # graphiques par exercice (e1RM, charge, reps)
    StagnationReport.jsx # bilan : exercices qui stagnent, signal de deload réactif
    MuscleVolume.jsx     # séries dures / muscle / semaine sur 4 semaines
    BodyweightScreen.jsx # poids corporel + moyenne mobile 7j + moyennes hebdo
    TokenConfig.jsx      # réglages / token
    Nav.jsx
```

## Modèle `data.json`

```json
{
  "sessions": [
    { "date": "2026-09-14", "day": "A", "week": 1, "phase": "reacclimatation",
      "exercises": [ { "name": "Tractions pronation",
        "sets": [ { "weight_added_kg": 0, "reps": 8, "rir": 3 } ] } ] }
  ],
  "bodyweight": [ { "date": "2026-09-14", "weight_kg": 68 } ]
}
```

Une séance porte aussi `duration_min` (durée totale) si le chrono de séance a été lancé.

Commits générés : `Séance {date} - Jour {A|B|C}` et `Poids {date} - {kg} kg`.

## Temps de repos

Définis par exercice dans `src/config/program.js` (`rest`, en secondes) : 2:30-3:00
sur les polyarticulaires lourds (squat/presse, RDL, dips et tractions lestés),
1:30-2:00 sur rowing/pompes/fentes, 1:00 sur l'isolation. Le bouton « ▶ Repos »
de chaque exercice lance le compte à rebours ; l'écran reste allumé pendant le
repos (Screen Wake Lock) et un bip + vibration signalent la fin.

## Échauffement

Profil par exercice (`warmup` dans `program.js`, paliers dans `WARMUPS`), calculé
depuis la charge saisie en série 1 :
- `heavyFirst` (squat/presse, RDL) : à vide ×10-15 → 40 % ×8 → 60 % ×5 → 80 % ×2-3
- `heavy` (dips/tractions lestés, rowing, fentes) : poids de corps ×8-10 → ~65 % ×4-5
- `isolation` : une série à 50 % ×10-12, optionnelle (à sauter si le muscle vient de travailler)
- `none` (gainage)

Les séries d'échauffement ne sont pas enregistrées dans `data.json`.

## Analyses (écran Progression)

- **e1RM** : 1RM estimé par Epley, `charge × (1 + (reps + RIR) / 30)`. Pour les
  exercices lestés, la charge totale inclut le poids de corps (dernière pesée
  connue) et la courbe affiche l'équivalent en lest. Non calculé pour les élastiques.
- **Stagnation** : un exercice stagne quand ses 3 dernières séances (hors deload)
  n'ont pas battu son meilleur e1RM d'au moins 1 kg (lestés) ou 1 % (autres).
  Badge rouge sur l'exercice dans l'écran Séance ; si ≥ 50 % des exercices suivis
  stagnent (min. 3), l'app suggère un deload — le deload est donc réactif, pas
  seulement planifié en semaine 7.
- **Volume par muscle** : `EXERCISE_MUSCLES` dans `program.js` attribue à chaque
  exercice ses muscles (1 = direct, 0.5 = indirect). Tableau des séries dures par
  semaine sur 4 semaines, zone cible 10-20, sous 6 = maintien.
