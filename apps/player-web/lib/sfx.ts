/** Prefer short sample buffers; fall back to richer procedural tones. */

export type SfxKind = 'step' | 'jump' | 'chain' | 'win' | 'lose' | 'select' | 'invalid' | 'ai' | 'threat'

export type AudioDiagnostics = {
  requested: number
  samplePlayed: number
  fallbackPlayed: number
  blocked: number
  lastKind: SfxKind | null
  lastMode: 'sample' | 'fallback' | 'blocked' | null
  contextState: string
}

let ctx: AudioContext | null = null
const bufferCache = new Map<SfxKind, AudioBuffer>()
const diagnostics = { requested: 0, samplePlayed: 0, fallbackPlayed: 0, blocked: 0, lastKind: null as SfxKind | null, lastMode: null as AudioDiagnostics['lastMode'] }

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

async function loadBuffer(kind: SfxKind): Promise<AudioBuffer | null> {
  const audio = getCtx()
  if (!audio) return null
  if (bufferCache.has(kind)) return bufferCache.get(kind)!
  const map: Record<SfxKind, string | null> = {
    step: '/sfx/step.wav',
    jump: '/sfx/capture.wav',
    chain: '/sfx/chain.wav',
    win: '/sfx/win.wav',
    lose: '/sfx/lose.wav',
    select: null,
    invalid: null,
    ai: null,
    threat: null,
  }
  const source = map[kind]
  if (!source) return null
  try {
    const res = await fetch(source)
    if (!res.ok) return null
    const arr = await res.arrayBuffer()
    const buf = await audio.decodeAudioData(arr.slice(0))
    bufferCache.set(kind, buf)
    return buf
  } catch {
    return null
  }
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
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2200
  osc.type = type
  osc.frequency.value = frequency
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + durationMs / 1000)
  osc.connect(filter)
  filter.connect(g)
  g.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + durationMs / 1000 + 0.02)
}

function playFallback(kind: SfxKind) {
  switch (kind) {
    case 'step':
      beep(380, 55, 'triangle', 0.05)
      beep(220, 40, 'sine', 0.03, 0.02)
      break
    case 'jump':
      beep(480, 70, 'square', 0.04)
      beep(720, 110, 'sine', 0.06, 0.04)
      break
    case 'chain':
      beep(560, 50, 'square', 0.04)
      beep(700, 60, 'sine', 0.05, 0.04)
      beep(880, 90, 'sine', 0.05, 0.09)
      break
    case 'win':
      beep(523, 100, 'sine', 0.06)
      beep(659, 120, 'sine', 0.06, 0.1)
      beep(784, 160, 'sine', 0.07, 0.22)
      break
    case 'lose':
      beep(280, 140, 'triangle', 0.05)
      beep(200, 200, 'triangle', 0.045, 0.12)
      break
    case 'select':
      beep(460, 45, 'sine', 0.035)
      break
    case 'invalid':
      beep(170, 65, 'triangle', 0.025)
      break
    case 'ai':
      beep(190, 90, 'sine', 0.018)
      beep(260, 120, 'sine', 0.014, 0.08)
      break
    case 'threat':
      beep(620, 55, 'sine', 0.035)
      beep(760, 80, 'triangle', 0.04, 0.055)
      break
  }
}

function playBuffer(buf: AudioBuffer) {
  const audio = getCtx()
  if (!audio) return
  void audio.resume()
  const src = audio.createBufferSource()
  const g = audio.createGain()
  g.gain.value = 0.7
  src.buffer = buf
  src.connect(g)
  g.connect(audio.destination)
  src.start()
}

export function playSfx(kind: SfxKind) {
  diagnostics.requested += 1
  diagnostics.lastKind = kind
  void (async () => {
    const audio = getCtx()
    if (!audio) {
      diagnostics.blocked += 1
      diagnostics.lastMode = 'blocked'
      return
    }
    try {
      await audio.resume()
    } catch {
      diagnostics.blocked += 1
      diagnostics.lastMode = 'blocked'
      return
    }
    const buf = await loadBuffer(kind)
    if (buf) {
      playBuffer(buf)
      diagnostics.samplePlayed += 1
      diagnostics.lastMode = 'sample'
    } else {
      playFallback(kind)
      diagnostics.fallbackPlayed += 1
      diagnostics.lastMode = 'fallback'
    }
  })()
}

export function getAudioDiagnostics(): AudioDiagnostics {
  return { ...diagnostics, contextState: ctx?.state ?? 'uninitialized' }
}

export async function prepareSfx() {
  const audio = getCtx()
  if (!audio) return false
  try {
    await audio.resume()
    void Promise.all((['step', 'jump', 'chain', 'win', 'lose'] as SfxKind[]).map(loadBuffer))
    return true
  } catch {
    diagnostics.blocked += 1
    diagnostics.lastMode = 'blocked'
    return false
  }
}

export async function suspendSfx() {
  if (ctx?.state === 'running') await ctx.suspend()
}

export async function resumeSfx() {
  if (ctx?.state === 'suspended') await ctx.resume()
}
