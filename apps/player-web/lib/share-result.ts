import type { BoardState } from '@wolf-sheep/game-core'

export type ShareOutcome = 'shared' | 'copied' | 'downloaded'
export type ShareResultData = { levelId: string; levelName: string; result: 'won' | 'lost' | 'draw'; plies: number; eatenSheep: number; reason: string; state: BoardState; url: string }

export function buildShareText(data: ShareResultData, locale: 'en' | 'zh') {
  const result = locale === 'zh'
    ? data.result === 'won' ? '狼方获胜' : data.result === 'draw' ? '和局' : '挑战失败'
    : data.result === 'won' ? 'Wolves win' : data.result === 'draw' ? 'Draw' : 'Challenge failed'
  return locale === 'zh'
    ? `Fangrush · ${data.levelName}\n${result}，行动 ${data.plies} 次，捕获 ${data.eatenSheep}/${data.state.targetEaten}\n${data.url}`
    : `Fangrush · ${data.levelName}\n${result} after ${data.plies} actions, captured ${data.eatenSheep}/${data.state.targetEaten}\n${data.url}`
}

export function renderResultCard(data: ShareResultData, locale: 'en' | 'zh') {
  const canvas = document.createElement('canvas')
  canvas.width = 1200; canvas.height = 630
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable')
  ctx.fillStyle = '#eef2ea'; ctx.fillRect(0, 0, 1200, 630)
  ctx.fillStyle = '#263126'; ctx.font = '700 54px serif'; ctx.fillText('Fangrush', 72, 86)
  ctx.font = '600 34px sans-serif'; ctx.fillText(data.levelName, 72, 142)
  const result = locale === 'zh' ? (data.result === 'won' ? '狼方获胜' : data.result === 'draw' ? '和局' : '挑战失败') : (data.result === 'won' ? 'Wolves win' : data.result === 'draw' ? 'Draw' : 'Challenge failed')
  const score = locale === 'zh'
    ? `捕获 ${data.eatenSheep}/${data.state.targetEaten}`
    : `Captured ${data.eatenSheep}/${data.state.targetEaten}`
  const actions = locale === 'zh' ? `${data.plies} 次行动` : `${data.plies} actions`
  ctx.font = '26px sans-serif'; ctx.fillStyle = '#5c6b52'; ctx.fillText(`${result}  ·  ${actions}  ·  ${score}`, 72, 194)
  ctx.font = '22px sans-serif'; ctx.fillText(data.reason, 72, 232)
  const left = 665, top = 58, cell = 96
  ctx.fillStyle = '#f7f5ef'; ctx.fillRect(left - 26, top - 26, cell * 5 + 52, cell * 5 + 52)
  ctx.strokeStyle = '#66745d'; ctx.lineWidth = 4
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath(); ctx.moveTo(left, top + i * cell); ctx.lineTo(left + 5 * cell, top + i * cell); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(left + i * cell, top); ctx.lineTo(left + i * cell, top + 5 * cell); ctx.stroke()
  }
  for (const rock of data.state.rocks) {
    const [r, c] = rock.split(',').map(Number)
    ctx.fillStyle = '#6e665c'; ctx.fillRect(left + (c - 1) * cell - 22, top + (r - 1) * cell - 22, 44, 44)
  }
  for (const piece of data.state.pieces) {
    ctx.beginPath(); ctx.arc(left + (piece.c - 1) * cell, top + (piece.r - 1) * cell, piece.side === 'wolf' ? 29 : 22, 0, Math.PI * 2)
    ctx.fillStyle = piece.side === 'wolf' ? '#8b2e22' : '#f4f1ea'; ctx.fill(); ctx.strokeStyle = '#263126'; ctx.lineWidth = 3; ctx.stroke()
  }
  ctx.fillStyle = '#5c6b52'; ctx.font = '22px sans-serif'; ctx.fillText(locale === 'zh' ? '分享战绩，复盘路线' : 'Share the result. Replay the route.', 72, 570)
  return canvas
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image encoding failed')), 'image/png'))
}

export async function shareResult(data: ShareResultData, locale: 'en' | 'zh'): Promise<ShareOutcome> {
  const text = buildShareText(data, locale)
  const blob = await canvasBlob(renderResultCard(data, locale))
  const file = new File([blob], `fangrush-${data.levelId}.png`, { type: 'image/png' })
  if (navigator.share) {
    const canShareFiles = !navigator.canShare || navigator.canShare({ files: [file] })
    try {
      if (canShareFiles) {
        await navigator.share({ title: `Fangrush · ${data.levelName}`, text, url: data.url, files: [file] })
        return 'shared'
      }
      await navigator.share({ title: `Fangrush · ${data.levelName}`, text, url: data.url })
      return 'shared'
    } catch (error) {
      // User cancellation should not trigger a second share prompt; other platform
      // failures continue through clipboard/download fallbacks below.
      if (error instanceof DOMException && error.name === 'AbortError') throw error
    }
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return 'copied'
    } catch {
      // Clipboard permission can be denied in embedded browsers; use a file instead.
    }
  }
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = file.name
  link.click()
  URL.revokeObjectURL(downloadUrl)
  return 'downloaded'
}
