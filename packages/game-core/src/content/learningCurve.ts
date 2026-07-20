import type { ChapterId, LevelConfig } from './levels'

export type LearningStageId =
  | 'spring-intro' | 'spring-tactics' | 'spring-exam'
  | 'summer-routes' | 'summer-teamwork' | 'summer-exam'
  | 'autumn-terrain' | 'autumn-chains' | 'autumn-exam'
  | 'winter-pressure' | 'winter-expert' | 'winter-final'

export type LearningStageContract = {
  id: LearningStageId
  labelZh: string
  mustShowZh: string
  automatedEvidenceZh: string
}

export const LEARNING_STAGE_CONTRACTS: Record<LearningStageId, LearningStageContract> = {
  'spring-intro': { id: 'spring-intro', labelZh: '规则引入', mustShowZh: '合法自保并保留第一次捕食的教学空间', automatedEvidenceZh: '无严格劣着；新手画像能够建立首次捕食' },
  'spring-tactics': { id: 'spring-tactics', labelZh: '短链练习', mustShowZh: '避开直接送吃并开始封堵一次落点', automatedEvidenceZh: '责任动作与短链反例通过' },
  'spring-exam': { id: 'spring-exam', labelZh: '春季综合', mustShowZh: '限制单狼并开始识别双狼协作', automatedEvidenceZh: '固定猎手不能无代价重复得分' },
  'summer-routes': { id: 'summer-routes', labelZh: '路线与退路', mustShowZh: '预判完整狼回合并管理通道', automatedEvidenceZh: '完整捕食链和退路反例通过' },
  'summer-teamwork': { id: 'summer-teamwork', labelZh: '三狼分工', mustShowZh: '识别孤狼并持续局部封锁', automatedEvidenceZh: '连续两轮保持同一防守目标' },
  'summer-exam': { id: 'summer-exam', labelZh: '夏季综合', mustShowZh: '识别战术牺牲、退路和关键落点', automatedEvidenceZh: '牺牲收益可由教师解释' },
  'autumn-terrain': { id: 'autumn-terrain', labelZh: '地形控制', mustShowZh: '利用岩石和通道形成区域防守', automatedEvidenceZh: '关键通道与岩石间距反例通过' },
  'autumn-chains': { id: 'autumn-chains', labelZh: '长链与跨区', mustShowZh: '评估跨区方向和捕食链终点', automatedEvidenceZh: '跨两轮捕食风险受控' },
  'autumn-exam': { id: 'autumn-exam', labelZh: '秋季综合', mustShowZh: '把羊方优势主动转成困狼', automatedEvidenceZh: '合围持续推进且无优势往返' },
  'winter-pressure': { id: 'winter-pressure', labelZh: '高压站位', mustShowZh: '阻断固定套路并切断狼间接应', automatedEvidenceZh: '资深固定猎手画像受到有效防守' },
  'winter-expert': { id: 'winter-expert', labelZh: '专家防守', mustShowZh: '多回合保持目标并主动困狼', automatedEvidenceZh: '教师后悔值和目标持续性达标' },
  'winter-final': { id: 'winter-final', labelZh: '最终综合', mustShowZh: '本期最强公平防守且保留可理解狼胜路', automatedEvidenceZh: '无重复收割漏洞；保留双方代表棋谱' },
}

const STAGE_ORDER: Record<ChapterId, [LearningStageId, LearningStageId, LearningStageId]> = {
  spring: ['spring-intro', 'spring-tactics', 'spring-exam'],
  summer: ['summer-routes', 'summer-teamwork', 'summer-exam'],
  autumn: ['autumn-terrain', 'autumn-chains', 'autumn-exam'],
  winter: ['winter-pressure', 'winter-expert', 'winter-final'],
}

export function learningStageForLevel(level: Pick<LevelConfig, 'chapterId' | 'indexInChapter'>): LearningStageContract {
  const pair = Math.min(2, Math.floor((level.indexInChapter - 1) / 2))
  const stageId = STAGE_ORDER[level.chapterId][pair]!
  return LEARNING_STAGE_CONTRACTS[stageId]
}
