'use client'

export function AdminLogout() {
  return (
    <button type="button" className="hover:underline" onClick={() => {
      void fetch('/api/admin/unlock', { method: 'DELETE' }).then(() => { window.location.href = '/admin/gate' })
    }}>
      退出密钥
    </button>
  )
}
