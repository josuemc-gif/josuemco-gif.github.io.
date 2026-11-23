import { Chess, type Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import EloSelector from './components/EloSelector'
import EvaluationBar from './components/EvaluationBar'
import GameControls from './components/GameControls'
import MoveHistory from './components/MoveHistory'
import { useStockfish } from './hooks/useStockfish'
import type { MoveRecord, PieceColor } from './types/chess'
import { playChessSound } from './utils/soundEffects'

function resolvedColor(color: PieceColor) {
  return color === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : color
}

function App() {
  const [elo, setElo] = useState(1400)
  const [selectedColor, setSelectedColor] = useState<PieceColor>('white')
  const [humanColor, setHumanColor] = useState<'white' | 'black'>('white')
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [game, setGame] = useState(() => new Chess())
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [resigned, setResigned] = useState(false)
  const gameRef = useRef(game)
  const processedBestMove = useRef<string | null>(null)

  const { ready, isThinking, bestMove, evaluation, requestMove, stop, blunderChance } = useStockfish(elo)
  const botColor = humanColor === 'white' ? 'b' : 'w'
  const humanTurn = game.turn() === (humanColor === 'white' ? 'w' : 'b')

  const moves: MoveRecord[] = useMemo(
    () => game.history({ verbose: true }).map((move) => ({ san: move.san, from: move.from, to: move.to, color: move.color })),
    [game],
  )

  const commitMove = (move: Parameters<Chess['move']>[0]) => {
    const next = new Chess(gameRef.current.fen())
    try {
      const result = next.move(move)
      if (!result) return false
      gameRef.current = next
      setGame(next)
      setLastMove({ from: result.from, to: result.to })

      if (next.isGameOver()) playChessSound('end')
      else if (next.isCheck()) playChessSound('check')
      else if (result.captured) playChessSound('capture')
      else if (result.isKingsideCastle() || result.isQueensideCastle()) playChessSound('castle')
      else playChessSound('move')

      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (!bestMove || processedBestMove.current === bestMove) return
    if (gameRef.current.turn() !== botColor) return

    processedBestMove.current = bestMove
    let moveToMake = bestMove
    if (blunderChance > 0 && Math.random() < blunderChance) {
      const legalMoves = gameRef.current.moves({ verbose: true })
      if (legalMoves.length) {
        const chosen = legalMoves[Math.floor(Math.random() * legalMoves.length)]
        moveToMake = `${chosen.from}${chosen.to}${chosen.promotion ?? ''}`
      }
    }

    commitMove({
      from: moveToMake.slice(0, 2) as Square,
      to: moveToMake.slice(2, 4) as Square,
      promotion: moveToMake[4] || 'q',
    })
  }, [bestMove, blunderChance, botColor])

  useEffect(() => {
    if (!ready) return
    if (!isThinking && gameRef.current.turn() === botColor && !gameRef.current.isGameOver()) {
      const timeout = window.setTimeout(() => requestMove(gameRef.current.fen()), 300)
      return () => window.clearTimeout(timeout)
    }
  }, [ready, isThinking, botColor, requestMove, game])

  const startNewGame = (color: PieceColor = selectedColor) => {
    stop()
    const resolved = resolvedColor(color)
    const next = new Chess()
    setHumanColor(resolved)
    setBoardFlipped(resolved === 'black')
    setGame(next)
    gameRef.current = next
    setSelectedSquare(null)
    setLastMove(null)
    setResigned(false)
    processedBestMove.current = null
  }

  const changeColor = (color: PieceColor) => {
    setSelectedColor(color)
    startNewGame(color)
  }

  const handlePieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare || !humanTurn || isThinking) return false
    setSelectedSquare(null)
    return commitMove({ from: sourceSquare as Square, to: targetSquare as Square, promotion: 'q' })
  }

  const handleSquareClick = ({ square }: { square: string }) => {
    if (!humanTurn || isThinking) return
    const squareName = square as Square

    if (selectedSquare) {
      const moved = commitMove({ from: selectedSquare as Square, to: squareName, promotion: 'q' })
      if (moved) {
        setSelectedSquare(null)
        return
      }
    }

    const piece = game.get(squareName)
    setSelectedSquare(piece?.color === (humanColor === 'white' ? 'w' : 'b') ? square : null)
  }

  const undo = () => {
    if (moves.length === 0) return
    stop()
    const next = new Chess(gameRef.current.fen())
    next.undo()
    if (next.history().length > 0) next.undo()
    gameRef.current = next
    setGame(next)
    setSelectedSquare(null)
    setLastMove(null)
  }

  const squareStyles: Record<string, CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { background: 'rgba(246, 187, 66, 0.48)' }
    squareStyles[lastMove.to] = { background: 'rgba(246, 187, 66, 0.62)' }
  }
  if (selectedSquare) {
    squareStyles[selectedSquare] = { ...squareStyles[selectedSquare], background: 'rgba(246, 187, 66, 0.68)' }
    game.moves({ square: selectedSquare as Square, verbose: true }).forEach((move) => {
      squareStyles[move.to] = {
        ...squareStyles[move.to],
        background: 'radial-gradient(circle, rgba(32, 38, 35, 0.42) 24%, transparent 27%)',
      }
    })
  }
  if (game.isCheck()) {
    const kingSquare = game.board().flat().find((piece) => piece?.type === 'k' && piece.color === game.turn())?.square
    if (kingSquare) squareStyles[kingSquare] = { background: 'rgba(214, 69, 65, 0.78)' }
  }

  let endTitle = ''
  if (resigned) endTitle = 'Rendición'
  else if (game.isCheckmate()) endTitle = 'Jaque mate'
  else if (game.isStalemate()) endTitle = 'Ahogado'
  else if (game.isDraw()) endTitle = 'Tablas'

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">♞</span><span>NOCTURNE</span></div>
        <div className={`engine-status ${ready ? 'online' : ''}`}><span /> {ready ? 'Stockfish listo' : 'Cargando motor'}</div>
      </header>

      <div className="game-layout">
        <aside className="left-column">
          <EloSelector elo={elo} color={selectedColor} onEloChange={setElo} onColorChange={changeColor} />
        </aside>

        <section className="board-column">
          <div className="board-frame">
            <EvaluationBar evaluation={evaluation} turn={game.turn()} />
            <div className="board-wrap">
              <Chessboard
                options={{
                  position: game.fen(),
                  boardOrientation: boardFlipped ? 'black' : 'white',
                  allowDragging: humanTurn && !isThinking,
                  canDragPiece: () => humanTurn && !isThinking,
                  onPieceDrop: handlePieceDrop,
                  onSquareClick: handleSquareClick,
                  squareStyles,
                  boardStyle: { width: '100%', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden' },
                  animationDurationInMs: 180,
                  showAnimations: true,
                }}
              />
            </div>
          </div>
          <GameControls
            isThinking={isThinking}
            canUndo={moves.length > 0}
            onNewGame={() => startNewGame()}
            onUndo={undo}
            onFlip={() => setBoardFlipped((value) => !value)}
            onResign={() => setResigned(true)}
          />
        </section>

        <aside className="right-column">
          <MoveHistory moves={moves} pgn={game.pgn()} />
        </aside>
      </div>

      {endTitle && (
        <div className="modal-backdrop">
          <div className="end-modal">
            <span className="end-icon">♚</span>
            <span className="eyebrow">Resultado</span>
            <h2>{endTitle}</h2>
            <p>{resigned ? 'La partida ha terminado.' : 'Una buena partida merece otra.'}</p>
            <button type="button" onClick={() => startNewGame()}>Jugar revancha</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
