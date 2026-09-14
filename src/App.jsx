import { useState } from 'react'
import BodyweightScreen from './components/BodyweightScreen.jsx'
import Nav from './components/Nav.jsx'
import ProgressCharts from './components/ProgressCharts.jsx'
import SessionForm from './components/SessionForm.jsx'
import SessionList from './components/SessionList.jsx'
import TokenConfig from './components/TokenConfig.jsx'
import { useData } from './hooks/useData.js'
import { useSettings } from './hooks/useSettings.js'
import { daysUntil } from './lib/cycle.js'
import { isConfigured } from './lib/storage.js'

export default function App() {
  const [settings, updateSettings] = useSettings()
  const configured = isConfigured(settings)
  const [tab, setTab] = useState(configured ? 'session' : 'settings')
  const [edit, setEdit] = useState(null) // { date, day, location, key } — séance passée à modifier
  const { data, loading, error, lastSync, online, pending, refresh, commit } = useData(settings)

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Muscu</span>
        <button
          type="button"
          className={`sync ${pending.length ? 'pending' : ''} ${!online ? 'offline' : ''}`}
          onClick={refresh}
          disabled={loading || !configured}
          title="Synchroniser avec GitHub"
        >
          {!online
            ? `⚠ hors-ligne${pending.length ? ` · ${pending.length} en attente` : ''}`
            : pending.length
              ? `⟳ ${pending.length} en attente`
              : loading
                ? '⟳ sync…'
                : lastSync
                  ? `⟳ ${lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                  : '⟳'}
        </button>
      </header>

      {error && <div className="notice error global">GitHub : {error}</div>}
      <TokenExpiryNotice days={daysUntil(settings.tokenExpires)} onOpen={() => setTab('settings')} />

      <main>
        {tab === 'session' && (configured ? <SessionForm data={data} settings={settings} onCommit={commit} edit={edit} /> : <NeedConfig go={() => setTab('settings')} />)}
        {tab === 'history' && (
          <SessionList
            data={data}
            onCommit={commit}
            onEdit={(target) => {
              setEdit({ ...target, key: Date.now() })
              setTab('session')
            }}
          />
        )}
        {tab === 'progress' && <ProgressCharts data={data} />}
        {tab === 'bodyweight' && (configured ? <BodyweightScreen data={data} settings={settings} onCommit={commit} /> : <NeedConfig go={() => setTab('settings')} />)}
        {tab === 'settings' && <TokenConfig settings={settings} onChange={updateSettings} onSaved={() => setTab('session')} />}
      </main>

      <Nav current={tab} onChange={setTab} />
    </div>
  )
}

function TokenExpiryNotice({ days, onOpen }) {
  if (days === null || days > 7) return null
  const msg =
    days < 0
      ? `Le token GitHub a expiré il y a ${-days} j — les sauvegardes échoueront.`
      : days === 0
        ? 'Le token GitHub expire aujourd\'hui.'
        : `Le token GitHub expire dans ${days} j.`
  return (
    <div className={`notice global ${days <= 1 ? 'error' : ''}`}>
      {msg}{' '}
      <button type="button" className="btn-link" onClick={onOpen}>
        Régénérer et mettre à jour dans Réglages
      </button>
    </div>
  )
}

function NeedConfig({ go }) {
  return (
    <div className="screen">
      <div className="card">
        <p>Configure d'abord ton token GitHub et le repo de données.</p>
        <button type="button" className="btn primary" onClick={go}>
          Ouvrir les réglages
        </button>
      </div>
    </div>
  )
}
