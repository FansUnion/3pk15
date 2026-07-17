'use client'

import { useEffect, useState } from 'react'
import { getPlatform } from '@/lib/platform'
import { getMockAdOutcome, MOCK_AD_OUTCOMES, setMockAdOutcome, type AdResult, type MockAdOutcome } from '@/lib/ads'

export default function PlatformLabPage() {
  const [outcome, setOutcome] = useState<MockAdOutcome>('success')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<AdResult | null>(null)

  useEffect(() => setOutcome(getMockAdOutcome()), [])

  async function test(kind: 'interstitial' | 'rewarded') {
    setBusy(true); setResult(null)
    const ads = getPlatform().ads
    const next = kind === 'rewarded' ? await ads.showRewarded('double_drop') : await ads.showInterstitial()
    setResult(next); setBusy(false)
  }

  return (
    <main className="mx-auto max-w-2xl text-[#2c3328]">
      <h1 className="font-serif text-2xl">平台与广告实验台</h1>
      <p className="mt-2 text-sm text-[#5c6b52]">当前平台：<strong>{getPlatform().kind}</strong>。配置只保存在本机浏览器，不写数据库。</p>
      <section className="mt-6 border-t border-[#5c6b52]/25 pt-5">
        <label className="block text-sm font-medium" htmlFor="ad-outcome">下一次 Mock 广告结果</label>
        <select
          id="ad-outcome"
          value={outcome}
          onChange={(event) => { const value = event.target.value as MockAdOutcome; setOutcome(value); setMockAdOutcome(value); setResult(null) }}
          className="mt-2 w-full border border-[#5c6b52]/35 bg-white px-3 py-2"
        >
          {MOCK_AD_OUTCOMES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void test('rewarded')} className="rounded bg-[#40513a] px-4 py-2 text-sm text-white disabled:opacity-50">测试激励广告</button>
          <button type="button" disabled={busy} onClick={() => void test('interstitial')} className="rounded border border-[#40513a] px-4 py-2 text-sm disabled:opacity-50">测试插屏广告</button>
        </div>
        <p className="mt-3 min-h-6 text-sm" role="status">{busy ? '测试中...' : result ? (result.ok ? '结果：success' : `结果：${result.reason}`) : ''}</p>
      </section>
      <p className="mt-6 text-xs leading-relaxed text-[#5c6b52]">真实 Poki / CrazyGames SDK 尚未接入时返回 unavailable，不会发放奖励。平台 SDK、广告频控和门户审核属于后续接入批次。</p>
    </main>
  )
}
