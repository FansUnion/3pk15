import { LEVELS } from './levels'
import { SKIN_CATALOG, type WolfSetSkin } from './skins'
import type { DropGrant, SaveGame } from './save'

export type AdEngagement = 'none' | 'half' | 'all'

export type UniversalTarget = {
  id: string
  nameZh: string
  nameEn: string
  cost: number
}

export type EconomyPath = {
  mode: AdEngagement
  earnedUniversal: number
  spentUniversal: number
  balance: number
  adsCompleted: number
  unlocks: Array<{ skinId: string; levelId: string; clearNumber: number }>
  nextTarget: UniversalTarget | null
  nextTargetRemaining: number
}

export function universalSkinTargets(): UniversalTarget[] {
  return SKIN_CATALOG
    .filter((skin): skin is WolfSetSkin & { unlock: { type: 'cost'; universal: number } } =>
      skin.kind === 'wolf_set' && skin.unlock.type === 'cost')
    .map((skin) => ({ id: skin.id, nameZh: skin.nameZh, nameEn: skin.nameEn, cost: skin.unlock.universal }))
    .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id))
}

export function nextUniversalSkinTarget(save: SaveGame): UniversalTarget | null {
  return universalSkinTargets().find((target) => !save.unlockedSkinIds.includes(target.id)) ?? null
}

export function rewardedFragmentAmount(grant: Pick<DropGrant, 'universal'> | null): number {
  return Math.max(3, grant?.universal ?? 0)
}

export function simulateFirstClearEconomy(mode: AdEngagement): EconomyPath {
  const targets = universalSkinTargets()
  const unlocks: EconomyPath['unlocks'] = []
  let earnedUniversal = 0
  let spentUniversal = 0
  let balance = 0
  let adsCompleted = 0
  let targetIndex = 0

  for (const [index, level] of LEVELS.entries()) {
    const base = level.firstClearReward.universal ?? 0
    const adEligible = mode === 'all' || (mode === 'half' && index % 2 === 1)
    const adReward = adEligible ? rewardedFragmentAmount({ universal: base }) : 0
    if (adEligible) adsCompleted++
    earnedUniversal += base + adReward
    balance += base + adReward

    while (targetIndex < targets.length && balance >= targets[targetIndex]!.cost) {
      const target = targets[targetIndex]!
      balance -= target.cost
      spentUniversal += target.cost
      unlocks.push({ skinId: target.id, levelId: level.id, clearNumber: index + 1 })
      targetIndex++
    }
  }

  const nextTarget = targets[targetIndex] ?? null
  return {
    mode,
    earnedUniversal,
    spentUniversal,
    balance,
    adsCompleted,
    unlocks,
    nextTarget,
    nextTargetRemaining: nextTarget ? Math.max(0, nextTarget.cost - balance) : 0,
  }
}
