import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MoveRecord } from '../types/chess'

interface MoveHistoryProps {
  moves: MoveRecord[]
  pgn: string
}

export default function MoveHistory({ moves, pgn }: MoveHistoryProps) {
  const [copied, setCopied] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [moves.length])

  const copyPgn = async () => {
    if (!pgn) return
    await navigator.clipboard.writeText(pgn)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <section className="panel history-panel">
      <div className="panel-heading history-heading">
        <div>
          <span className="eyebrow">Partida</span>
          <h2>Movimientos</h2>
        </div>
        <button type="button" className="icon-button" onClick={copyPgn} aria-label="Copiar PGN">
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
      <div className="move-list">
        {moves.length === 0 ? (
          <div className="empty-history">Esperando el primer movimiento</div>
        ) : (
          Array.from({ length: Math.ceil(moves.length / 2) }).map((_, index) => (
            <div className="move-row" key={index}>
              <span className="move-number">{index + 1}.</span>
              <span>{moves[index * 2]?.san}</span>
              <span>{moves[index * 2 + 1]?.san}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </section>
  )
}
