'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  adjacentLevels,
  applyClearToSave,
  claimableQuestCount,
  createSeededRng,
  grantUniversalFragments,
  levelDisplayName,
  nextUniversalSkinTarget,
  boardPositionKey,
  listWolfActionsAsIfTurn,
  recordPlayStarted,
  recordGuideHint,
  recordGuideResult,
  rewardedFragmentAmount,
  REPETITION_DRAW_COUNT,
  REPETITION_STRONG_WARNING_COUNT,
  REPETITION_WARNING_COUNT,
  resolveSkin,
  rollClearReward,
  type DropGrant,
  type BoardState,
  type LevelConfig,
} from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'
import { HelpContent } from '@/components/HelpContent'
import { LocaleLink, LocaleSwitcher } from '@/components/LocaleSwitcher'
import { getPlatform } from '@/lib/platform'
import { shareResult, type ShareOutcome } from '@/lib/share-result'
import { buildPlayerReproductionBundle, downloadPlayerReproductionBundle } from '@/lib/reproduction-bundle'
import { usePlayStore } from '@/lib/play-store'
import { useSaveStore } from '@/lib/save-store'
import { playSfx, prepareSfx, resumeSfx, suspendSfx } from '@/lib/sfx'
import { actionSoundFor } from '@/lib/sfx-policy'
import {
  beginPlayAttempt,
  finishPlayAttempt,
  resumePlayAttempt,
  type PlayAttemptMetric,
  type TerminalAttemptDetails,
} from '@/lib/play-metrics'
import { fmt, getMessages, type MessageTree } from '@/i18n/messages'
import { buildLevelGuidance } from '@/i18n/level-guidance'
import { useClientMessages } from '@/i18n/use-client-locale'

