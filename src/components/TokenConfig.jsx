import { useState } from 'react'
import { testConnection } from '../lib/github.js'
import { isConfigured } from '../lib/storage.js'
import { todayISO } from '../lib/cycle.js'

/** Écran de configuration : token GitHub, repo cible, date de début du cycle. */
export default function TokenConfig({ settings, onChange, onSaved }) {
  const [form, setForm] = useState(settings)
  const [status, setStatus] = useState(null)
  const [showToken, setShowToken] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = () => {
    onChange(form)
    setStatus({ ok: true, msg: 'Réglages enregistrés (token en localStorage uniquement).' })
    onSaved?.()
  }

  const test = async () => {
    setStatus({ msg: 'Test en cours…' })
    try {
      const r = await testConnection(form)
      const canWrite = r.permissions?.push
      setStatus({
        ok: canWrite,
        msg: canWrite ? `OK : accès en écriture à ${r.fullName}` : `Accès lecture seule à ${r.fullName} — vérifie le scope Contents: write`,
      })
    } catch (e) {
      setStatus({ ok: false, msg: `Échec : ${e.message}` })
    }
  }

  return (
    <div className="screen">
      <h2>Réglages</h2>

      <section className="card">
        <h3>Repo GitHub (données)</h3>
        <label className="field">
          <span>Owner</span>
          <input value={form.owner} onChange={set('owner')} placeholder="mon-user" autoCapitalize="none" />
        </label>
        <label className="field">
          <span>Repo</span>
          <input value={form.repo} onChange={set('repo')} placeholder="muscu-data" autoCapitalize="none" />
        </label>
        <div className="row-2">
          <label className="field">
            <span>Branche</span>
            <input value={form.branch} onChange={set('branch')} autoCapitalize="none" />
          </label>
          <label className="field">
            <span>Fichier</span>
            <input value={form.path} onChange={set('path')} autoCapitalize="none" />
          </label>
        </div>
      </section>

      <section className="card">
        <h3>Token GitHub</h3>
        <p className="muted">
          Fine-grained PAT, scope <code>Contents: read/write</code> limité à ce repo. Stocké uniquement dans ce
          navigateur.
        </p>
        <label className="field">
          <span>Personal Access Token</span>
          <input
            type={showToken ? 'text' : 'password'}
            value={form.token}
            onChange={set('token')}
            placeholder="github_pat_…"
            autoCapitalize="none"
            autoComplete="off"
          />
        </label>
        <button type="button" className="btn-link" onClick={() => setShowToken((s) => !s)}>
          {showToken ? 'Masquer' : 'Afficher'} le token
        </button>
      </section>

      <section className="card">
        <h3>Cycle de 12 semaines</h3>
        <label className="field">
          <span>Date de début (lundi de la semaine 1)</span>
          <input type="date" value={form.cycleStart} onChange={set('cycleStart')} />
        </label>
        <button type="button" className="btn-link" onClick={() => setForm((f) => ({ ...f, cycleStart: todayISO() }))}>
          Commencer cette semaine
        </button>
      </section>

      {status && <div className={`notice ${status.ok === false ? 'error' : status.ok ? 'ok' : ''}`}>{status.msg}</div>}

      <div className="actions">
        <button type="button" className="btn secondary" onClick={test} disabled={!isConfigured(form)}>
          Tester la connexion
        </button>
        <button type="button" className="btn primary" onClick={save}>
          Enregistrer
        </button>
      </div>
    </div>
  )
}
