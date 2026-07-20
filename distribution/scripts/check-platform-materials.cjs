const { existsSync, readFileSync, statSync } = require('node:fs')
const { resolve } = require('node:path')
const { spawnSync } = require('node:child_process')

const root = resolve(__dirname, '..', '..')
const MiB = 1024 * 1024

const pngs = [
  ['distribution/poki/assets/poki-thumbnail-a-1080.png', 1080, 1080, 10],
  ['distribution/crazygames/assets/cover-landscape-a-1920x1080.png', 1920, 1080, 10],
  ['distribution/crazygames/assets/cover-portrait-a-800x1200.png', 800, 1200, 10],
  ['distribution/crazygames/assets/cover-square-a-800x800.png', 800, 800, 10],
  ['distribution/common/screenshots/candidates/01-spring-opening-1080x1350.png', 1080, 1350, 10],
  ['distribution/common/screenshots/candidates/02-summer-routes-1080x1350.png', 1080, 1350, 10],
  ['distribution/common/screenshots/candidates/03-autumn-rocks-1080x1350.png', 1080, 1350, 10],
  ['distribution/common/screenshots/candidates/04-winter-pressure-1080x1350.png', 1080, 1350, 10],
  ['distribution/common/screenshots/candidates/05-capture-moment-1080x1350.png', 1080, 1350, 10],
]

const videos = [
  ['distribution/poki/assets/poki-animated-a-1080.mp4', 1080, 1080, 4, 6, 50, 100],
  ['distribution/crazygames/assets/preview-landscape-a-1920x1080.mp4', 1920, 1080, 15, 20, 30, 50],
  ['distribution/crazygames/assets/preview-portrait-a-1080x1620.mp4', 1080, 1620, 15, 20, 30, 50],
]

function fail(message) {
  console.error(`check:platform-materials: ${message}`)
  process.exitCode = 1
}

function pngSize(path) {
  const buffer = readFileSync(path)
  if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw new Error(`${path} is not PNG`)
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

function motionScores(path) {
  const result = spawnSync('ffmpeg', [
    '-v', 'error', '-i', path, '-vf', 'fps=1,scale=64:64,format=gray', '-f', 'rawvideo', 'pipe:1',
  ], { encoding: null, maxBuffer: 16 * MiB })
  if (result.status !== 0) throw new Error(`ffmpeg motion scan failed for ${path}`)
  const frameSize = 64 * 64
  const scores = []
  for (let offset = frameSize; offset + frameSize <= result.stdout.length; offset += frameSize) {
    let difference = 0
    for (let index = 0; index < frameSize; index++) {
      difference += Math.abs(result.stdout[offset + index] - result.stdout[offset - frameSize + index])
    }
    scores.push(difference / frameSize)
  }
  return scores
}

for (const [relative, width, height, maxMiB] of pngs) {
  const path = resolve(root, relative)
  if (!existsSync(path)) {
    fail(`missing ${relative}`)
    continue
  }
  const actual = pngSize(path)
  const size = statSync(path).size
  if (actual.width !== width || actual.height !== height) fail(`${relative} expected ${width}x${height}, got ${actual.width}x${actual.height}`)
  if (size > maxMiB * MiB) fail(`${relative} exceeds ${maxMiB} MiB`)
}

for (const [relative, width, height, minSeconds, maxSeconds, minFps, maxMiB] of videos) {
  const path = resolve(root, relative)
  if (!existsSync(path)) {
    fail(`missing ${relative}`)
    continue
  }
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path,
  ], { encoding: 'utf8' })
  if (probe.status !== 0) {
    fail(`ffprobe failed for ${relative}`)
    continue
  }
  const data = JSON.parse(probe.stdout)
  const video = data.streams.find((stream) => stream.codec_type === 'video')
  const audio = data.streams.find((stream) => stream.codec_type === 'audio')
  const [fpsTop, fpsBottom] = String(video?.r_frame_rate || '0/1').split('/').map(Number)
  const fps = fpsBottom ? fpsTop / fpsBottom : 0
  const duration = Number(data.format.duration)
  const size = statSync(path).size
  if (!video || video.width !== width || video.height !== height) fail(`${relative} has wrong video dimensions`)
  if (duration < minSeconds || duration > maxSeconds + 0.05) fail(`${relative} duration ${duration}s outside ${minSeconds}-${maxSeconds}s`)
  if (fps < minFps) fail(`${relative} frame rate ${fps} below ${minFps}`)
  if (audio) fail(`${relative} must not contain audio`)
  if (size > maxMiB * MiB) fail(`${relative} exceeds ${maxMiB} MiB`)
  const scores = motionScores(path)
  const significant = scores.map((score, index) => ({ score, index })).filter(({ score }) => score >= 1)
  const minimumChanges = maxSeconds <= 6 ? 2 : 4
  if (significant.length < minimumChanges) fail(`${relative} has only ${significant.length} meaningful visual changes; expected at least ${minimumChanges}`)
  if (!significant.some(({ index }) => index >= Math.floor(scores.length / 2))) fail(`${relative} becomes visually static in its second half`)
}

if (!process.exitCode) console.log(`check:platform-materials: PASS (${pngs.length} PNG, ${videos.length} MP4)`)
