import { useMemo } from 'react'
import { RIR_TEST_INTERVAL_DAYS, rirCalibration } from '../lib/analysis.js'
import { formatDateFR } from '../lib/cycle.js'

function verdict(bias) {
  if (bias === null) return null
  if (bias >= 1.5)
    return `Tu sous-estimes ton RIR d'environ ${Math.round(bias)} rep(s) : quand tu notes RIR 2, tu es plutôt à RIR ${2 + Math.round(bias)}. Pousse chaque série ${Math.round(bias)} rep(s) plus loin que ce que tu ressens.`
  if (bias <= -1)
    return `Tu surestimes ton RIR d'environ ${Math.abs(Math.round(bias))} rep(s) : tu vas plus près de l'échec que tu ne le crois. Garde une marge en accumulation.`
  return 'Ton RIR est bien calibré (écart < 1,5 rep). Continue à tester toutes les 3 semaines.'
}

/** Calibration du RIR à partir des séries AMRAP enregistrées. */
export default function RirCalibration({ sessions }) {
  const cal = useMemo(() => rirCalibration(sessions), [sessions])
  return (
    <section className="card">
      <h3>Calibration du RIR</h3>
      {cal.testDue && (
        <div className="notice">
          {cal.lastTest ? `Dernier test il y a ${cal.daysSince} j` : 'Aucun test encore'} → prévois une série AMRAP cette
          semaine (bouton « AMRAP » sous un exercice, sur la dernière série d'un mouvement que tu maîtrises).
        </div>
      )}
      {cal.tests.length === 0 ? (
        <p className="muted small">
          Principe : après une série normale, refais la même charge jusqu'à l'échec. Si tu fais plus de reps que « reps +
          RIR » annoncés, ton RIR est sous-estimé — c'est le biais le plus fréquent.
        </p>
      ) : (
        <>
          <p>
            Biais moyen : <strong>{cal.bias > 0 ? '+' : ''}{cal.bias} rep(s)</strong> sur {cal.tests.length} test(s).
          </p>
          <p className="small">{verdict(cal.bias)}</p>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exercice</th>
                <th className="num">Prévu</th>
                <th className="num">Réel</th>
                <th className="num">Écart</th>
              </tr>
            </thead>
            <tbody>
              {[...cal.tests].reverse().slice(0, 8).map((t, i) => (
                <tr key={i}>
                  <td>{formatDateFR(t.date)}</td>
                  <td>{t.name}</td>
                  <td className="num">{t.expected}</td>
                  <td className="num">{t.actual}</td>
                  <td className={`num ${t.bias > 0 ? 'up' : t.bias < 0 ? 'down' : ''}`}>
                    {t.bias > 0 ? '+' : ''}
                    {t.bias}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">
            Prévu = reps + RIR de la série précédente à la même charge. Un test tous les {RIR_TEST_INTERVAL_DAYS} jours
            suffit ; la fatigue entre les deux séries rend la mesure légèrement conservatrice.
          </p>
        </>
      )}
    </section>
  )
}
