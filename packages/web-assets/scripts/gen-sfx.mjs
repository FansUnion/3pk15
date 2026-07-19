/**
 * Foley-ish WAV samples: wood tap + soft whoosh (not phone beeps).
 * Run: pnpm --filter @wolf-sheep/web-assets generate:sfx
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../public/sfx')

function writeWav(file, samples, sampleRate = 22050) {
  const dataSize = samples.length * 2
  const buf = Buffer.alloc(44 + dataSize)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + dataSize, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0))
    buf.writeInt16LE((s * 32767) | 0, 44 + i * 2)
  }
  fs.writeFileSync(file, buf)
}

let noiseState = 0x51f15e
function noise() {
  noiseState = (Math.imul(noiseState, 1664525) + 1013904223) >>> 0
  return (noiseState / 0xffffffff) * 2 - 1
}

function env(t, attack, decay) {
  if (t < attack) return t / attack
  return Math.exp(-(t - attack) / decay)
}

/** Soft band-limited noise burst (wood/thud body). */
function woodBody(t, freq) {
  const n = noise()
  const tone = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 28)
  return n * Math.exp(-t * 40) * 0.55 + tone * 0.45
}

function genStep(sr) {
  const n = Math.floor(sr * 0.085)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    out[i] = woodBody(t, 190) * env(t, 0.0015, 0.035) * 0.85
  }
  return out
}

function genCapture(sr) {
  const n = Math.floor(sr * 0.16)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const whoosh = noise() * env(t, 0.012, 0.07) * (0.55 + 0.45 * Math.sin(2 * Math.PI * 9 * t))
    const tick = woodBody(t, 320) * env(t, 0.004, 0.05)
    out[i] = whoosh * 0.38 + tick * 0.55
  }
  return out
}

function genChain(sr) {
  const n = Math.floor(sr * 0.18)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const f = 360 + t * 780
    const tone = Math.sin(2 * Math.PI * f * t) * env(t, 0.004, 0.065)
    const whoosh = noise() * env(t, 0.01, 0.055) * 0.28
    const tap = woodBody(t, 240) * env(t, 0.002, 0.04) * 0.35
    out[i] = tone * 0.38 + whoosh + tap
  }
  return out
}

function genWin(sr) {
  const n = Math.floor(sr * 0.4)
  const out = new Float32Array(n)
  const notes = [523.25, 659.25, 783.99]
  for (let i = 0; i < n; i++) {
    const t = i / sr
    let s = 0
    for (let k = 0; k < notes.length; k++) {
      const local = t - k * 0.09
      if (local < 0) continue
      s += Math.sin(2 * Math.PI * notes[k] * local) * env(local, 0.012, 0.11) * 0.26
      s += woodBody(local, notes[k] / 2) * env(local, 0.004, 0.06) * 0.12
    }
    out[i] = s
  }
  return out
}

function genLose(sr) {
  const n = Math.floor(sr * 0.32)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const f = 260 - t * 100
    out[i] =
      Math.sin(2 * Math.PI * f * t) * env(t, 0.02, 0.16) * 0.32 +
      woodBody(t, 140) * env(t, 0.01, 0.12) * 0.35
  }
  return out
}

function genTone(sr, duration, voices) {
  const out = new Float32Array(Math.floor(sr * duration))
  for (let i = 0; i < out.length; i++) {
    const t = i / sr
    for (const voice of voices) {
      const local = t - (voice.at ?? 0)
      if (local < 0) continue
      const frequency = voice.from + (voice.to - voice.from) * Math.min(1, local / voice.duration)
      const phase = 2 * Math.PI * frequency * local
      const wave = voice.wave === 'triangle'
        ? (2 / Math.PI) * Math.asin(Math.sin(phase))
        : voice.wave === 'saw' ? 2 * ((frequency * local) % 1) - 1 : Math.sin(phase)
      out[i] += wave * env(local, voice.attack ?? 0.006, voice.decay) * voice.gain
    }
  }
  return out
}

function genSheepStep(sr) {
  const out = genTone(sr, 0.095, [{ from: 310, to: 250, duration: 0.08, decay: 0.035, gain: 0.22, wave: 'triangle' }])
  for (let i = 0; i < out.length; i++) out[i] += noise() * Math.exp(-(i / sr) * 55) * 0.08
  return out
}

function genThreat(sr) {
  return genTone(sr, 0.32, [
    { from: 610, to: 430, duration: 0.13, decay: 0.075, gain: 0.22, wave: 'saw' },
    { at: 0.13, from: 570, to: 470, duration: 0.14, decay: 0.09, gain: 0.2, wave: 'triangle' },
  ])
}

function genTrapped(sr) {
  return genTone(sr, 0.28, [
    { from: 190, to: 115, duration: 0.22, decay: 0.13, gain: 0.28, wave: 'triangle' },
    { from: 95, to: 80, duration: 0.2, decay: 0.12, gain: 0.12, wave: 'sine' },
  ])
}

function genUi(sr, kind) {
  const specs = {
    select: [0.07, [{ from: 470, to: 540, duration: 0.05, decay: 0.025, gain: 0.2, wave: 'sine' }]],
    invalid: [0.1, [{ from: 180, to: 150, duration: 0.07, decay: 0.04, gain: 0.18, wave: 'triangle' }]],
    ai: [0.16, [{ from: 210, to: 270, duration: 0.12, decay: 0.07, gain: 0.1, wave: 'sine' }]],
    draw: [0.36, [{ from: 330, to: 320, duration: 0.14, decay: 0.1, gain: 0.2, wave: 'triangle' }, { at: 0.14, from: 294, to: 286, duration: 0.16, decay: 0.11, gain: 0.18, wave: 'triangle' }]],
    unlock: [0.46, [{ from: 523, to: 523, duration: 0.1, decay: 0.1, gain: 0.18, wave: 'sine' }, { at: 0.09, from: 659, to: 659, duration: 0.11, decay: 0.1, gain: 0.18, wave: 'sine' }, { at: 0.2, from: 880, to: 880, duration: 0.18, decay: 0.14, gain: 0.22, wave: 'sine' }]],
    equip: [0.18, [{ from: 420, to: 480, duration: 0.07, decay: 0.05, gain: 0.16, wave: 'triangle' }, { at: 0.06, from: 650, to: 680, duration: 0.08, decay: 0.06, gain: 0.16, wave: 'sine' }]],
  }
  const [duration, voices] = specs[kind]
  return genTone(sr, duration, voices)
}

function normalizePeak(samples, targetDb) {
  let peak = 0
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample))
  if (peak === 0) return samples
  const target = 10 ** (targetDb / 20)
  const scale = target / peak
  for (let i = 0; i < samples.length; i++) samples[i] *= scale
  return samples
}

function emit(name, samples, targetDb) {
  writeWav(path.join(outDir, `${name}.wav`), normalizePeak(samples, targetDb), sr)
}

const sr = 22050
fs.mkdirSync(outDir, { recursive: true })
emit('step', genStep(sr), -3.5)
emit('capture', genCapture(sr), -3)
emit('chain', genChain(sr), -2.5)
emit('win', genWin(sr), -4)
emit('lose', genLose(sr), -4)
emit('sheep-step', genSheepStep(sr), -5)
emit('threat', genThreat(sr), -4)
emit('trapped', genTrapped(sr), -4)
const uiPeak = { select: -8, invalid: -7, ai: -10, draw: -5, unlock: -4, equip: -6 }
for (const kind of ['select', 'invalid', 'ai', 'draw', 'unlock', 'equip']) {
  emit(kind, genUi(sr, kind), uiPeak[kind])
}
console.log('sfx ok →', outDir)
