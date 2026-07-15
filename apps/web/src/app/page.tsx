import Link from 'next/link'
import { HomeContinueLink } from '@/components/HomeContinueLink'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-8 px-6 py-12">
      <div className="relative overflow-hidden rounded-2xl bg-[#dfe8d8]/80 px-5 pb-6 pt-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 70% 20%, #f5f0e0 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, #c5d4b8 0%, transparent 50%)',
          }}
        />
        <div className="relative">
          <p className="text-xs tracking-[0.28em] text-[#5c6b52] uppercase">Fangrush</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight tracking-wide text-[#2c3328]">
            三狼连猎
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#5c6b52]">
            操控三狼，隔空连吃破阵。借岩石撕开羊群，四季闯关。
          </p>
          <div className="mt-6 flex items-end gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/skins/default/wolf.svg" alt="" width={56} height={56} className="drop-shadow-sm" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/skins/default/sheep.svg"
              alt=""
              width={44}
              height={44}
              className="mb-1 opacity-90"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/skins/default/sheep.svg"
              alt=""
              width={40}
              height={40}
              className="mb-1 opacity-80"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/chapters"
          className="inline-flex items-center justify-center rounded-lg bg-[#3d4a3a] px-6 py-3.5 text-base font-medium text-[#f4f1ea]"
        >
          开始冒险
        </Link>
        <HomeContinueLink />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Link
            href="/skins"
            className="rounded-lg border border-[#5c6b52]/40 py-2 text-center text-sm text-[#2c3328]"
          >
            图鉴
          </Link>
          <Link
            href="/quests"
            className="rounded-lg border border-[#5c6b52]/40 py-2 text-center text-sm text-[#2c3328]"
          >
            任务
          </Link>
          <Link
            href="/settings"
            className="rounded-lg border border-[#5c6b52]/40 py-2 text-center text-sm text-[#2c3328]"
          >
            设置
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-[#7a8574]">进度保存在本机浏览器</p>
    </main>
  )
}
