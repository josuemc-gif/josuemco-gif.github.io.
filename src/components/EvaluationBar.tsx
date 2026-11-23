import type { EngineEvaluation } from '../types/chess'

interface EvaluationBarProps {
  evaluation: EngineEvaluation
  turn: 'w' | 'b'
}

export default function EvaluationBar({ evaluation, turn }: EvaluationBarProps) {
  let whiteValue = 0
  if (evaluation.type === 'mate') {
    whiteValue = evaluation.value > 0
      ? (turn === 'w' ? 100 : -100)
      : (turn === 'w' ? -100 : 100)
  } else {
    whiteValue = turn === 'w' ? evaluation.value : -evaluation.value
  }

  const clamped = Math.max(-700, Math.min(700, whiteValue))
  const whiteHeight = 50 + (clamped / 700) * 50
  const label = evaluation.type === 'mate'
    ? `M${Math.abs(evaluation.value)}`
    : `${whiteValue >= 0 ? '+' : ''}${(whiteValue / 100).toFixed(1)}`

  return (
    <aside className="evaluation-wrap" aria-label={`Evaluación ${label}`}>
      <div className="evaluation-label">{label}</div>
      <div className="evaluation-track">
        <div className="white-advantage" style={{ height: `${whiteHeight}%` }} />
      </div>
    </aside>
  )
}
