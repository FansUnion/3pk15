'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  activateDoubleDrop,
  applyClearToSave,
  createSeededRng,
  isDoubleDropActive,
  recordPlayStarted,
  resolveSkin,
  rollClearReward,
  type DropGrant,
  type LevelConfig,
} from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'
import { getAds } from '@/lib/ads'
import { usePlayStore } from '@/lib/play-store'
import { useSaveStore } from '@/lib/save-store'
import { playSfx } from '@/lib/sfx'

type Props = {
  level: LevelConfig
}

export function PlayScreen({ level }: Props) {
  const state = usePlayStore((s) => s.state)
  const selectedWolfId = usePlayStore((s) => s.selectedWolfId)
  const highlights = usePlayStore((s) => s.highlights)
  const uiPhase = usePlayStore((s) => s.uiPhase)
  const juice = usePlayStore((s) => s.juice)
  const init = usePlayStore((s) => s.init)
  const selectWolf = usePlayStore((s) => s.selectWolf)
  const clickCell = usePlayStore((s) => s.clickCell)
  const endChain = usePlayStore((s) => s.endChain)
  const reset = usePlayStore((s) => s.reset)

  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const lastGrant = useSaveStore((s) => s.lastGrant)
  const setLastGrant = useSaveStore((s) => s.setLastGrant)

  const rewardedRef = useRef(false)
  const playCountedRef = useRef(false)
  const [adBusy, setAdBusy] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const [resetArmed, setResetArmed] = useState(false)
  const resetArmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, setTick] = useState(0)
  const prevEaten = useRef(0)
  const terminalSfxDone = useRef(false)
  const muted = save.settings?.muted ?? false

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (muted || !juice) return
    if (juice.kind === 'jump') {
      playSfx(state.chain && state.chain.count >= 2 ? 'chain' : 'jump')
    } else {
      playSfx('step')
    }
  }, [juice, muted, state.chain])

  useEffect(() => {
    if (uiPhase !== 'terminal' || muted || terminalSfxDone.current) return
    terminalSfxDone.current = true
    playSfx(state.status === 'won' ? 'win' : 'lose')
  }, [uiPhase, state.status, muted])

  useEffect(() => {
    rewardedRef.current = false
    playCountedRef.current = false
    terminalSfxDone.current = false
    setLastGrant(null)
    init(level.id, level.rocks, level.ai)
  }, [level.id, level.ai, level.rocks, init, setLastGrant])

  useEffect(() => {
    if (playCountedRef.current) return
    playCountedRef.current = true
    const current = useSaveStore.getState().save
    replace(recordPlayStarted(current, level.id))
  }, [level.id, replace])

  useEffect(() => {
    return () => {
      if (resetArmTimer.current) clearTimeout(resetArmTimer.current)
    }
  }, [])

  useEffect(() => {
    if (level.id !== 'spring-01') return
    if (save.guide.spring1Done) return
    setGuideOpen(true)
    setGuideStep(0)
  }, [level.id, save.guide.spring1Done])

  useEffect(() => {
    if (!guideOpen || save.guide.spring1Done) return
    if (state.eatenSheep > prevEaten.current) {
      finishGuide()
    }
    prevEaten.current = state.eatenSheep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.eatenSheep, guideOpen, save.guide.spring1Done])

  useEffect(() => {
    if (uiPhase !== 'terminal' || rewardedRef.current) return
    rewardedRef.current = true

    void (async () => {
      setAdBusy(true)
      await getAds().showInterstitial()
      setAdBusy(false)

      if (state.status === 'won') {
        const current = useSaveStore.getState().save
        const grant = rollClearReward(level, current, createSeededRng(Date.now()))
        const next = applyClearToSave(current, level, grant)
        replace(next)
        setLastGrant(grant)
      }
    })()
  }, [uiPhase, state.status, level, replace, setLastGrant])

  useEffect(() => {
    if (!isDoubleDropActive(save)) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [save])

  const theme = useMemo(() => {
    const { wolfSet, board } = resolveSkin(save)
    return {
      boardFill: board.boardFill,
      lineStroke: board.lineStroke,
      wolfFill: wolfSet.wolfFill,
      sheepFill: wolfSet.sheepFill,
      wolfSrc: wolfSet.assets.wolf,
      sheepSrc: wolfSet.assets.sheep,
      boardBgSrc: board.assets.boardBg,
    }
  }, [save])

  const sheepLeft = state.pieces.filter((p) => p.side === 'sheep').length
  const interactive = uiPhase === 'playing' && state.toMove === 'wolf'
  const backHref = `/levels/${level.chapterId}`
  const doubleLeft = doubleDropLabel(save.buffs.doubleDropUntil)
  const thinking = uiPhase === 'aiThinking'
  const chainFlash = Boolean(state.chain && uiPhase === 'playing')

  function finishGuide() {
    setGuideOpen(false)
    const current = useSaveStore.getState().save
    if (!current.guide.spring1Done) {
      replace({ ...current, guide: { ...current.guide, spring1Done: true } })
    }
  }

  async function watchDouble() {
    setAdBusy(true)
    const res = await getAds().showRewarded('double_drop')
    setAdBusy(false)
    if (!res.ok) return
    replace(activateDoubleDrop(useSaveStore.getState().save))
  }

  function confirmReset() {
    if (!resetArmed) {
      setResetArmed(true)
      if (resetArmTimer.current) clearTimeout(resetArmTimer.current)
      resetArmTimer.current = setTimeout(() => setResetArmed(false), 2000)
      return
    }
    if (resetArmTimer.current) clearTimeout(resetArmTimer.current)
    setResetArmed(false)
    rewardedRef.current = false
    playCountedRef.current = false
    setLastGrant(null)
    reset()
    replace(recordPlayStarted(useSaveStore.getState().save, level.id))
    playCountedRef.current = true
  }

  function toggleMute() {
    const current = useSaveStore.getState().save
    replace({
      ...current,
      settings: { ...current.settings, muted: !(current.settings?.muted ?? false) },
    })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <Link href={backHref} className="text-sm text-[#5c6b52] underline-offset-2 hover:underline">
          返回
        </Link>
        <h1 className="font-serif text-lg tracking-wide text-[#2c3328]">{level.name}</h1>
        <span className="w-10" />
      </header>

      <div
        className={`flex flex-wrap justify-between gap-2 rounded-lg px-3 py-2 text-sm text-[#2c3328] ${
          chainFlash ? 'bg-[#e8c4b8] ring-2 ring-[#c44836]/50' : 'bg-[#dfe8d8]'
        }`}
      >
        <span>已吃 {state.eatenSheep}/8</span>
        <span>剩羊 {sheepLeft}</span>
        <span className={thinking ? 'font-medium text-[#5c6b52]' : undefined} aria-live="polite">
          {turnLabel(uiPhase, state)}
        </span>
        {doubleLeft && <span className="w-full text-xs text-[#5c6b52]">双倍掉落剩余 {doubleLeft}</span>}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <BoardSvg
          state={state}
          selectedWolfId={selectedWolfId}
          stepHighlights={highlights.steps}
          jumpHighlights={highlights.jumps}
          jumpThroughs={highlights.throughs}
          juice={juice}
          interactive={interactive}
          onSelectWolf={selectWolf}
          onClickCell={clickCell}
          theme={theme}
        />
        {thinking && (
          <div className="absolute inset-0 z-10 cursor-default rounded-lg bg-black/[0.04]" aria-hidden />
        )}
      </div>

      {state.chain && uiPhase === 'playing' && (
        <button
          type="button"
          onClick={endChain}
          className="rounded-lg bg-[#3d4a3a] px-4 py-3 text-center text-sm font-medium text-[#f4f1ea]"
        >
          结束连吃
        </button>
      )}

      {uiPhase === 'terminal' && (
        <div className="rounded-lg border border-[#5c6b52]/30 bg-[#f7f5ef] p-4 text-center">
          <p className="font-serif text-xl text-[#2c3328]">
            {state.status === 'won' ? '胜利' : '失败'}
          </p>
          <p className="mt-1 text-sm text-[#5c6b52]">
            {state.status === 'won' ? '吃羊达到 8 只' : '三狼无路可走'}
          </p>
          {adBusy && <p className="mt-1 text-xs text-[#7a8574]">准备中…</p>}
          {state.status === 'won' && lastGrant && <GrantLine grant={lastGrant} />}
          <p className="mt-2 text-xs text-[#7a8574]">通用碎片 {save.fragments.universal}</p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              type="button"
              disabled={adBusy}
              onClick={() => {
                rewardedRef.current = false
                playCountedRef.current = false
                setLastGrant(null)
                reset()
                replace(recordPlayStarted(useSaveStore.getState().save, level.id))
                playCountedRef.current = true
              }}
              className="w-full max-w-xs rounded-lg bg-[#3d4a3a] px-4 py-3 text-sm font-medium text-[#f4f1ea] disabled:opacity-50"
            >
              再来一局
            </button>
            {state.status === 'won' && !isDoubleDropActive(save) && (
              <button
                type="button"
                disabled={adBusy}
                onClick={() => void watchDouble()}
                className="text-sm text-[#5c6b52] underline-offset-2 hover:underline disabled:opacity-50"
              >
                看广告 · 碎片双倍 30 分钟
              </button>
            )}
            <Link
              href={backHref}
              className="rounded-lg border border-[#5c6b52]/40 px-4 py-2 text-sm text-[#2c3328]"
            >
              关卡列表
            </Link>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-[#7a8574]">
        绿点走空格 · 隔一空点羊即吃（红圈在羊上）
      </p>

      <footer className="mt-auto grid grid-cols-3 gap-2 border-t border-[#5c6b52]/20 pt-3">
        <button
          type="button"
          onClick={confirmReset}
          className={`rounded-lg border py-2.5 text-sm ${
            resetArmed
              ? 'border-[#c44836]/50 bg-[#e8c4b8]/40 text-[#8b2e22]'
              : 'border-[#5c6b52]/30 text-[#2c3328]'
          }`}
        >
          {resetArmed ? '再点确认' : '重置'}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="rounded-lg border border-[#5c6b52]/30 py-2.5 text-sm text-[#2c3328]"
        >
          {muted ? '取消静音' : '静音'}
        </button>
        <Link
          href={backHref}
          className="rounded-lg border border-[#5c6b52]/30 py-2.5 text-center text-sm text-[#2c3328]"
        >
          退出
        </Link>
      </footer>

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2c3328]/45 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-xl bg-[#f7f5ef] p-5 shadow-lg">
            <p className="font-serif text-lg text-[#2c3328]">春日第一课</p>
            {guideStep === 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-[#5c6b52]">
                点选深色狼，再点绿色高亮空格，即可走一格。
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-[#5c6b52]">
                隔空吃：同线「狼 — 空 — 羊」时，点红圈羊或中间空即可冲吃。连吃可继续，最多 5 次。
              </p>
            )}
            <div className="mt-4 flex justify-between gap-2">
              <button
                type="button"
                className="text-sm text-[#7a8574] underline-offset-2 hover:underline"
                onClick={finishGuide}
              >
                跳过
              </button>
              {guideStep === 0 ? (
                <button
                  type="button"
                  className="rounded-lg bg-[#3d4a3a] px-4 py-2 text-sm text-[#f4f1ea]"
                  onClick={() => setGuideStep(1)}
                >
                  下一步
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-lg bg-[#3d4a3a] px-4 py-2 text-sm text-[#f4f1ea]"
                  onClick={finishGuide}
                >
                  开始猎食
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function turnLabel(
  uiPhase: string,
  state: { toMove: string; chain: { count: number } | null },
): string {
  if (uiPhase === 'aiThinking') return '羊回合'
  if (state.toMove === 'wolf') {
    return state.chain ? `连吃 ${state.chain.count}/5` : '狼回合'
  }
  return '羊回合'
}

function GrantLine({ grant }: { grant: DropGrant }) {
  const seasonBits = Object.entries(grant.season)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([k, v]) => `${k}+${v}`)
    .join(' ')
  if (grant.universal === 0 && !seasonBits) {
    return <p className="mt-2 text-sm text-[#5c6b52]">本次无碎片掉落</p>
  }
  return (
    <p className="mt-2 text-sm text-[#2c3328]">
      {grant.firstClear ? '首次通关' : '重复通关'}
      {grant.doubled ? '（双倍）' : ''}：通用 +{grant.universal}
      {seasonBits ? ` · ${seasonBits}` : ''}
    </p>
  )
}

function doubleDropLabel(until: number | null): string | null {
  if (until == null || until <= Date.now()) return null
  const sec = Math.ceil((until - Date.now()) / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
