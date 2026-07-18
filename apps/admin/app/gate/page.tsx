'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function safeAdminNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/admin')) return '/admin'
  if (raw.startsWith('/admin/gate')) return '/admin'
  return raw
}

function GateForm() {
  const [key, setKey] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const search = useSearchParams()
  const next = safeAdminNext(search.get('next'))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/admin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ key }),
      })
      if (!res.ok) {
        setErr('密钥错误')
        setBusy(false)
        return
      }
      // Hard navigation so middleware sees the freshly set httpOnly cookie.
      // router.replace soft-nav often hits /admin before the cookie is applied → bounce back to gate.
      window.location.assign(next)
    } catch {
      setErr('网络错误，请重试')
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="font-serif text-2xl text-[#2c3328]">Admin 访问</h1>
      <p className="text-sm text-[#5c6b52]">输入访问密钥</p>
      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-3">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-3 py-2"
          autoFocus
        />
        {err && <p className="text-sm text-red-700">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[#3d4a3a] px-4 py-2 text-[#f4f1ea] disabled:opacity-50"
        >
          进入
        </button>
      </form>
    </main>
  )
}

export default function AdminGatePage() {
  return (
    <Suspense>
      <GateForm />
    </Suspense>
  )
}
