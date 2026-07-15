/** 轻量 Web Audio 音效；无资源文件依赖。静音由调用方判断。 */

type SfxKind = 'step' | 'jump' | 'chain' | 'win' | 'lose'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

function beep(
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
  when = 0,
) {
  const audio = getCtx()
  if (!audio) return
  void audio.resume()
  const t0 = audio.currentTime + when
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = frequency
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + durationMs / 1000)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + durationMs / 1000 + 0.02)
}

export function playSfx(kind: SfxKind) {
  switch (kind) {
    case 'step':
      beep(420, 70, 'triangle', 0.06)
      break
    case 'jump':
      beep(520, 90, 'square', 0.05)
      beep(680, 120, 'sine', 0.07, 0.05)
      break
    case 'chain':
      beep(600, 60, 'square', 0.05)
      beep(760, 80, 'sine', 0.06, 0.04)
      beep(900, 100, 'sine', 0.05, 0.1)
      break
    case 'win':
      beep(523, 120, 'sine', 0.07)
      beep(659, 140, 'sine', 0.07, 0.12)
      beep(784, 180, 'sine', 0.08, 0.26)
      break
    case 'lose':
      beep(300, 160, 'triangle', 0.06)
      beep(220, 220, 'triangle', 0.05, 0.15)
      break
  }
}
