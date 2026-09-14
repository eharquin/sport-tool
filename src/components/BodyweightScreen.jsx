import { useMemo, useState } from 'react'
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDateFR, todayISO } from '../lib/cycle.js'
import { bodyweightSeries, weeklyAverages } from '../lib/stats.js'
import { bodyweightTrend, WEIGHT_GOALS } from '../lib/analysis.js'
import { deleteBodyweight, upsertBodyweight } from '../lib/ops.js'
import Stepper from './Stepper.jsx'

const AXIS = { fontSize: 11, fill: 'var(--text-2)' }

/** Écran Poids corporel : saisie du jour, courbe + moyenne mobile 7j, moyennes hebdo. */
export default function BodyweightScreen({ data, settings, onCommit }) {
  const series = useMemo(() => bodyweightSeries(data.bodyweight), [data.bodyweight])
  const goal = settings?.goal ?? 'bulk'
  const trend = useMemo(() => bodyweightTrend(data.bodyweight, goal), [data.bodyweight, goal])
  const weekly = useMemo(() => weeklyAverages(data.bodyweight), [data.bodyweight])
  const lastWeight = series.length ? series[series.length - 1].weight : 70

  const [date, setDate] = useState(todayISO)
  const [weight, setWeight] = useState(lastWeight)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const existing = data.bodyweight.find((b) => b.date === date)
  const recent = useMemo(() => [...data.bodyweight].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10), [data.bodyweight])
  const [confirmDate, setConfirmDate] = useState(null)

  const remove = async (d) => {
    setSaving(true)
    setNotice(null)
    try {
      const { queued } = await onCommit(deleteBodyweight(d), `Suppression poids ${d}`)
      setConfirmDate(null)
      setNotice({ ok: true, msg: `Pesée du ${formatDateFR(d)} supprimée${queued ? ' (hors-ligne, en attente)' : ' ✓'}` })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setNotice(null)
    try {
      const { queued } = await onCommit(upsertBodyweight({ date, weight_kg: weight }), `Poids ${date} - ${weight} kg`)
      setNotice({ ok: true, msg: `${weight} kg enregistré pour le ${formatDateFR(date)}${queued ? ' (hors-ligne, en attente)' : ' ✓'}` })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <h2>Poids corporel</h2>

      <section className="card">
        <div className="session-head">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="date-input" />
        </div>
        <Stepper label="Poids du jour" value={weight} onChange={setWeight} step={0.1} decimals={1} min={30} max={200} unit="kg" />
        {existing && <div className="notice">Déjà {existing.weight_kg} kg ce jour — sera remplacé.</div>}
        {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}
        <div className="actions">
          <button type="button" className="btn primary" onClick={save} disabled={saving}>
            {saving ? 'Commit en cours…' : 'Enregistrer'}
          </button>
        </div>
      </section>

      <section className="card">
        <h3>Tendance 4 semaines</h3>
        {trend.ok ? (
          <>
            <p className={`trend trend-${trend.status}`}>
              <strong>
                {trend.perWeek > 0 ? '+' : ''}
                {trend.perWeek} kg/sem
              </strong>{' '}
              ({trend.pctPerWeek > 0 ? '+' : ''}
              {trend.pctPerWeek} %/sem) —{' '}
              {trend.status === 'within' ? 'dans la cible' : trend.status === 'below' ? 'sous la cible' : 'au-dessus de la cible'}
            </p>
            <p className="muted small">
              Objectif {trend.goal.label} : {trend.goal.hint}. Régression sur {trend.n} pesées / {trend.spanDays} j, moyenne{' '}
              {trend.mean} kg.
              {trend.status === 'below' && goal === 'bulk' && ' → augmente légèrement les apports (+100-200 kcal/j).'}
              {trend.status === 'above' && goal === 'bulk' && ' → le surplus est trop grand, réduis un peu (−100-200 kcal/j).'}
              {trend.status === 'above' && goal === 'cut' && ' → déficit insuffisant.'}
              {trend.status === 'below' && goal === 'cut' && ' → perte trop rapide, risque de perte musculaire.'}
            </p>
          </>
        ) : (
          <p className="muted small">
            {trend.reason} Objectif actuel : {WEIGHT_GOALS[goal].label} ({WEIGHT_GOALS[goal].hint}) — modifiable dans Réglages.
          </p>
        )}
      </section>

      {series.length > 0 && (
        <section className="card">
          <h3>Évolution</h3>
          <p className="muted small">Points : pesées · Ligne : moyenne mobile 7 jours</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={series} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--grid)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => formatDateFR(d).replace(/^\w+\.? /, '')} tick={AXIS} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                labelFormatter={(d) => formatDateFR(d)}
                formatter={(v, k) => [`${v} kg`, k === 'ma7' ? 'Moy. 7j' : 'Pesée']}
              />
              <Scatter dataKey="weight" fill="var(--text-2)" isAnimationActive={false} />
              <Line type="monotone" dataKey="ma7" stroke="var(--series-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </section>
      )}

      {recent.length > 0 && (
        <section className="card">
          <h3>Dernières pesées</h3>
          <table className="table">
            <tbody>
              {recent.map((b) => (
                <tr key={b.date}>
                  <td>{formatDateFR(b.date)}</td>
                  <td className="num">{b.weight_kg} kg</td>
                  <td className="num">
                    {confirmDate === b.date ? (
                      <>
                        <button type="button" className="btn-link" onClick={() => setConfirmDate(null)} disabled={saving}>
                          annuler
                        </button>{' '}
                        <button type="button" className="btn-link danger-text" onClick={() => remove(b.date)} disabled={saving}>
                          confirmer
                        </button>
                      </>
                    ) : (
                      <button type="button" className="btn-link" onClick={() => setConfirmDate(b.date)} aria-label="Supprimer">
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {weekly.length > 0 && (
        <section className="card">
          <h3>Moyennes hebdomadaires</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Semaine du</th>
                <th>Moyenne</th>
                <th>Pesées</th>
                <th>Δ</th>
              </tr>
            </thead>
            <tbody>
              {weekly.map((w, i) => {
                const prev = weekly[i + 1]
                const delta = prev ? Math.round((w.avg - prev.avg) * 100) / 100 : null
                return (
                  <tr key={w.weekStart}>
                    <td>{formatDateFR(w.weekStart)}</td>
                    <td>
                      <strong>{w.avg} kg</strong>
                    </td>
                    <td>{w.count}</td>
                    <td className={delta > 0 ? 'up' : delta < 0 ? 'down' : ''}>
                      {delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
