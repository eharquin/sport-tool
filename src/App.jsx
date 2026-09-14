import { useState } from 'react'
import BodyweightScreen from './components/BodyweightScreen.jsx'
import Nav from './components/Nav.jsx'
import ProgressCharts from './components/ProgressCharts.jsx'
import SessionForm from './components/SessionForm.jsx'
import TokenConfig from './components/TokenConfig.jsx'
import { useData } from './hooks/useData.js'
import { useSettings } from './hooks/useSettings.js'
import { isConfigured } from './lib/storage.js'

export default function App() {
  const [settings, updateSettings] = useSettings()
  const configured = isConfigured(settings)
  const [tab, setTab] = useState(configured ? 'session' : 'settings')
  const { data, loading, error, lastSync, refresh, commit } = useData(settings)

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Muscu</span>
        <button type="button" className="sync" onClick={refresh} disabled={loading || !configured} title="Recharger depuis GitHub">
          {loading ? '⟳ sync…' : lastSync ? `⟳ ${lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : '⟳'}
        </button>
      </header>

      {error && <div className="notice error global">GitHub : {error}</div>}

      <main>
        {tab === 'session' && (configured ? <SessionForm data={data} settings={settings} onCommit={commit} /> : <NeedConfig go={() => setTab('settings')} />)}
        {tab === 'progress' && <ProgressCharts data={data} />}
        {tab === 'bodyweight' && (configured ? <BodyweightScreen data={data} onCommit={commit} /> : <NeedConfig go={() => setTab('settings')} />)}
        {tab === 'settings' && <TokenConfig settings={settings} onChange={updateSettings} onSaved={() => setTab('session')} />}
      </main>

      <Nav current={tab} onChange={setTab} />
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
