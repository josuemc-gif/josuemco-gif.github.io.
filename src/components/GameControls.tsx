import { Flag, RotateCcw, RotateCw, Undo2 } from 'lucide-react'

interface GameControlsProps {
  isThinking: boolean
  canUndo: boolean
  onNewGame: () => void
  onUndo: () => void
  onFlip: () => void
  onResign: () => void
}

export default function GameControls({ isThinking, canUndo, onNewGame, onUndo, onFlip, onResign }: GameControlsProps) {
  return (
    <section className="game-controls">
      <button type="button" className="control-button primary" onClick={onNewGame}>
        <RotateCcw size={17} /> Nueva partida
      </button>
      <button type="button" className="control-button" onClick={onUndo} disabled={!canUndo}>
        <Undo2 size={17} /> Deshacer
      </button>
      <button type="button" className="control-button icon-only" onClick={onFlip} aria-label="Girar tablero">
        <RotateCw size={17} />
      </button>
      <button type="button" className="control-button resign" onClick={onResign}>
        <Flag size={17} /> Rendirse
      </button>
      {isThinking && (
        <div className="thinking-indicator">
          <span /> La IA está pensando...
        </div>
      )}
    </section>
  )
}
