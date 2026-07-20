import { describe, expect, it } from 'vitest'
import {
  applyAction,
  analyzeSheepActions,
  assessPersonaMatrix,
  auditPlayerReport,
  choosePlayerPersonaAction,
  createLevelInitialState,
  createPlayerPersonaMemory,
  createSeededRng,
  getLevel,
  judgeSheepAction,
  LEARNING_STAGE_CONTRACTS,
  learningStageForLevel,
  LEVELS,
  listLegalActions,
  pickSheepActionWithMeta,
  evaluate,
  type Action,
} from '../src/index'
import { WINTER_06_PLAYER_REPORT } from './fixtures/winter-06-player-report'

describe('AI V3 validation architecture', () => {
  it('retains the reported winter-06 serial-hunter game as a reproducible risk fixture', () => {
    const audit = auditPlayerReport(WINTER_06_PLAYER_REPORT)
    expect(audit.ok).toBe(true)
    expect(audit.final).toMatchObject({ status: 'won', reason: 'targetEaten', plies: 85, eaten: 8 })
    expect(audit.capturesByWolf).toEqual({ 'wolf-2': 6, 'wolf-3': 2 })
    expect(audit.dominantWolfShare).toBe(0.75)
    expect(audit.sameHunterCaptureStreak).toBe(4)
    expect(audit.avoidableImmediateExposureTurns).toBe(1)
    expect(audit.reproducibleTurns).toBeLessThan(audit.sheepTurns)
  }, 20_000)

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
})
