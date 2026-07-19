export type WolfStrategyId = 'two_wolf_pincer' | 'three_wolf_surround' | 'induced_movement' | 'rock_lane_control' | 'chain_capture' | 'preserve_mobility'

export type WolfStrategy = {
  id: WolfStrategyId
  nameEn: string; nameZh: string
  summaryEn: string; summaryZh: string
  signalEn: string; signalZh: string
  mistakeEn: string; mistakeZh: string
  objectiveEn: string; objectiveZh: string
}

export const WOLF_STRATEGIES: WolfStrategy[] = [
  S('two_wolf_pincer', 'Two-wolf pincer', '双狼夹击', 'Compress the flock from two directions.', '两只狼从不同方向压缩羊群空间。', 'The flock has two open escape directions.', '羊群仍有两个方向可以逃离。', 'Both wolves chase from the same side.', '两只狼从同一侧追逐，另一侧完全开放。', 'Make the flock choose between two controlled exits.', '让羊群在两条受控出口之间做选择。'),
  S('three_wolf_surround', 'Three-wolf surround', '三狼包围', 'Use two wolves to block exits, then move the third in to capture.', '两只狼限制出口，第三只狼从空出的路线完成捕食。', 'Two wolves can cover exits while the third has an approach line.', '两狼可以控制出口，第三狼仍有接近路线。', 'All three wolves crowd the same route.', '三只狼挤进同一条路线，彼此失去接应。', 'Use one wolf to block an exit, one to support, and one to capture.', '一只狼堵出口，一只狼接应，一只狼完成捕食。'),
  S('induced_movement', 'Induced movement', '诱导移动', 'Move from another side to draw sheep into a useful lane.', '先从另一侧移动，逼羊进入目标路线。', 'A direct chase is blocked, but the flock has a predictable response route.', '直接追逐被挡住，但羊群存在可预测的回应路线。', 'Repeating the same chase and expecting the flock to open itself.', '重复同一条追逐路线，等待羊群自行露出破口。', 'Change sides first, then capture after the flock changes direction.', '先换侧施压，等羊群改变方向后再捕食。'),
  S('rock_lane_control', 'Rock lane control', '岩石控道', 'Use rock boundaries and gaps to control routes; rocks are never jump points.', '利用岩石形成的边界、通道和断点限制路线；岩石绝不是跳吃中点。', 'Rocks leave a narrow entrance, exit, or disconnected lane.', '岩石形成窄入口、出口或被切开的路线。', 'Treating a rock as a landing point or blocking your only exit.', '把岩石当作落点，或堵死狼的唯一出口。', 'Control the usable lanes around rocks before entering them.', '进通道前先控制岩石周围真正可用的路线。'),
  S('chain_capture', 'Chain capture', '链式捕捉', 'Compare the next gain with the landing risk after the first capture.', '第一次吃羊后，比较继续连吃的收益与落点风险。', 'A capture creates another aligned sheep and an open landing route.', '第一次捕食后又出现同线羊和可用落点。', 'Extending every chain without checking the exit.', '只要能连吃就继续，不检查最终落点和退路。', 'Continue only while the chain preserves a useful final position.', '只有最终站位仍有价值时才继续连吃。'),
  S('preserve_mobility', 'Preserve mobility', '保持机动性', 'Keep wolves able to turn and support each other.', '避免狼进入无法转向或无法互相接应的位置。', 'A wolf has few exits or two wolves depend on one empty point.', '某只狼出口很少，或两只狼依赖同一个空点。', 'Trading all movement space for one nearby sheep.', '为眼前一只羊牺牲三狼整体行动空间。', 'Check every wolf still has a route after the planned move.', '行动前确认三只狼在下一轮仍各有路线。'),
]

function S(id: WolfStrategyId, nameEn: string, nameZh: string, summaryEn: string, summaryZh: string, signalEn: string, signalZh: string, mistakeEn: string, mistakeZh: string, objectiveEn: string, objectiveZh: string): WolfStrategy {
  return { id, nameEn, nameZh, summaryEn, summaryZh, signalEn, signalZh, mistakeEn, mistakeZh, objectiveEn, objectiveZh }
}

export function getWolfStrategy(id: WolfStrategyId): WolfStrategy { return WOLF_STRATEGIES.find((item) => item.id === id)! }
export function strategyName(id: WolfStrategyId, locale: 'en' | 'zh'): string { const item = getWolfStrategy(id); return locale === 'zh' ? item.nameZh : item.nameEn }

export type LevelStrategyProfile = { primary: WolfStrategyId; secondary: WolfStrategyId }
const B = (primary: WolfStrategyId, secondary: WolfStrategyId): LevelStrategyProfile => ({ primary, secondary })
export const LEVEL_STRATEGIES: Record<string, LevelStrategyProfile> = {
  'spring-01': B('preserve_mobility', 'induced_movement'), 'spring-02': B('rock_lane_control', 'preserve_mobility'), 'spring-03': B('chain_capture', 'preserve_mobility'),
  'spring-04': B('induced_movement', 'preserve_mobility'), 'spring-05': B('two_wolf_pincer', 'preserve_mobility'), 'spring-06': B('three_wolf_surround', 'chain_capture'),
  'summer-01': B('two_wolf_pincer', 'induced_movement'), 'summer-02': B('preserve_mobility', 'rock_lane_control'), 'summer-03': B('three_wolf_surround', 'induced_movement'),
  'summer-04': B('two_wolf_pincer', 'preserve_mobility'), 'summer-05': B('preserve_mobility', 'induced_movement'), 'summer-06': B('three_wolf_surround', 'two_wolf_pincer'),
  'autumn-01': B('rock_lane_control', 'preserve_mobility'), 'autumn-02': B('rock_lane_control', 'three_wolf_surround'), 'autumn-03': B('chain_capture', 'preserve_mobility'),
  'autumn-04': B('rock_lane_control', 'chain_capture'), 'autumn-05': B('three_wolf_surround', 'rock_lane_control'), 'autumn-06': B('chain_capture', 'rock_lane_control'),
  'winter-01': B('three_wolf_surround', 'preserve_mobility'), 'winter-02': B('two_wolf_pincer', 'preserve_mobility'), 'winter-03': B('preserve_mobility', 'chain_capture'),
  'winter-04': B('induced_movement', 'three_wolf_surround'), 'winter-05': B('three_wolf_surround', 'two_wolf_pincer'), 'winter-06': B('three_wolf_surround', 'chain_capture'),
}
