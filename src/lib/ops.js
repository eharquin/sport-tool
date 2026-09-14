// Opérations d'écriture sérialisables (pour la file d'attente hors-ligne).
// Chaque op est un objet JSON ; `applyOp` la rejoue sur une copie des données.

export function upsertSession(session) {
  return { type: 'upsertSession', session }
}

export function upsertBodyweight(entry) {
  return { type: 'upsertBodyweight', entry }
}

export function deleteSession(date, day) {
  return { type: 'deleteSession', date, day }
}

export function deleteBodyweight(date) {
  return { type: 'deleteBodyweight', date }
}

export function applyOp(data, op) {
  switch (op.type) {
    case 'upsertSession': {
      const { date, day } = op.session
      data.sessions = data.sessions.filter((s) => !(s.date === date && s.day === day))
      data.sessions.push(op.session)
      data.sessions.sort((a, b) => a.date.localeCompare(b.date))
      return data
    }
    case 'upsertBodyweight': {
      data.bodyweight = data.bodyweight.filter((b) => b.date !== op.entry.date)
      data.bodyweight.push(op.entry)
      data.bodyweight.sort((a, b) => a.date.localeCompare(b.date))
      return data
    }
    case 'deleteSession':
      data.sessions = data.sessions.filter((s) => !(s.date === op.date && s.day === op.day))
      return data
    case 'deleteBodyweight':
      data.bodyweight = data.bodyweight.filter((b) => b.date !== op.date)
      return data
    default:
      return data
  }
}

/** Rejoue une liste d'ops sur des données (clone). */
export function applyOps(data, ops) {
  return ops.reduce((d, item) => applyOp(d, item.op), structuredClone(data))
}

/** Erreur réseau (hors-ligne, DNS…) par opposition à une erreur renvoyée par GitHub. */
export function isNetworkError(e) {
  return e instanceof TypeError || (typeof navigator !== 'undefined' && navigator.onLine === false)
}
