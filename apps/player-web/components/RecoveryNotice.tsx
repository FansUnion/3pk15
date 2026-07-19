'use client'

import { useEffect, useState } from 'react'

export function RecoveryNotice() {
  const [offline, setOffline] = useState(false)
  const [saveRecovered, setSaveRecovered] = useState(false)
  const [zh, setZh] = useState(true)
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    const recovered = () => setSaveRecovered(true)
    sync()
    setZh(document.documentElement.lang.startsWith('zh'))
    if (sessionStorage.getItem('fangrush:save-recovered') === '1') setSaveRecovered(true)
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    window.addEventListener('fangrush:save-recovered', recovered)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
      window.removeEventListener('fangrush:save-recovered', recovered)
    }
  }, [])
  if (!offline && !saveRecovered) return null
  return (
    <div role="status" className="fixed inset-x-3 top-3 z-[70] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] shadow-lg">
      <span>{offline ? (zh ? '网络已断开。当前本地进度仍可保留，恢复网络后再刷新。' : 'You are offline. Local progress is preserved; refresh after reconnecting.') : (zh ? '检测到损坏的本地进度，已安全恢复为新存档。' : 'Damaged local progress was detected and safely reset.')}</span>
      {!offline && <button type="button" className="text-xs underline" onClick={() => { sessionStorage.removeItem('fangrush:save-recovered'); setSaveRecovered(false) }}>{zh ? '知道了' : 'Dismiss'}</button>}
    </div>
  )
}
