'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  activateDoubleDrop,
  applyClearToSave,
  createSeededRng,
  isDoubleDropActive,
  levelDisplayName,
  recordPlayStarted,
  resolveSkin,
  rollClearReward,
  type DropGrant,
  type LevelConfig,
} from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { getAds } from '@/lib/ads'
import { usePlayStore } from '@/lib/play-store'
import { useSaveStore } from '@/lib/save-store'
import { playSfx } from '@/lib/sfx'
import { fmt, type MessageTree } from '@/i18n/messages'
import { useClientMessages } from '@/i18n/use-client-locale'

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
  const { locale, t } = useClientMessages()
  const p = t.play

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
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [save])

  const theme = useMemo(() => {
    const { wolfSet, board } = resolveSkin(save)
    const rockWarm =
      board.id === 'board-autumn' ? 0.55 : board.id === 'board-winter' ? -0.45 : board.id === 'board-summer' ? 0.25 : 0
    return {
      boardFill: board.boardFill,
      lineStroke: board.lineStroke,
      wolfFill: wolfSet.wolfFill,
      sheepFill: wolfSet.sheepFill,
      wolfSrc: wolfSet.assets.wolf,
      sheepSrc: wolfSet.assets.sheep,
      boardBgSrc: board.assets.boardBg,
      rockWarm,
    }
  }, [save])

  const sheepLeft = state.pieces.filter((piece) => piece.side === 'sheep').length
  const interactive = uiPhase === 'playing' && state.toMove === 'wolf'
  const backHref = `/levels/${level.chapterId}`
  const doubleLeft = doubleDropLabel(save.buffs.doubleDropUntil)
  const thinking = uiPhase === 'aiThinking'
  const chainFlash = Boolean(state.chain && uiPhase === 'playing')
  const title = levelDisplayName(level, locale)

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
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-3 px-4 pb-4 pt-4">
      <header className="flex items-center justify-between gap-3">
        <LocaleLink
          href={backHref}
          locale={locale}
          className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          ← {p.back}
        </LocaleLink>
        <h1 className="font-serif text-lg tracking-wide text-[var(--ink)]">{title}</h1>
        <span className="w-10" />
      </header>

      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm tabular-nums shadow-sm ${
          chainFlash
            ? 'bg-[#e8c4b8] font-semibold text-[#8b2e22] ring-2 ring-[var(--danger)]/40'
            : 'bg-[var(--panel)] text-[var(--ink)] ring-1 ring-[#5c6b52]/15'
        }`}
      >
        <span className="font-semibold">{fmt(p.eaten, { n: state.eatenSheep })}</span>
        <span>{fmt(p.sheepLeft, { n: sheepLeft })}</span>
        <span
          className={`inline-flex items-center gap-1.5 ${thinking ? 'font-medium text-[var(--muted)]' : ''}`}
          aria-live="polite"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              thinking || state.toMove === 'sheep' ? 'bg-[var(--muted)]' : 'bg-[var(--accent)]'
            }`}
          />
          {turnLabel(uiPhase, state, p)}
        </span>
        {doubleLeft && (
          <span className="w-full text-xs text-[var(--muted)]">{fmt(p.doubleLeft, { t: doubleLeft })}</span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-1">
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
          <div className="absolute inset-0 z-10 cursor-default rounded-xl bg-black/[0.03]" aria-hidden />
        )}
      </div>

      {state.chain && uiPhase === 'playing' && (
        <button
          type="button"
          onClick={endChain}
          className="rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-[#f4f1ea] active:scale-[0.97]"
        >
          {p.endChain}
        </button>
      )}

      {uiPhase === 'terminal' && (
        <div className="rounded-xl bg-[var(--panel)] p-4 text-center ring-1 ring-[#5c6b52]/20">
          <p className="font-serif text-2xl text-[var(--ink)]">
            {state.status === 'won' ? p.win : p.lose}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {state.status === 'won' ? p.winSub : p.loseSub}
          </p>
          {adBusy && <p className="mt-1 text-xs text-[#7a8574]">{p.preparing}</p>}
          {state.status === 'won' && lastGrant && (
            <GrantLine grant={lastGrant} labels={p} locale={locale} />
          )}
          <p className="mt-2 text-xs text-[#7a8574]">{fmt(p.universal, { n: save.fragments.universal })}</p>
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
              className="w-full max-w-xs rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[#f4f1ea] disabled:opacity-50 active:scale-[0.97]"
            >
              {p.again}
            </button>
            {state.status === 'won' && !isDoubleDropActive(save) && (
              <button
                type="button"
                disabled={adBusy}
                onClick={() => void watchDouble()}
                className="text-sm text-[var(--muted)] underline-offset-2 hover:underline disabled:opacity-50"
              >
                {p.doubleAd}
              </button>
            )}
            <LocaleLink
              href={backHref}
              locale={locale}
              className="px-4 py-2 text-sm text-[var(--ink)] underline-offset-2 hover:underline"
            >
              {p.levelList}
            </LocaleLink>
          </div>
        </div>
      )}

      {uiPhase !== 'terminal' && (
        <p className="text-center text-xs text-[#7a8574]">{p.tip}</p>
      )}

      <footer className="mt-auto flex items-center justify-around border-t border-[#5c6b52]/15 pt-2">
        <button
          type="button"
          onClick={confirmReset}
          className={`min-h-11 min-w-[4.5rem] rounded-lg px-3 py-2 text-sm active:scale-[0.97] ${
            resetArmed ? 'bg-[#e8c4b8]/50 font-medium text-[#8b2e22]' : 'text-[var(--ink)]'
          }`}
        >
          {resetArmed ? p.resetConfirm : p.reset}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="min-h-11 min-w-[4.5rem] rounded-lg px-3 py-2 text-sm text-[var(--ink)] active:scale-[0.97]"
          aria-pressed={muted}
        >
          {muted ? p.unmute : p.mute}
        </button>
        <LocaleLink
          href={backHref}
          locale={locale}
          className="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-lg px-3 py-2 text-sm text-[var(--ink)]"
        >
          {p.exit}
        </LocaleLink>
      </footer>

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2c3328]/45 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-xl bg-[var(--panel)] p-5 shadow-lg">
            <p className="font-serif text-lg text-[var(--ink)]">{p.guideTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {guideStep === 0 ? p.guideStep1 : p.guideStep2}
            </p>
            <div className="mt-4 flex justify-between gap-2">
              <button
                type="button"
                className="text-sm text-[#7a8574] underline-offset-2 hover:underline"
                onClick={finishGuide}
              >
                {p.guideSkip}
              </button>
              {guideStep === 0 ? (
                <button
                  type="button"
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[#f4f1ea]"
                  onClick={() => setGuideStep(1)}
                >
                  {p.guideNext}
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[#f4f1ea]"
                  onClick={finishGuide}
                >
                  {p.guideStart}
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
  p: MessageTree['play'],
): string {
  if (uiPhase === 'aiThinking') return p.turnSheep
  if (state.toMove === 'wolf') {
    return state.chain ? fmt(p.chain, { n: state.chain.count }) : p.turnWolf
  }
  return p.turnSheep
}

function GrantLine({
  grant,
  labels,
  locale,
}: {
  grant: DropGrant
  labels: MessageTree['play']
  locale: 'en' | 'zh'
}) {
  const seasonName: Record<string, { en: string; zh: string }> = {
    spring: { en: 'Spring', zh: '春' },
    summer: { en: 'Summer', zh: '夏' },
    autumn: { en: 'Autumn', zh: '秋' },
    winter: { en: 'Winter', zh: '冬' },
  }
  const seasonBits = Object.entries(grant.season)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([k, v]) => `${seasonName[k]?.[locale] ?? k}+${v}`)
    .join(' ')
  if (grant.universal === 0 && !seasonBits) {
    return <p className="mt-2 text-sm text-[var(--muted)]">{labels.noDrop}</p>
  }
  const sep = locale === 'zh' ? '：' : ': '
  return (
    <p className="mt-2 text-sm text-[var(--ink)]">
      {grant.firstClear ? labels.firstClear : labels.repeatClear}
      {grant.doubled ? labels.doubled : ''}
      {sep}+{grant.universal}
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
