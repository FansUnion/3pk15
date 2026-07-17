'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  activateDoubleDrop,
  adjacentLevels,
  applyClearToSave,
  createSeededRng,
  isDoubleDropActive,
  levelDisplayName,
  recordPlayStarted,
  resolveSkin,
  rollClearReward,
  type DropGrant,
  type BoardState,
  type LevelConfig,
} from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { getAds } from '@/lib/ads'
import { usePlayStore } from '@/lib/play-store'
import { useSaveStore } from '@/lib/save-store'
import { playSfx } from '@/lib/sfx'
import { fmt, getMessages, type MessageTree } from '@/i18n/messages'
import { useClientMessages } from '@/i18n/use-client-locale'

type Props = {
  level: LevelConfig
  adminMode?: boolean
  onAdminAttempt?: () => void
  onAdminTerminal?: (state: BoardState) => void
  localeOverride?: 'en' | 'zh'
}

export function PlayScreen({ level, adminMode = false, onAdminAttempt, onAdminTerminal, localeOverride }: Props) {
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
  const hydrated = useSaveStore((s) => s.hydrated)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const lastGrant = useSaveStore((s) => s.lastGrant)
  const setLastGrant = useSaveStore((s) => s.setLastGrant)

  const rewardedRef = useRef(false)
  const playCountedRef = useRef(false)
  const [adBusy, setAdBusy] = useState(false)
  const [adError, setAdError] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const [resetArmed, setResetArmed] = useState(false)
  const resetArmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, setTick] = useState(0)
  const prevEaten = useRef(0)
  const terminalSfxDone = useRef(false)
  const terminalReportedRef = useRef(false)
  const [adminMuted, setAdminMuted] = useState(false)
  const muted = adminMode ? adminMuted : (save.settings?.muted ?? false)
  const clientMessages = useClientMessages()
  const locale = localeOverride ?? clientMessages.locale
  const t = localeOverride ? getMessages(localeOverride) : clientMessages.t
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
    if (!muted && uiPhase === 'aiThinking') playSfx('ai')
  }, [muted, uiPhase])

  useEffect(() => {
    if (uiPhase !== 'terminal' || muted || terminalSfxDone.current) return
    terminalSfxDone.current = true
    playSfx(state.status === 'won' ? 'win' : 'lose')
  }, [uiPhase, state.status, muted])

  useEffect(() => {
    rewardedRef.current = false
    playCountedRef.current = false
    terminalReportedRef.current = false
    terminalSfxDone.current = false
    setLastGrant(null)
    init(level.id, level.rocks, level.ai, level.targetEaten, level.maxPlies, level.opening)
  }, [level.id, level.ai, level.rocks, level.targetEaten, level.maxPlies, level.opening, init, setLastGrant])

  useEffect(() => {
    if (adminMode) {
      onAdminAttempt?.()
      return
    }
    if (playCountedRef.current) return
    playCountedRef.current = true
    const current = useSaveStore.getState().save
    replace(recordPlayStarted(current, level.id))
  }, [adminMode, level.id, onAdminAttempt, replace])

  useEffect(() => {
    return () => {
      if (resetArmTimer.current) clearTimeout(resetArmTimer.current)
    }
  }, [])

  useEffect(() => {
    if (adminMode || !hydrated || level.id !== 'spring-01') return
    if (save.guide.spring1Done) return
    setGuideOpen(true)
    setGuideStep(0)
  }, [adminMode, hydrated, level.id, save.guide.spring1Done])

  useEffect(() => {
    if (adminMode || level.id !== 'spring-01' || save.guide.spring1Done) return
    if (state.eatenSheep > prevEaten.current) {
      completeGuide()
    }
    prevEaten.current = state.eatenSheep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminMode, level.id, state.eatenSheep, save.guide.spring1Done])

  useEffect(() => {
    if (!guideOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') skipGuide()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // finishGuide is stable for this mounted screen; the listener only tracks the modal state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideOpen])

  useEffect(() => {
    if (adminMode) return
    if (uiPhase !== 'terminal' || rewardedRef.current) return
    rewardedRef.current = true

    if (state.status === 'won') {
      const current = useSaveStore.getState().save
      const grant = rollClearReward(level, current, createSeededRng(Date.now()))
      const next = applyClearToSave(current, level, grant)
      replace(next)
      setLastGrant(grant)
    }
  }, [adminMode, uiPhase, state.status, level, replace, setLastGrant])

  useEffect(() => {
    if (!adminMode || uiPhase !== 'terminal' || terminalReportedRef.current) return
    terminalReportedRef.current = true
    onAdminTerminal?.(state)
  }, [adminMode, onAdminTerminal, state, uiPhase])

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
  const backHref = adminMode ? '/admin/levels' : `/levels/${level.chapterId}`
  const doubleLeft = doubleDropLabel(save.buffs.doubleDropUntil)
  const thinking = uiPhase === 'aiThinking'
  const chainFlash = Boolean(state.chain && uiPhase === 'playing')
  const title = levelDisplayName(level, locale)
  const nextLevel = adjacentLevels(level.id).next
  const firstLessonActive = !adminMode && level.id === 'spring-01' && !save.guide.spring1Done
  const lessonTip = firstLessonActive
    ? thinking || state.toMove === 'sheep'
      ? p.guideWaitSheep
      : state.plyCount === 0 && !selectedWolfId
        ? p.guideSelectWolf
        : state.plyCount === 0
          ? p.guideMoveGreen
          : p.guideFindCapture
    : p.tip

  function completeGuide() {
    setGuideOpen(false)
    if (adminMode) return
    const current = useSaveStore.getState().save
    if (!current.guide.spring1Done) {
      replace({ ...current, guide: { ...current.guide, spring1Done: true } })
    }
  }

  function skipGuide() {
    completeGuide()
  }

  async function watchDouble() {
    setAdError(false)
    setAdBusy(true)
    const res = await getAds().showRewarded('double_drop')
    setAdBusy(false)
    if (!res.ok) {
      setAdError(true)
      return
    }
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
    terminalReportedRef.current = false
    setLastGrant(null)
    reset()
    if (adminMode) onAdminAttempt?.()
    else replace(recordPlayStarted(useSaveStore.getState().save, level.id))
    playCountedRef.current = true
  }

  function toggleMute() {
    if (adminMode) {
      setAdminMuted((value) => !value)
      return
    }
    const current = useSaveStore.getState().save
    replace({
      ...current,
      settings: { ...current.settings, muted: !(current.settings?.muted ?? false) },
    })
  }

  function handleSelectWolf(wolfId: string) {
    if (interactive && wolfId !== selectedWolfId) playSfx('select')
    selectWolf(wolfId)
  }

  function handleClickCell(pos: { r: number; c: number }) {
    if (!interactive) return
    if (!selectedWolfId) {
      playSfx('invalid')
      return
    }
    clickCell(pos)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-3 px-4 pb-4 pt-5">
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
        className={`game-panel flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm tabular-nums ${
          chainFlash
            ? 'bg-[#e8c4b8] font-semibold text-[#8b2e22] ring-2 ring-[var(--danger)]/40'
            : 'text-[var(--ink)]'
        }`}
      >
        <span className="game-stat"><strong>{fmt(p.eaten, { n: state.eatenSheep })}</strong></span>
        <span className="game-stat"><strong>{fmt(p.sheepLeft, { n: sheepLeft })}</strong></span>
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
          {!adminMode && doubleLeft && (
          <span className="w-full text-xs text-[var(--muted)]">{fmt(p.doubleLeft, { t: doubleLeft })}</span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-2">
        <BoardSvg
          state={state}
          selectedWolfId={selectedWolfId}
          stepHighlights={highlights.steps}
          jumpHighlights={highlights.jumps}
          jumpThroughs={highlights.throughs}
          juice={juice}
          interactive={interactive}
          onSelectWolf={handleSelectWolf}
          onClickCell={handleClickCell}
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
        <div className="game-panel victory-pop p-5 text-center">
          <p className="eyebrow">{state.status === 'won' ? p.win : state.status === 'draw' ? p.draw : p.lose}</p>
          <p className="font-serif text-2xl text-[var(--ink)]">
            {state.status === 'won' ? p.win : state.status === 'draw' ? p.draw : p.lose}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {state.status === 'won' ? p.winSub : state.status === 'draw' ? p.drawSub : p.loseSub}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
            {state.status === 'won'
              ? p.winAdvice
              : state.status === 'draw'
                ? p.drawAdvice
                : level.id === 'spring-01'
                  ? p.firstLoseAdvice
                  : p.loseAdvice}
          </p>
          {adBusy && <p className="mt-1 text-xs text-[#7a8574]">{p.preparing}</p>}
          {adError && <p role="status" className="mt-1 text-xs text-[#8b2e22]">{p.adFailed}</p>}
          {!adminMode && state.status === 'won' && lastGrant && (
            <GrantLine grant={lastGrant} labels={p} locale={locale} />
          )}
          {!adminMode && <p className="mt-2 text-xs text-[#7a8574]">{fmt(p.universal, { n: save.fragments.universal })}</p>}
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              type="button"
              disabled={adBusy}
              onClick={() => {
                rewardedRef.current = false
                playCountedRef.current = false
                terminalReportedRef.current = false
                setLastGrant(null)
                reset()
                if (adminMode) onAdminAttempt?.()
                else replace(recordPlayStarted(useSaveStore.getState().save, level.id))
                playCountedRef.current = true
              }}
              className="primary-action w-full max-w-xs disabled:opacity-50"
            >
              {p.again}
            </button>
            {!adminMode && state.status === 'won' && !isDoubleDropActive(save) && (
              <button
                type="button"
                disabled={adBusy}
                onClick={() => void watchDouble()}
                className="text-sm text-[var(--muted)] underline-offset-2 hover:underline disabled:opacity-50"
              >
                {p.doubleAd}
              </button>
            )}
            {!adminMode && state.status === 'won' && nextLevel && nextLevel.chapterId === level.chapterId && (
              <LocaleLink
                href={`/play/${nextLevel.id}`}
                locale={locale}
                className="primary-action w-full max-w-xs text-center"
              >
                {p.nextLevel}
              </LocaleLink>
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
        <p
          className={`status-chip justify-center text-center text-xs ${firstLessonActive ? 'font-medium text-[var(--ink)]' : 'text-[var(--muted)]'}`}
          aria-live="polite"
        >
          {lessonTip}
        </p>
      )}

      <footer className="mt-auto flex items-center justify-around rounded-2xl border border-[var(--line)] bg-[var(--paper)]/75 pt-1 shadow-sm">
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
          href={adminMode ? '/admin/levels' : '/'}
          locale={locale}
          className="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-lg px-3 py-2 text-sm text-[var(--ink)]"
        >
          {p.exit}
        </LocaleLink>
      </footer>

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2c3328]/45 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="guide-title" className="w-full max-w-sm rounded-xl bg-[var(--panel)] p-5 shadow-lg">
            <h2 id="guide-title" className="font-serif text-lg text-[var(--ink)]">{p.guideTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {guideStep === 0 ? p.guideStep1 : p.guideStep2}
            </p>
            <div className="mt-4 flex justify-between gap-2">
              <button
                type="button"
                className="text-sm text-[#7a8574] underline-offset-2 hover:underline"
                onClick={skipGuide}
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
                  onClick={() => setGuideOpen(false)}
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
