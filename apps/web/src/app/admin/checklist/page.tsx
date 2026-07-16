'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'ws-admin-checklist-v1'

type Item = {
  id: string
  group: string
  label: string
  href?: string
  adminHref?: string
  doc?: string
}

const ITEMS: Item[] = [
  {
    id: 'land',
    group: '漏斗断点',
    label: '落地 3s：品牌 Fangrush + 一句话 + 一键开玩清晰',
    href: '/',
    doc: '感官硬约束见美术资源和用户体验/01-体验标准指针',
    adminHref: '/admin/docs',
  },
  {
    id: 'teach',
    group: '漏斗断点',
    label: '首 60s：春日 1 教会隔空吃',
    href: '/play/spring-01',
    adminHref: '/admin/docs',
  },
  {
    id: 'juice',
    group: '漏斗断点',
    label: '第一次连吃有路径/消失反馈（juice）',
    href: '/play/spring-01',
  },
  {
    id: 'skin',
    group: '漏斗断点',
    label: '穿上皮后盘面立刻变（图鉴=对局）',
    href: '/skins',
    adminHref: '/admin/skins',
  },
  {
    id: 'ads-seam',
    group: '漏斗断点',
    label: '广告在自然缝；失败不挡结算/再来',
    href: '/play/spring-01',
  },
  {
    id: 'm1-core',
    group: '冒烟 M1',
    label: '春日至少 1 关可胜可败；隔空吃/连吃正确',
    href: '/play/spring-01',
    adminHref: '/admin/levels',
  },
  {
    id: 'm2-progress',
    group: '冒烟 M2',
    label: '通关进度本地保存；刷新不丢',
    href: '/chapters',
  },
  {
    id: 'm3-skins-econ',
    group: '冒烟 M3',
    label: '皮肤解锁/装备；碎片可见闭环',
    href: '/skins',
    adminHref: '/admin/economy',
  },
  {
    id: 'm4-seo',
    group: '冒烟 M4',
    label: '/hunt 关卡页文案像成品；how-to-play 可读',
    href: '/hunt/spring-01',
    adminHref: '/admin/docs',
  },
  {
    id: 'ai-calibrate',
    group: '难度',
    label: 'AI 台对春日 easy / 冬日 hard 跑过批量胜率；fixture 挡吃/合围看过',
    href: '/admin/ai?level=spring-01&diff=easy',
    adminHref: '/admin/ai',
  },
  {
    id: 'ads-real',
    group: '上线',
    label: '真 AdSense / 平台广告（待有号）',
  },
  {
    id: 'deploy',
    group: '上线',
    label: 'Vercel 挂站 + 生产 env + 隐私页',
    href: '/privacy',
  },
]

export default function AdminChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>)
    } catch {
      /* ignore */
    }
  }, [])

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const groups = [...new Set(ITEMS.map((i) => i.group))]
  const done = ITEMS.filter((i) => checked[i.id]).length

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">上线检查清单</h1>
      <p className="mt-2 text-sm text-[#5c6b52]">
        漏斗断点 + 冒烟摘要。勾选仅存本机 localStorage（
        <code className="rounded bg-[#dfe8d8] px-1">{STORAGE_KEY}</code>
        ），不进玩家存档，不替代远程遥测。
      </p>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#5c6b52]">
        <Link href="/admin/skins" className="underline">
          皮肤台
        </Link>
        <Link href="/admin/levels" className="underline">
          关卡台
        </Link>
        <Link href="/admin/ai" className="underline">
          AI 台
        </Link>
        <Link href="/admin/docs" className="underline">
          说明
        </Link>
        <Link href="/admin/economy" className="underline">
          经济台
        </Link>
      </p>
      <p className="mt-2 text-sm text-[#2c3328]">
        进度 {done}/{ITEMS.length}
      </p>

      <div className="mt-6 space-y-6">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="text-sm font-medium text-[#5c6b52]">{g}</h2>
            <ul className="mt-2 space-y-2">
              {ITEMS.filter((i) => i.group === g).map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-[#5c6b52]/20 bg-[#f7f5ef] px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!checked[item.id]}
                    onChange={() => toggle(item.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        checked[item.id] ? 'text-[#7a8574] line-through' : 'text-[#2c3328]'
                      }
                    >
                      {item.label}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {item.href && (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#3d4a3a] underline"
                        >
                          玩家 {item.href}
                        </a>
                      )}
                      {item.adminHref && (
                        <Link href={item.adminHref} className="text-[#3d4a3a] underline">
                          Admin {item.adminHref}
                        </Link>
                      )}
                    </div>
                    {item.doc && (
                      <p className="mt-1 text-xs text-[#7a8574]">{item.doc}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 text-xs text-[#5c6b52] underline"
        onClick={() => {
          setChecked({})
          try {
            localStorage.removeItem(STORAGE_KEY)
          } catch {
            /* ignore */
          }
        }}
      >
        清空本机勾选
      </button>
    </main>
  )
}
