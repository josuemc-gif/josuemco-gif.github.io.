import { Bot, Crown, GraduationCap, Shield, Sparkles, Target } from 'lucide-react'
import type { PieceColor } from '../types/chess'

const presets = [
  { name: 'Principiante', elo: 600, icon: GraduationCap },
  { name: 'Casual', elo: 1000, icon: Bot },
  { name: 'Club', elo: 1400, icon: Shield },
  { name: 'Avanzado', elo: 1800, icon: Target },
  { name: 'Maestro', elo: 2300, icon: Crown },
  { name: 'Máximo', elo: 3190, icon: Sparkles },
]

interface EloSelectorProps {
  elo: number
  color: PieceColor
  onEloChange: (elo: number) => void
  onColorChange: (color: PieceColor) => void
}

export default function EloSelector({ elo, color, onEloChange, onColorChange }: EloSelectorProps) {
  return (
    <section className="panel elo-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Rival</span>
          <h2>Seleccionar nivel</h2>
        </div>
        <div className="elo-badge">{elo}</div>
      </div>

      <div className="preset-grid">
        {presets.map(({ name, elo: presetElo, icon: Icon }) => (
          <button
            key={presetElo}
            type="button"
            className={`preset ${elo === presetElo ? 'active' : ''}`}
            onClick={() => onEloChange(presetElo)}
          >
            <Icon size={15} />
            <span>{name}</span>
            <small>{presetElo}</small>
          </button>
        ))}
      </div>

      <label className="range-label" htmlFor="elo-range">
        <span>ELO personalizado</span>
        <strong>{elo}</strong>
      </label>
      <input
        id="elo-range"
        className="elo-range"
        type="range"
        min="400"
        max="3190"
        step="50"
        value={elo}
        onChange={(event) => onEloChange(Number(event.target.value))}
      />

      <div className="color-section">
        <span className="section-label">Jugar con</span>
        <div className="segmented">
          {(['white', 'black', 'random'] as PieceColor[]).map((option) => (
            <button
              key={option}
              type="button"
              className={color === option ? 'active' : ''}
              onClick={() => onColorChange(option)}
            >
              {option === 'white' ? 'Blancas' : option === 'black' ? 'Negras' : 'Aleatorio'}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
