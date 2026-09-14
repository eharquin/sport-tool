import { CYCLE_WEEKS } from '../config/program.js'

/** Bandeau haut de page : semaine du cycle, phase en cours, RIR cible. */
export default function PhaseBanner({ week, phase, rir, cycleStart, location = 'gym' }) {
  if (!cycleStart) {
    return <div className="banner banner-warn">Définis la date de début du cycle dans Réglages</div>
  }
  return (
    <div className={`banner phase-${phase.key}`}>
      <div>
        <strong>Semaine {week}/{CYCLE_WEEKS}</strong> · {phase.label}
      </div>
      <div className="banner-rir">
        {location === 'home' ? (
          <>
            RIR cible <strong>0-1</strong> <small>(maison)</small>
          </>
        ) : (
          <>
            RIR cible <strong>{rir.label}</strong>
          </>
        )}
      </div>
    </div>
  )
}
