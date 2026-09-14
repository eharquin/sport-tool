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
  lib/storage.js         # localStorage : réglages, cache data, brouillon
  hooks/useSettings.js, useData.js
  components/
    SessionForm.jsx      # écran Séance du jour
    ExerciseCard.jsx     # un exercice : variante, dernière perf, séries
    Stepper.jsx          # champ numérique gros boutons +/-
    PhaseBanner.jsx      # semaine / phase / RIR cible
    ProgressCharts.jsx   # graphiques par exercice
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

Commits générés : `Séance {date} - Jour {A|B|C}` et `Poids {date} - {kg} kg`.
