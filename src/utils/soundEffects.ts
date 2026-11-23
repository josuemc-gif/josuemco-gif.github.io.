let audioContext: AudioContext | null = null

function getContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  return audioContext
}

function tone(frequency: number, duration: number, volume = 0.05, delay = 0) {
  const context = getContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, context.currentTime + delay)
  gain.gain.setValueAtTime(volume, context.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + delay + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(context.currentTime + delay)
  oscillator.stop(context.currentTime + delay + duration)
}

export type ChessSound = 'move' | 'capture' | 'check' | 'castle' | 'end'

export function playChessSound(sound: ChessSound) {
  if (typeof window === 'undefined') return
  if (sound === 'capture') {
    tone(150, 0.11, 0.08)
    tone(95, 0.14, 0.06, 0.05)
  } else if (sound === 'check') {
    tone(520, 0.09, 0.07)
    tone(690, 0.12, 0.06, 0.08)
  } else if (sound === 'castle') {
    tone(220, 0.07, 0.06)
    tone(330, 0.08, 0.05, 0.08)
  } else if (sound === 'end') {
    tone(280, 0.16, 0.06)
    tone(210, 0.22, 0.05, 0.12)
  } else {
    tone(260, 0.08, 0.055)
  }
}
