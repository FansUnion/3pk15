/**
 * Foley-ish WAV samples: wood tap + soft whoosh (not phone beeps).
 * Run: node apps/web/scripts/assets/gen-sfx.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../../public/sfx')

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

function noise() {
  return Math.random() * 2 - 1
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

const sr = 22050
fs.mkdirSync(outDir, { recursive: true })
writeWav(path.join(outDir, 'step.wav'), genStep(sr), sr)
writeWav(path.join(outDir, 'capture.wav'), genCapture(sr), sr)
writeWav(path.join(outDir, 'chain.wav'), genChain(sr), sr)
writeWav(path.join(outDir, 'win.wav'), genWin(sr), sr)
writeWav(path.join(outDir, 'lose.wav'), genLose(sr), sr)
console.log('sfx ok →', outDir)