type Props = {
  level: LevelConfig
  adminMode?: boolean
  onAdminAttempt?: () => void
  onAdminTerminal?: (state: BoardState, details: TerminalAttemptDetails) => void
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
  const resumed = usePlayStore((s) => s.resumed)
  const aiError = usePlayStore((s) => s.aiError)
  const retryAi = usePlayStore((s) => s.retryAi)
  const aiSeed = usePlayStore((s) => s.seed)
  const initialAiSeed = usePlayStore((s) => s.initialSeed)
  const actionHistory = usePlayStore((s) => s.actionHistory)
  const aiMemory = usePlayStore((s) => s.aiMemory)

  const save = useSaveStore((s) => s.save)
  const hydrated = useSaveStore((s) => s.hydrated)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const lastGrant = useSaveStore((s) => s.lastGrant)
  const setLastGrant = useSaveStore((s) => s.setLastGrant)

  const rewardedRef = useRef(false)
  const gameplayStartedRef = useRef(false)
  const playCountedRef = useRef(false)
  const [adBusy, setAdBusy] = useState(false)
  const [adError, setAdError] = useState<string | null>(null)
  const [adBonusGranted, setAdBonusGranted] = useState<number | null>(null)
  const [shareBusy, setShareBusy] = useState(false)
  const [shareStatus, setShareStatus] = useState<ShareOutcome | 'failed' | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [resetArmed, setResetArmed] = useState(false)
  const resetArmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [interactionNotice, setInteractionNotice] = useState<string | null>(null)
  const [audioBlocked, setAudioBlocked] = useState(false)
  const prevEaten = useRef(0)
  const terminalSfxDone = useRef(false)
  const terminalReportedRef = useRef(false)
  const guidanceReportedRef = useRef(false)
  const attemptRef = useRef<PlayAttemptMetric | null>(null)
  const attemptStartedAtRef = useRef(Date.now())
  const firstCapturePlyRef = useRef<number | null>(null)
  const [terminalDetails, setTerminalDetails] = useState<TerminalAttemptDetails | null>(null)
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [adminMuted, setAdminMuted] = useState(false)
  const [platformMuted, setPlatformMuted] = useState(false)
  const muted = adminMode ? adminMuted : platformMuted || (save.settings?.muted ?? false)
  const clientMessages = useClientMessages()
  const locale = localeOverride ?? clientMessages.locale
  const t = localeOverride ? getMessages(localeOverride) : clientMessages.t
  const p = t.play
  const rewardedAdsAvailable = getPlatform().ads.isRewardedAvailable?.() ?? false
  const nextWolfSkin = nextUniversalSkinTarget(save)
  const claimableQuests = claimableQuestCount(save)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (adminMode) return
    const platform = getPlatform()
    platform.loadingFinished()
    return () => platform.gameplayStop()
  }, [adminMode])

  useEffect(() => {
    if (adminMode) return
    const platform = getPlatform()
    setPlatformMuted(platform.isAudioMuted())
    return platform.subscribeAudioMuted(setPlatformMuted)
  }, [adminMode])

  useEffect(() => {
    if (adminMode) return
    function onVisibilityChange() {
      if (document.hidden) {
        getPlatform().gameplayStop()
      } else if (gameplayStartedRef.current && uiPhase !== 'terminal') {
        getPlatform().gameplayStart()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [adminMode, uiPhase])

  useEffect(() => {
    if (adminMode || uiPhase !== 'playing' || getPlatform().kind === 'standalone') return
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault()
    }
    function onWheel(event: WheelEvent) {
      event.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', onWheel)
    }
  }, [adminMode, uiPhase])

  useEffect(() => {
    if (muted || !juice) return
    const play = async (kind: Parameters<typeof playSfx>[0]) => setAudioBlocked(await playSfx(kind) === 'blocked')
    const newlyTrapped = juice.newlyTrappedWolfIds?.length ?? 0
    void play(actionSoundFor({
      kind: juice.kind,
      side: juice.side,
      chainCount: state.chain?.count ?? 0,
      newlyTrappedWolfCount: newlyTrapped,
    }))
    if (newlyTrapped > 0 && state.status === 'playing') {
      setInteractionNotice(p.wolfTrapped)
      if (noticeTimer.current) clearTimeout(noticeTimer.current)
      noticeTimer.current = setTimeout(() => setInteractionNotice(null), 2400)
    }
  }, [juice, muted, state.chain, state.status, p.wolfTrapped])

  useEffect(() => {
    if (muted) void suspendSfx()
    else void resumeSfx()
  }, [muted])

  useEffect(() => {
    if (uiPhase !== 'terminal' || muted || terminalSfxDone.current) return
    terminalSfxDone.current = true
    void playSfx(state.status === 'won' ? 'win' : state.status === 'draw' ? 'draw' : 'lose')
  }, [uiPhase, state.status, muted])

  useEffect(() => {
    if (uiPhase === 'terminal') setTerminalOpen(true)
  }, [uiPhase])

  useEffect(() => {
    if (uiPhase !== 'terminal' || !terminalOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setTerminalOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [terminalOpen, uiPhase])

  useEffect(() => {
    rewardedRef.current = false
    playCountedRef.current = false
    terminalReportedRef.current = false
    guidanceReportedRef.current = false
    terminalSfxDone.current = false
    gameplayStartedRef.current = false
    attemptStartedAtRef.current = Date.now()
    firstCapturePlyRef.current = null
    prevEaten.current = 0
    setTerminalDetails(null)
    setLastGrant(null)
    setAdBonusGranted(null)
    setAdError(null)
    init(level.id, level.rocks, level.aiProfile, level.targetEaten, level.maxPlies, level.opening, !adminMode)
  }, [adminMode, level.id, level.aiProfile, level.rocks, level.targetEaten, level.maxPlies, level.opening, init, setLastGrant])

  useEffect(() => {
    if (adminMode) {
      onAdminAttempt?.()
      return
    }
    if (usePlayStore.getState().resumed) return
    if (playCountedRef.current) return
    playCountedRef.current = true
    const current = useSaveStore.getState().save
    replace(recordPlayStarted(current, level.id))
  }, [adminMode, level.id, onAdminAttempt, replace, resumed])

  useEffect(() => {
    if (adminMode || !hydrated || attemptRef.current?.levelId === level.id) return
    const currentResumed = usePlayStore.getState().resumed
    attemptRef.current = currentResumed ? resumePlayAttempt(level.id) ?? beginPlayAttempt(level.id) : beginPlayAttempt(level.id)
    attemptStartedAtRef.current = Date.now()
  }, [adminMode, hydrated, level.id, resumed])

  useEffect(() => {
    return () => {
      if (resetArmTimer.current) clearTimeout(resetArmTimer.current)
      if (noticeTimer.current) clearTimeout(noticeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (adminMode || !hydrated || level.id !== 'spring-01') return
    if (save.guide.spring1Done) return
    setGuideOpen(true)
    setGuideStep(0)
  }, [adminMode, hydrated, level.id, save.guide.spring1Done])

  useEffect(() => {
    if (state.eatenSheep > prevEaten.current) {
      if (firstCapturePlyRef.current === null) firstCapturePlyRef.current = state.plyCount
      if (!adminMode && level.id === 'spring-01' && !save.guide.spring1Done) completeGuide()
    }
    prevEaten.current = state.eatenSheep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminMode, level.id, state.eatenSheep, state.plyCount, save.guide.spring1Done])

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
    if (!helpOpen && !hintOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setHelpOpen(false)
      setHintOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [helpOpen, hintOpen])

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
    if (uiPhase !== 'terminal' || terminalReportedRef.current) return
    if (!adminMode) getPlatform().gameplayStop()
    terminalReportedRef.current = true
    const details: TerminalAttemptDetails = {
      durationMs: Math.max(0, Date.now() - attemptStartedAtRef.current),
      firstCapturePly: firstCapturePlyRef.current,
      attemptNumber: attemptRef.current?.attemptNumber ?? 1,
    }
    setTerminalDetails(details)
    if (adminMode) {
      onAdminTerminal?.(state, details)
      return
    }
    if (attemptRef.current) {
      finishPlayAttempt(attemptRef.current.id, {
        endedAt: new Date().toISOString(),
        durationMs: details.durationMs,
        result: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
        terminalReason: terminalReason(state),
        plies: state.plyCount,
        eatenSheep: state.eatenSheep,
        firstCapturePly: details.firstCapturePly,
      })
    }
  }, [adminMode, onAdminTerminal, state, uiPhase])

  useEffect(() => {
    if (adminMode || uiPhase !== 'terminal' || guidanceReportedRef.current) return
    guidanceReportedRef.current = true
    replace(recordGuideResult(useSaveStore.getState().save, level.id, state.status === 'won'))
  }, [adminMode, level.id, replace, state.status, uiPhase])

  const theme = useMemo(() => {
    const { wolfSet, board } = resolveSkin(save, level.chapterId)
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
  }, [level.chapterId, save])

  const sheepLeft = state.pieces.filter((piece) => piece.side === 'sheep').length
  const interactive = uiPhase === 'playing' && state.toMove === 'wolf'
  const backHref = adminMode ? '/admin/levels' : `/levels/${level.chapterId}`
  const adBonusAmount = rewardedFragmentAmount(lastGrant)
  const adRemainingAfter = nextWolfSkin
    ? Math.max(0, nextWolfSkin.cost - save.fragments.universal - adBonusAmount)
    : 0
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
  const failureStreak = save.guide.failureStreak[level.id] ?? 0
  const guidancePoints = buildLevelGuidance(level, locale)
  const hintTemplates = [p.hintObserve, p.hintGoal, p.hintStrategy]

  function openHint() {
    setHintLevel(0)
    setHintOpen(true)
    if (!adminMode) replace(recordGuideHint(useSaveStore.getState().save, level.id))
  }

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

  async function watchRewardBonus() {
    setAdError(null)
    setAdBusy(true)
    const res = await getPlatform().ads.showRewarded('fragment_topup', {
      onStart: async () => {
        getPlatform().gameplayStop()
        await suspendSfx()
      },
      onFinish: () => muted ? undefined : resumeSfx(),
    })
    setAdBusy(false)
    if (!res.ok) {
      setAdError(res.reason)
      return
    }
    replace(grantUniversalFragments(useSaveStore.getState().save, adBonusAmount, 'ad'))
    setAdBonusGranted(adBonusAmount)
  }

  async function shareTerminalResult() {
    setShareBusy(true)
    setShareStatus(null)
    try {
      const result = state.status === 'won' ? 'won' : state.status === 'draw' ? 'draw' : 'lost'
      const outcome = await shareResult({
        levelId: level.id,
        levelName: title,
        result,
        plies: state.plyCount,
        eatenSheep: state.eatenSheep,
        reason: terminalReasonLabel(terminalReason(state), p),
        state,
        url: getPlatform().shareUrl(level.id),
      }, locale)
      setShareStatus(outcome)
    } catch {
      setShareStatus('failed')
    } finally {
      setShareBusy(false)
    }
  }

  function confirmReset() {
    if (!resetArmed) {
      setResetArmed(true)
      if (resetArmTimer.current) clearTimeout(resetArmTimer.current)
      resetArmTimer.current = setTimeout(() => setResetArmed(false), 2000)
      return
    }
    if (resetArmTimer.current) clearTimeout(resetArmTimer.current)
    if (!adminMode) getPlatform().gameplayStop()
    gameplayStartedRef.current = false
    setResetArmed(false)
    setMoreOpen(false)
    rewardedRef.current = false
    playCountedRef.current = false
    terminalReportedRef.current = false
    guidanceReportedRef.current = false
    attemptRef.current = adminMode ? null : beginPlayAttempt(level.id)
    attemptStartedAtRef.current = Date.now()
    firstCapturePlyRef.current = null
    setTerminalDetails(null)
    setLastGrant(null)
    setAdBonusGranted(null)
    setAdError(null)
    reset()
    if (adminMode) onAdminAttempt?.()
    else replace(recordPlayStarted(useSaveStore.getState().save, level.id))
    playCountedRef.current = true
  }

  function restartAttempt() {
    rewardedRef.current = false
    playCountedRef.current = false
    terminalReportedRef.current = false
    guidanceReportedRef.current = false
    attemptRef.current = adminMode ? null : beginPlayAttempt(level.id)
    attemptStartedAtRef.current = Date.now()
    firstCapturePlyRef.current = null
    setTerminalDetails(null)
    setLastGrant(null)
    setAdBonusGranted(null)
    setAdError(null)
    setTerminalOpen(true)
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
    void prepareSfx()
    if (interactive && !adminMode) {
      gameplayStartedRef.current = true
      getPlatform().gameplayStart()
    }
    if (interactive && wolfId !== selectedWolfId) playSfx('select')
    selectWolf(wolfId)
    if (interactive) showNotice(p.wolfSelected)
  }

  function handleClickCell(pos: { r: number; c: number }) {
    if (!interactive) return
    if (!selectedWolfId) {
      playSfx('invalid')
      showNotice(p.selectWolfFirst)
      return
    }
    const legalTarget = [...highlights.steps, ...highlights.jumps, ...highlights.throughs]
      .some((target) => target.r === pos.r && target.c === pos.c)
    const wolfAtTarget = state.pieces.some((piece) => piece.side === 'wolf' && piece.r === pos.r && piece.c === pos.c)
    if (!legalTarget && !wolfAtTarget) {
      playSfx('invalid')
      showNotice(p.invalidTarget)
      return
    }
    clickCell(pos)
  }

  function handleEndChain() {
    if (!adminMode) {
      gameplayStartedRef.current = true
      getPlatform().gameplayStart()
    }
    endChain()
  }

  function showNotice(message: string) {
    setInteractionNotice(message)
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setInteractionNotice(null), 1600)
  }

  function reportCurrentGame() {
    downloadPlayerReproductionBundle(buildPlayerReproductionBundle({
      state,
      aiProfile: level.aiProfile,
      initialAiSeed,
      nextAiSeed: aiSeed,
      actions: actionHistory,
      aiMemory,
      muted,
    }))
    setMoreOpen(false)
    showNotice(p.reportReady)
  }

  const repetitionCount = state.repetitionCounts.get(boardPositionKey(state)) ?? 0
  const repetitionMessage = repetitionCount >= REPETITION_STRONG_WARNING_COUNT
    ? p.repetitionStrongWarning
    : repetitionCount >= REPETITION_WARNING_COUNT
      ? fmt(p.repetitionWarning, { n: repetitionCount })
      : null

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-3 px-4 pb-4 pt-5">
      <header className="flex items-center justify-between gap-3">
        <ScopedLink
          adminMode={adminMode}
          href={backHref}
          locale={locale}
          className="quiet-action min-h-11 px-3 text-sm text-[var(--muted)]"
        >
          ← {p.back}
        </ScopedLink>
        <h1 className="font-serif text-lg tracking-wide text-[var(--ink)]">{title}</h1>
        <button type="button" onClick={() => setMoreOpen(true)} aria-label={p.more} title={p.more} className="quiet-action grid h-11 w-11 place-items-center px-0 text-xl text-[var(--ink)]">⋯</button>
      </header>

      <div
        className={`game-panel flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm tabular-nums ${
          chainFlash
            ? 'bg-[#e8c4b8] font-semibold text-[#8b2e22] ring-2 ring-[var(--danger)]/40'
            : 'text-[var(--ink)]'
        }`}
      >
        <span className="game-stat flex-1 text-center sm:flex-none"><strong>{fmt(p.eaten, { n: state.eatenSheep, target: state.targetEaten })}</strong></span>
        <span className="game-stat flex-1 text-center sm:flex-none"><strong>{fmt(p.sheepLeft, { n: sheepLeft })}</strong></span>
        <span
          className={`inline-flex w-full items-center justify-center gap-1.5 sm:w-auto ${thinking ? 'font-medium text-[var(--muted)]' : ''}`}
          aria-live="polite"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              thinking || state.toMove === 'sheep' ? 'bg-[var(--muted)]' : 'bg-[var(--accent)]'
            }`}
          />
          {uiPhase === 'terminal' ? p.gameEnded : turnLabel(uiPhase, state, p)}
        </span>
      </div>

      {uiPhase === 'playing' && repetitionMessage && (
        <div role="status" className="rounded-lg border border-[#b9872f]/35 bg-[#fff8df] px-3 py-2 text-center text-sm leading-relaxed text-[#6b4a16]">
          {repetitionMessage}
        </div>
      )}

      <div className="relative flex flex-1 flex-col items-center justify-center py-2">
        <BoardSvg
          state={state}
          selectedWolfId={uiPhase === 'terminal' ? null : selectedWolfId}
          stepHighlights={highlights.steps}
          jumpHighlights={highlights.jumps}
          jumpThroughs={highlights.throughs}
          juice={juice}
          interactive={interactive}
          actionBarVisible={Boolean(state.chain && uiPhase === 'playing')}
          onSelectWolf={handleSelectWolf}
          onClickCell={handleClickCell}
          theme={theme}
        />
        {thinking && (
          <div className="absolute inset-0 z-10 cursor-default rounded-xl bg-black/[0.03]" aria-hidden />
        )}
      </div>

      {state.chain && uiPhase === 'playing' && (
        <div className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-30 mx-auto grid max-w-lg gap-2 rounded-lg border border-[var(--accent)]/35 bg-[var(--paper)] p-3 shadow-xl">
          <p className="text-center text-sm leading-relaxed text-[var(--ink)]">{p.chainDecision}</p>
          <button
            type="button"
            onClick={handleEndChain}
            className="rounded-lg bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-[#f4f1ea] active:scale-[0.97]"
          >
            {fmt(p.endChainCount, { n: state.chain.count })}
          </button>
        </div>
      )}

      {uiPhase === 'error' && (
        <div role="alert" className="grid gap-2 rounded-lg border border-[var(--danger)]/40 bg-[#fff8f5] p-3 text-center">
          <p className="text-sm font-medium text-[#8b2e22]">{p.aiError}</p>
          <p className="text-xs text-[var(--muted)]">{aiError ?? p.aiErrorFallback}</p>
          <button type="button" onClick={retryAi} className="rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[#f4f1ea]">{p.retryAi}</button>
        </div>
      )}

      {uiPhase === 'terminal' && terminalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/25 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="terminal-result-title" className="game-panel victory-pop relative w-full max-w-md p-5 text-center">
            <button type="button" onClick={() => setTerminalOpen(false)} aria-label={p.closeResult} title={p.closeResult} className="absolute right-3 top-3 grid h-11 w-11 place-items-center text-2xl text-[var(--muted)]">×</button>
            <h2 id="terminal-result-title" className="pr-10 font-serif text-2xl text-[var(--ink)]">
              {state.status === 'won' ? p.win : state.status === 'draw' ? p.draw : p.lose}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {state.status === 'won' ? fmt(p.winSub, { target: state.targetEaten }) : state.status === 'draw' ? drawSubtitle(state, p) : p.loseSub}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
              {state.status === 'won' ? p.winAdvice : state.status === 'draw' ? p.drawAdvice : level.id === 'spring-01' ? p.firstLoseAdvice : p.loseAdvice}
            </p>

            {!adminMode && state.status === 'won' && lastGrant && (
              <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-3 text-left">
                <GrantLine grant={lastGrant} labels={p} locale={locale} />
              </div>
            )}

            {!adminMode && claimableQuests > 0 && (
              <LocaleLink href="/quests" locale={locale} className="mt-3 block rounded-lg border border-[var(--line)] bg-[#eef1eb] px-3 py-2 text-sm font-medium text-[#40513c]">
                {fmt(p.questReady, { n: claimableQuests })} →
              </LocaleLink>
            )}

            <div className="mt-4 grid gap-2">
              {!adminMode && state.status === 'won' ? (
                nextLevel ? (
                  <div className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3 text-left">
                    <p className="text-xs text-[var(--muted)]">{p.nextPreview}</p>
                    <p className="mt-1 font-serif text-lg text-[var(--ink)]">{levelDisplayName(nextLevel, locale)}</p>
                    <LocaleLink href={`/play/${nextLevel.id}`} locale={locale} className="primary-action mt-3 w-full justify-center text-center">{p.nextLevel}</LocaleLink>
                  </div>
                ) : (
                  <LocaleLink href="/chapters" locale={locale} className="primary-action w-full justify-center text-center">{p.allSeasons}</LocaleLink>
                )
              ) : (
                <button type="button" onClick={restartAttempt} className="primary-action w-full justify-center">{p.again}</button>
              )}
              {!adminMode && rewardedAdsAvailable && nextWolfSkin && state.status === 'won' && adBonusGranted === null && (
                <button type="button" disabled={adBusy} onClick={() => void watchRewardBonus()} className="primary-action w-full justify-center disabled:opacity-50">
                  {adBusy
                    ? p.preparing
                    : `▶ ${fmt(adRemainingAfter === 0 ? p.rewardAdUnlock : p.rewardAdTarget, {
                        n: adBonusAmount,
                        name: locale === 'zh' ? nextWolfSkin.nameZh : nextWolfSkin.nameEn,
                        remaining: adRemainingAfter,
                      })}`}
                </button>
              )}
              {adBonusGranted !== null && <p role="status" className="text-center text-xs font-medium text-green-800">{fmt(p.rewardAdGranted, { n: adBonusGranted })}</p>}
              {adError && <p role="status" className="text-center text-xs text-[#8b2e22]">{adError === 'cancelled' ? (locale === 'zh' ? '你已取消观看，没有扣除或改动奖励。' : 'You cancelled the video. No reward was changed.') : adError === 'cooldown' ? (locale === 'zh' ? '奖励视频正在冷却，请稍后再试。' : 'The reward video is cooling down. Try later.') : adError === 'unfilled' || adError === 'unavailable' ? (locale === 'zh' ? '当前渠道暂时没有可用视频，基础奖励不受影响。' : 'No video is available on this channel. Your base reward is safe.') : p.adFailed}</p>}
            </div>

            <details className="mt-3 border-t border-[var(--line)] pt-3 text-left">
              <summary className="cursor-pointer text-center text-sm text-[var(--muted)]">{p.resultDetails}</summary>
              {terminalDetails && <p className="mt-3 text-xs tabular-nums text-[var(--muted)]">{fmt(p.resultMetrics, { attempt: terminalDetails.attemptNumber, plies: state.plyCount, eaten: state.eatenSheep, capture: terminalDetails.firstCapturePly === null ? p.noCaptures : fmt(p.firstCaptureAt, { n: terminalDetails.firstCapturePly }), time: formatDuration(terminalDetails.durationMs), reason: terminalReasonLabel(terminalReason(state), p) })}</p>}
              {!adminMode && state.status === 'won' && <p className="mt-2 text-xs text-[var(--muted)]">{fmt(p.rewardBalance, { n: save.fragments.universal })}</p>}
              {!adminMode && state.status === 'won' && nextWolfSkin && <p className="mt-1 text-xs text-[var(--muted)]">{fmt(p.nextRewardTarget, { name: locale === 'zh' ? nextWolfSkin.nameZh : nextWolfSkin.nameEn, cost: nextWolfSkin.cost })}</p>}
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-sm">
                {state.status === 'won' && <button type="button" onClick={restartAttempt} className="underline-offset-2 hover:underline">{p.again}</button>}
                <button type="button" disabled={shareBusy || adBusy} onClick={() => void shareTerminalResult()} className="underline-offset-2 hover:underline disabled:opacity-50">{shareBusy ? p.sharePreparing : p.share}</button>
                <ScopedLink adminMode={adminMode} href={backHref} locale={locale} className="underline-offset-2 hover:underline">{p.levelList}</ScopedLink>
                <button type="button" onClick={reportCurrentGame} className="underline-offset-2 hover:underline">{p.reportGame}</button>
              </div>
              {shareStatus && <p role="status" className="mt-2 text-center text-xs text-[var(--muted)]">{shareStatus === 'shared' ? p.shareShared : shareStatus === 'copied' ? p.shareCopied : shareStatus === 'downloaded' ? p.shareDownloaded : shareStatus === 'cancelled' ? (locale === 'zh' ? '已取消分享，没有重复弹出分享窗口。' : 'Sharing was cancelled; no second prompt was opened.') : p.shareFailed}</p>}
            </details>
          </div>
        </div>
      )}

      {uiPhase === 'terminal' && !terminalOpen && (
        <div className="game-panel grid gap-3 p-3 text-center sm:grid-cols-[1fr_auto] sm:items-center sm:text-left">
          <div><p className="font-medium text-[var(--ink)]">{state.status === 'won' ? p.win : state.status === 'draw' ? p.draw : p.lose}</p><p className="mt-1 text-xs text-[var(--muted)]">{terminalReasonLabel(terminalReason(state), p)}</p><button type="button" onClick={() => setTerminalOpen(true)} className="mt-1 text-sm text-[var(--muted)] underline">{p.viewResult}</button></div>
          {!adminMode && state.status === 'won' && nextLevel ? <LocaleLink href={`/play/${nextLevel.id}`} locale={locale} className="primary-action justify-center">{p.nextLevel}</LocaleLink> : !adminMode && state.status === 'won' ? <LocaleLink href="/chapters" locale={locale} className="primary-action justify-center">{p.allSeasons}</LocaleLink> : <button type="button" onClick={restartAttempt} className="primary-action justify-center">{p.again}</button>}
        </div>
      )}

      {uiPhase !== 'terminal' && (
        <div className="grid gap-2" aria-live="polite">
          {failureStreak >= 2 && !interactionNotice && (
            <button type="button" onClick={openHint} className="rounded-lg border border-[var(--accent)]/35 bg-[var(--paper)] px-3 py-2 text-center text-xs font-medium text-[var(--ink)]">
              {p.hintAvailable}
            </button>
          )}
          {audioBlocked && !muted && (
            <button type="button" className="status-chip justify-center text-xs" onClick={async () => setAudioBlocked(!(await prepareSfx()))}>
              {p.soundBlocked} {p.restoreSound}
            </button>
          )}
          <p className={`status-chip justify-center text-center text-xs ${firstLessonActive ? 'font-medium text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
            {interactionNotice ?? lessonTip}
          </p>
        </div>
      )}

      {uiPhase !== 'terminal' && <footer className="mt-auto flex justify-center">
        <button type="button" onClick={openHint} className="quiet-action min-h-11 min-w-28 justify-center px-4 text-sm">{p.hint}</button>
      </footer>}

      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2c3328]/45 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="hunt-more-title" className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-xl bg-[var(--panel)] p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h2 id="hunt-more-title" className="font-serif text-xl text-[var(--ink)]">{p.moreTitle}</h2>
              <button type="button" onClick={() => setMoreOpen(false)} className="quiet-action min-h-10 px-3 text-sm">{p.hintClose}</button>
            </div>
            <div className="mt-4 grid gap-2">
              <p className="text-xs font-medium text-[var(--muted)]">{locale === 'zh' ? '本局' : 'This hunt'}</p>
              <button
                type="button"
                onClick={confirmReset}
                className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm ${
                  resetArmed ? 'border-[var(--danger)] bg-[#e8c4b8]/50 font-medium text-[#8b2e22]' : 'border-[var(--line)] text-[var(--ink)]'
                }`}
              >
                {resetArmed ? p.resetConfirm : p.restart}
              </button>
              <button type="button" onClick={toggleMute} className="min-h-11 rounded-lg border border-[var(--line)] px-3 py-2 text-left text-sm text-[var(--ink)]" aria-pressed={muted}>
                {muted ? p.unmute : p.mute}
              </button>
              {!adminMode && <>
                <p className="mt-2 text-xs font-medium text-[var(--muted)]">{locale === 'zh' ? '游戏进度' : 'Progress'}</p>
                <LocaleLink href="/chapters" locale={locale} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]">{t.nav.chapters}</LocaleLink>
                <LocaleLink href="/skins" locale={locale} className="inline-flex min-h-11 items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"><span>{t.nav.skins}</span><span className="text-xs text-[var(--muted)]">{locale === 'zh' ? `通用碎片 ${save.fragments.universal}` : `${save.fragments.universal} universal shards`}</span></LocaleLink>
                <LocaleLink href="/quests" locale={locale} className="inline-flex min-h-11 items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"><span>{t.nav.quests}</span>{claimableQuests > 0 ? <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-white">{locale === 'zh' ? `${claimableQuests} 项可领取` : `${claimableQuests} ready`}</span> : null}</LocaleLink>
                <p className="mt-2 text-xs font-medium text-[var(--muted)]">{locale === 'zh' ? '设置与支持' : 'Settings & support'}</p>
                <LocaleLink href="/settings" locale={locale} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]">{t.nav.settings}</LocaleLink>
                <button type="button" onClick={() => { setMoreOpen(false); setHelpOpen(true) }} className="min-h-11 rounded-lg border border-[var(--line)] px-3 py-2 text-left text-sm text-[var(--ink)]">{p.help}</button>
                <LocaleLink href="/how-to-play" locale={locale} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]">{t.nav.howToPlay}</LocaleLink>
              </>}
              <button type="button" onClick={reportCurrentGame} className="min-h-11 rounded-lg border border-[var(--line)] px-3 py-2 text-left text-sm text-[var(--ink)]">{p.reportGame}</button>
              {!adminMode && <div className="rounded-lg border border-[var(--line)] px-2 py-1"><LocaleSwitcher locale={locale} /></div>}
              <ScopedLink adminMode={adminMode} href={adminMode ? '/admin/levels' : '/'} locale={locale} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--danger)]/35 px-3 py-2 text-sm text-[#8b2e22]">
                {p.exit}
              </ScopedLink>
            </div>
          </div>
        </div>
      )}

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2c3328]/45 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="field-help-title" className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-xl bg-[var(--panel)] p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="field-help-title" className="font-serif text-xl text-[var(--ink)]">{p.helpTitle}</h2>
              <button type="button" onClick={() => setHelpOpen(false)} className="quiet-action min-h-10 px-3 text-sm">{p.hintClose}</button>
            </div>
            <HelpContent h={t.howTo} locale={locale} compact />
          </div>
        </div>
      )}

      {hintOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2c3328]/45 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="hunt-hint-title" className="w-full max-w-sm rounded-xl bg-[var(--panel)] p-5 shadow-lg">
            <p className="eyebrow">{p.hintLevels[hintLevel]}</p>
            <h2 id="hunt-hint-title" className="mt-1 font-serif text-xl text-[var(--ink)]">{p.hintTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{fmt(hintTemplates[hintLevel]!, { point: guidancePoints[hintLevel]! })}</p>
            <div className="mt-5 flex justify-between gap-2">
              <button type="button" onClick={() => setHintOpen(false)} className="quiet-action min-h-10 px-3 text-sm">{p.hintClose}</button>
              {hintLevel < 2 && <button type="button" onClick={() => setHintLevel((value) => value + 1)} className="primary-action min-h-10 px-4 text-sm">{p.hintNext}</button>}
            </div>
          </div>
        </div>
      )}

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

function ScopedLink({ adminMode, href, locale, className, children }: { adminMode: boolean; href: string; locale: 'en' | 'zh'; className?: string; children: React.ReactNode }) {
  return adminMode
    ? <Link href={href} className={className}>{children}</Link>
    : <LocaleLink href={href} locale={locale} className={className}>{children}</LocaleLink>
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
  if (grant.universal === 0 && seasonBits.length === 0) {
    return <p className="mt-2 text-sm text-[var(--muted)]">{labels.noDrop}</p>
  }
  const sep = locale === 'zh' ? '：' : ': '
  return (
    <p className="text-sm font-medium text-[var(--ink)]">
      {grant.firstClear ? labels.firstClear : labels.repeatClear}
      {sep}+{grant.universal}
      {seasonBits ? ` · ${seasonBits}` : ''}
    </p>
  )
}

function terminalReason(state: BoardState): 'targetEaten' | 'wolvesTrapped' | 'maxPlies' | 'repetition' | 'unexpected' {
  if (state.terminalReason) return state.terminalReason
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= REPETITION_DRAW_COUNT) return 'repetition'
  return 'unexpected'
}

function drawSubtitle(state: BoardState, p: MessageTree['play']) {
  return state.terminalReason === 'repetition' ? p.drawRepetitionSub : p.drawMaxSub
}

function terminalReasonLabel(reason: ReturnType<typeof terminalReason>, p: MessageTree['play']): string {
  return p.terminalReasons[reason]
}

function formatDuration(durationMs: number): string {
  const seconds = Math.max(0, Math.round(durationMs / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}
