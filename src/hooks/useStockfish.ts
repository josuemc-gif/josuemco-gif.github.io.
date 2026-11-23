import { useCallback, useEffect, useRef, useState } from 'react'
import type { EngineEvaluation } from '../types/chess'
import { getEngineConfigForElo } from '../utils/eloCalibrator'

export function useStockfish(elo: number) {
  const workerRef = useRef<Worker | null>(null)
  const eloRef = useRef(elo)
  const [ready, setReady] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [bestMove, setBestMove] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<EngineEvaluation>({ type: 'cp', value: 0 })

  const configure = useCallback((nextElo: number) => {
    const worker = workerRef.current
    if (!worker) return
    const config = getEngineConfigForElo(nextElo)
    worker.postMessage('stop')
    config.uciCommands.forEach((command) => worker.postMessage(command))
  }, [])

  useEffect(() => {
    eloRef.current = elo
    configure(elo)
  }, [elo, configure])

  useEffect(() => {
    const worker = new Worker('/stockfish/stockfish-19-lite-single.js')
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent) => {
      const line = String(event.data)

      if (line === 'uciok') {
        setReady(true)
        configure(eloRef.current)
      }

      if (line.startsWith('info ')) {
        const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/)
        if (scoreMatch) {
          setEvaluation({
            type: scoreMatch[1] as 'cp' | 'mate',
            value: Number(scoreMatch[2]),
          })
        }
      }

      if (line.startsWith('bestmove')) {
        const move = line.split(/\s+/)[1]
        setIsThinking(false)
        setBestMove(move && move !== '(none)' ? move : null)
      }

      if (line === 'readyok') setReady(true)
    }

    worker.onerror = () => setReady(false)
    worker.postMessage('uci')
    worker.postMessage('isready')

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [configure])

  const requestMove = useCallback((fen: string) => {
    const worker = workerRef.current
    if (!worker) return
    const config = getEngineConfigForElo(eloRef.current)
    setBestMove(null)
    setIsThinking(true)
    worker.postMessage('stop')
    config.uciCommands.forEach((command) => worker.postMessage(command))
    worker.postMessage(`position fen ${fen}`)
    worker.postMessage(config.goCommand)
  }, [])

  const stop = useCallback(() => {
    workerRef.current?.postMessage('stop')
    setIsThinking(false)
  }, [])

  const blunderChance = getEngineConfigForElo(elo).randomBlunderChance

  return { ready, isThinking, bestMove, evaluation, requestMove, stop, blunderChance }
}
