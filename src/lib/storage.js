// Tout ce qui vit dans le localStorage : réglages (dont le token), cache des
// données et brouillon de séance en cours.

const KEYS = {
  settings: 'muscu.settings',
  cache: 'muscu.data-cache',
  draft: 'muscu.draft',
  pending: 'muscu.pending',
}

const DEFAULT_SETTINGS = {
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  path: 'data.json',
  cycleStart: '',
  goal: 'bulk', // 'bulk' | 'maintain' | 'cut' — cible de variation du poids corporel
  tokenExpires: '', // date d'expiration du PAT (saisie manuelle) pour l'alerte
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / navigation privée : on ignore */
  }
}

export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) })
export const saveSettings = (s) => write(KEYS.settings, s)

export const loadCache = () => read(KEYS.cache, null)
export const saveCache = (data) => write(KEYS.cache, data)

export const loadDraft = () => read(KEYS.draft, null)
export const saveDraft = (d) => write(KEYS.draft, d)
export const clearDraft = () => write(KEYS.draft, null)

// File d'attente des écritures non synchronisées : [{ id, op, message, createdAt }]
export const loadPending = () => read(KEYS.pending, [])
export const savePending = (list) => write(KEYS.pending, list.length ? list : null)

export function isConfigured(s) {
  return Boolean(s.token && s.owner && s.repo)
}
