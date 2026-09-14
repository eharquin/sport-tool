import { useState } from 'react'

/**
 * Champ numérique avec gros boutons +/-. Un appui sur la valeur ouvre la
 * saisie clavier (inputmode numérique) pour les grosses variations.
 */
export default function Stepper({ label, value, onChange, step = 1, min = 0, max = 999, unit = '', decimals = 0 }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  const clamp = (v) => Math.min(max, Math.max(min, v))
  const round = (v) => Number(v.toFixed(decimals))
  const bump = (delta) => onChange(round(clamp(value + delta)))

  const commitText = () => {
    const parsed = parseFloat(text.replace(',', '.'))
    if (!Number.isNaN(parsed)) onChange(round(clamp(parsed)))
    setEditing(false)
  }

  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-row">
        <button type="button" className="stepper-btn" onClick={() => bump(-step)} aria-label={`${label} moins`}>
          −
        </button>
        {editing ? (
          <input
            className="stepper-input"
            type="text"
            inputMode="decimal"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => e.key === 'Enter' && commitText()}
          />
        ) : (
          <button
            type="button"
            className="stepper-value"
            onClick={() => {
              setText(String(value))
              setEditing(true)
            }}
          >
            {value}
            {unit && <small>{unit}</small>}
          </button>
        )}
        <button type="button" className="stepper-btn" onClick={() => bump(step)} aria-label={`${label} plus`}>
          +
        </button>
      </div>
    </div>
  )
}
