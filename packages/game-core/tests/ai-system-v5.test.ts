import { describe, expect, it } from 'vitest'
import {
  applyAction,
  analyzeSheepActions,
  AI_COUNTEREXAMPLE_CONTRACTS,
  AI_PRIMARY_STYLES,
  assessLearningCurve,
  assessPersonaMatrix,
  auditPlayerReport,
  choosePlayerPersonaAction,
  createLevelInitialState,
  createPlayerPersonaMemory,
  createSeededRng,
  compareAiStyles,
  getLevel,
  judgeSheepAction,
  LEARNING_STAGE_CONTRACTS,
  learningStageForLevel,
  LEVELS,
  listLegalActions,
  makeState,
  pickSheepActionWithMeta,
  validateAiCounterexampleContracts,
  evaluate,
  type Action,
} from '../src/index'
import { WINTER_06_PLAYER_REPORT } from './fixtures/winter-06-player-report'

describe('AI validation architecture', () => {
  it('retains the reported winter-06 serial-hunter game as a reproducible risk fixture', () => {
    const audit = auditPlayerReport(WINTER_06_PLAYER_REPORT)
    expect(audit.ok).toBe(true)
    expect(audit.final).toMatchObject({ status: 'won', reason: 'targetEaten', plies: 85, eaten: 8 })
    expect(audit.capturesByWolf).toEqual({ 'wolf-2': 6, 'wolf-3': 2 })
    expect(audit.dominantWolfShare).toBe(0.75)
    expect(audit.sameHunterCaptureStreak).toBe(4)
    expect(audit.avoidableImmediateExposureTurns).toBe(1)
    expect(audit.reproducibleTurns).toBeLessThan(audit.sheepTurns)
  // Replaying all 85 plies also re-evaluates every sheep turn with persisted
  // intent. Keep enough headroom for slower CI without reducing the fixture.
  }, 60_000)

  it('prevents the reported sacrifice while a zero-exposure action exists at ply 53', () => {
    const level = getLevel('winter-06')!
    let state = createLevelInitialState(level)
    for (const raw of WINTER_06_PLAYER_REPORT.actions.slice(0, 53)) {
      const result = raw.type === 'end-chain' ? null : applyAction(state, raw as Action)
      if (!result?.ok) throw new Error(`failed to build regression state at ply ${state.plyCount}`)
      state = result.state
    }
    const selected = pickSheepActionWithMeta(state, {
      profile: 'expert',
      rng: createSeededRng(82222 + state.eatenSheep * 17 + state.pieces.length),
    })
    const result = applyAction(state, selected.action)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const chosen = analyzeSheepActions(state).find((item) => JSON.stringify(item.action) === JSON.stringify(selected.action))!
    expect(chosen.maxCaptureChain).toBe(0)
  })

  it('treats an exposed capture as terminally urgent when the wolf needs one more sheep', () => {
    const level = getLevel('winter-06')!
    let state = createLevelInitialState(level)
    for (const raw of WINTER_06_PLAYER_REPORT.actions.slice(0, 53)) {
      const result = raw.type === 'end-chain' ? null : applyAction(state, raw as Action)
      if (!result?.ok) throw new Error(`failed to build endgame regression state at ply ${state.plyCount}`)
      state = result.state
    }
    state = { ...state, eatenSheep: 7 }
    const selected = pickSheepActionWithMeta(state, { profile: 'expert', rng: createSeededRng(77) })
    const moved = applyAction(state, selected.action)
    if (!moved.ok) throw new Error(moved.error)
    expect(listLegalActions({ ...moved.state, toMove: 'wolf', chain: null }).filter((action) => action.type === 'jump')).toHaveLength(0)
    expect(evaluate({ ...state, eatenSheep: 7 }).terminalUrgency).toBeGreaterThan(evaluate({ ...state, eatenSheep: 1 }).terminalUrgency)
  })

  it('provides an independent teacher verdict for a sheep decision', () => {
    const level = getLevel('spring-01')!
    let state = createLevelInitialState(level)
    const wolfMove = listLegalActions(state)[0]!
    const moved = applyAction(state, wolfMove)
    if (!moved.ok) throw new Error(moved.error)
    state = moved.state
    const sheepAction = listLegalActions(state)[0]!
    const judgement = judgeSheepAction(state, sheepAction, { depth: 2, maxNodes: 8_000 })
    expect(judgement.candidates.length).toBe(listLegalActions(state).length)
    expect(judgement.nodes).toBeGreaterThan(0)
    expect(judgement.selectedScore).not.toBeNull()
    expect(['supported', 'questionable', 'unknown']).toContain(judgement.verdict)
  })

  it('runs four named player personas with independent game evidence', () => {
    const level = getLevel('spring-01')!
    const report = assessPersonaMatrix(level, [17])
    expect(Object.keys(report.summaries)).toEqual(['novice', 'regular', 'skilled', 'expert'])
    expect(report.games).toHaveLength(4)
    expect(report.games.every((game) => game.trace.length > 0)).toBe(true)
  }, 20_000)

  it('makes every persona take an available direct capture', () => {
    const level = getLevel('spring-01')!
    let state = createLevelInitialState(level)
    // Move until the test finds a natural capture; this checks policy semantics, not balance.
    for (let step = 0; step < 80 && state.status === 'playing'; step += 1) {
      const actions = listLegalActions(state)
      if (state.toMove === 'wolf' && actions.some((action) => action.type === 'jump')) {
        for (const persona of ['novice', 'regular', 'skilled', 'expert'] as const) {
          const action = choosePlayerPersonaAction(state, actions, createSeededRng(9), persona, createPlayerPersonaMemory())
          expect(action.type).toBe('jump')
        }
        return
      }
      const result = applyAction(state, actions[0]!)
      if (!result.ok) throw new Error(result.error)
      state = result.state
    }
    throw new Error('fixture failed to reach a direct capture')
  })

  it('maps all 24 levels into twelve two-level behavior contracts', () => {
    const stages = LEVELS.map((level) => learningStageForLevel(level).id)
    expect(new Set(stages)).toEqual(new Set(Object.keys(LEARNING_STAGE_CONTRACTS)))
    for (const stageId of Object.keys(LEARNING_STAGE_CONTRACTS)) {
      expect(stages.filter((id) => id === stageId)).toHaveLength(2)
    }
  })

  it('uses persisted capture history to retarget a hunter-counter level', () => {
    const level = getLevel('summer-06')!
    let state = createLevelInitialState(level)
    const moved = applyAction(state, listLegalActions(state).find((action) => action.type === 'step' && action.pieceId === 'wolf-1')!)
    if (!moved.ok) throw new Error(moved.error)
    state = moved.state
    const memory = {
      currentTargetWolfId: 'wolf-1',
      targetSincePly: 0,
      lastTargetChangeReason: 'target-retained' as const,
      capturesByWolf: { 'wolf-2': 3, 'wolf-1': 1 },
      movesByWolf: { 'wolf-1': 1 },
      lastWolfActionPly: state.plyCount,
    }
    const decision = pickSheepActionWithMeta(state, { profile: level.aiProfile, rng: createSeededRng(12), memory })
    expect(decision.meta.targetWolfId).toBe('wolf-2')
    expect(decision.meta.targetChangeReason).toBe('hunter-emerged')
    expect(decision.meta.nextMemory.currentTargetWolfId).toBe('wolf-2')
  })

  it('makes every level intent executable through valid focus cells', () => {
    for (const level of LEVELS) {
      expect(level.opponentIntent.focusCells.length).toBeGreaterThanOrEqual(2)
      expect(level.opponentIntent.focusCells.every((cell) => cell.r >= 1 && cell.r <= 6 && cell.c >= 1 && cell.c <= 6)).toBe(true)
      expect(level.opponentIntent.focusCells.every((cell) => !level.rocks.some((rock) => rock.r === cell.r && rock.c === cell.c))).toBe(true)
    }
  })

  it('keeps all nine permanent AI counterexample categories versioned', () => {
    expect(validateAiCounterexampleContracts()).toEqual([])
    expect(AI_COUNTEREXAMPLE_CONTRACTS).toHaveLength(9)
    expect(new Set(AI_COUNTEREXAMPLE_CONTRACTS.map((contract) => contract.category)).size).toBe(9)
  })

  it('makes configured behavior styles affect decisions on representative maps', () => {
    const reports = ['spring-03', 'summer-06', 'autumn-04', 'winter-06'].flatMap((levelId, levelIndex) => {
      const level = getLevel(levelId)!
      let state = createLevelInitialState(level)
      const collected = []
      for (let step = 0; step < 20 && state.status === 'playing' && collected.length < 2; step += 1) {
        const actions = listLegalActions(state)
        if (actions.length === 0) break
        if (state.toMove === 'sheep') collected.push(compareAiStyles(state, level, 20260720 + levelIndex + collected.length))
        const moved = applyAction(state, actions[0]!)
        if (!moved.ok) throw new Error(moved.error)
        state = moved.state
      }
      return collected
    })
    const level = getLevel('summer-06')!
    const diagnosticStates = [
      makeState({ levelId: level.id, toMove: 'sheep', pieces: [
        { id: 'wolf-1', side: 'wolf', r: 2, c: 2 }, { id: 'wolf-2', side: 'wolf', r: 5, c: 5 }, { id: 'wolf-3', side: 'wolf', r: 6, c: 1 },
        { id: 'sheep-1', side: 'sheep', r: 1, c: 2 }, { id: 'sheep-2', side: 'sheep', r: 2, c: 4 }, { id: 'sheep-3', side: 'sheep', r: 3, c: 5 },
        { id: 'sheep-4', side: 'sheep', r: 4, c: 2 }, { id: 'sheep-5', side: 'sheep', r: 5, c: 3 }, { id: 'sheep-6', side: 'sheep', r: 6, c: 6 },
      ] }),
      makeState({ levelId: level.id, toMove: 'sheep', rocks: [{ r: 3, c: 3 }, { r: 4, c: 4 }], pieces: [
        { id: 'wolf-1', side: 'wolf', r: 1, c: 1 }, { id: 'wolf-2', side: 'wolf', r: 3, c: 5 }, { id: 'wolf-3', side: 'wolf', r: 6, c: 3 },
        { id: 'sheep-1', side: 'sheep', r: 1, c: 4 }, { id: 'sheep-2', side: 'sheep', r: 2, c: 2 }, { id: 'sheep-3', side: 'sheep', r: 2, c: 6 },
        { id: 'sheep-4', side: 'sheep', r: 4, c: 1 }, { id: 'sheep-5', side: 'sheep', r: 5, c: 5 }, { id: 'sheep-6', side: 'sheep', r: 6, c: 6 },
      ] }),
      makeState({ levelId: level.id, toMove: 'sheep', pieces: [
        { id: 'wolf-1', side: 'wolf', r: 1, c: 1 }, { id: 'wolf-2', side: 'wolf', r: 1, c: 3 }, { id: 'wolf-3', side: 'wolf', r: 1, c: 5 },
        { id: 'sheep-1', side: 'sheep', r: 4, c: 3 }, { id: 'sheep-2', side: 'sheep', r: 4, c: 4 }, { id: 'sheep-3', side: 'sheep', r: 5, c: 3 },
        { id: 'sheep-4', side: 'sheep', r: 6, c: 6 },
      ] }),
    ]
    reports.push(...diagnosticStates.map((state, index) => compareAiStyles(state, level, 20260800 + index)))
    expect(reports.some((report) => report.distinctActionCount >= 2)).toBe(true)
    expect(AI_PRIMARY_STYLES.every((style) => reports.some((report) => {
      const own = report.decisions.find((decision) => decision.style === style)!
      return report.decisions.some((other) => other.style !== style && other.actionKey !== own.actionKey)
    }))).toBe(true)
    expect(reports.reduce((sum, report) => sum + report.pairwiseDivergence, 0) / reports.length).toBeGreaterThanOrEqual(0.1)
  }, 30_000)

  it('accepts a complete skill-sensitive curve and rejects incomplete evidence', () => {
    const base = assessPersonaMatrix(getLevel('spring-01')!, [17])
    const reports = LEVELS.map((level) => ({
      ...base,
      levelId: level.id,
      aiProfile: level.aiProfile,
      aiStyle: level.aiStyle,
      opponentIntent: level.opponentIntent,
      summaries: {
        ...base.summaries,
        novice: { ...base.summaries.novice, games: 10, wolfWins: 3 },
        regular: { ...base.summaries.regular, games: 10, wolfWins: 5 },
        skilled: { ...base.summaries.skilled, games: 10, wolfWins: 7 },
        expert: { ...base.summaries.expert, games: 10, wolfWins: 8 },
      },
    }))
    expect(assessLearningCurve(reports).passed).toBe(true)
    expect(assessLearningCurve(reports.slice(0, 23)).findings.some((finding) => finding.code === 'CURVE_MATRIX_INCOMPLETE')).toBe(true)
  }, 20_000)
})
