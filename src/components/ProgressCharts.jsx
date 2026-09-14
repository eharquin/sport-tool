import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDateFR } from '../lib/cycle.js'
import { allExerciseNames, exerciseHistory, formatSets } from '../lib/stats.js'

const AXIS = { fontSize: 11, fill: 'var(--text-2)' }
const GRID = 'var(--grid)'

function MiniLineChart({ data, dataKey, label, unit = '', color = 'var(--series-1)' }) {
  return (
    <div className="chart">
      <h4>{label}</h4>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={(d) => formatDateFR(d).replace(/^\w+\.? /, '')} tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
            labelFormatter={(d) => formatDateFR(d)}
            formatter={(v) => [`${v}${unit}`, label]}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4, fill: color, strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Écran Progression : un exercice à la fois, charge max et reps moyennes par séance. */
export default function ProgressCharts({ data }) {
  const names = useMemo(() => allExerciseNames(data.sessions), [data.sessions])
  const [selected, setSelected] = useState('')
  const name = selected || names[0] || ''
  const history = useMemo(() => (name ? exerciseHistory(data.sessions, name) : []), [data.sessions, name])

  if (!names.length) {
    return (
      <div className="screen">
        <h2>Progression</h2>
        <p className="muted">Aucune séance enregistrée pour l'instant.</p>
      </div>
    )
  }

  return (
    <div className="screen">
      <h2>Progression</h2>
      <label className="field">
        <span>Exercice</span>
        <select value={name} onChange={(e) => setSelected(e.target.value)}>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <section className="card">
        <MiniLineChart data={history} dataKey="maxWeight" label="Lest max (kg)" unit=" kg" />
        <MiniLineChart data={history} dataKey="avgReps" label="Reps moyennes par série" color="var(--series-2)" />
        <MiniLineChart data={history} dataKey="volume" label="Volume (lest × reps)" unit=" kg" color="var(--series-3)" />
      </section>

      <section className="card">
        <h3>Historique</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>S.</th>
              <th>Séries</th>
              <th>RIR</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((h) => (
              <tr key={h.date}>
                <td>{formatDateFR(h.date)}</td>
                <td>{h.week}</td>
                <td className="mono">{formatSets(h.sets)}</td>
                <td>{h.avgRir}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
