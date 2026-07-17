import type { SupportedLocale } from '@/config/locales'

export type MessageTree = {
  meta: { title: string; description: string; og: string }
  brand: { name: string; subtitle: string; tagline: string; support: string }
  nav: {
    play: string
    continue: string
    continueNamed: string
    skins: string
    quests: string
    settings: string
    home: string
    chapters: string
    privacy: string
    admin: string
    language: string
    howToPlay: string
  }
  home: {
    howTitle: string
    how: [string, string, string, string]
    howMore: string
    seasonsTitle: string
    seasons: { spring: string; summer: string; autumn: string; winter: string }
    trust: string
    faqTitle: string
    faq: { q: string; a: string }[]
    secondary: string
  }
  chapters: { title: string; locked: string; unlocked: string; howLink: string }
  howTo: {
    title: string
    metaDescription: string
    intro: string
    winTitle: string
    winBody: string
    moveTitle: string
    moveBody: string
    chainTitle: string
    chainBody: string
    sheepTitle: string
    sheepBody: string
    rocksTitle: string
    rocksBody: string
    saveTitle: string
    saveBody: string
    ctaSpring: string
    ctaChapters: string
    faqTitle: string
  }
  hunt: {
    playCta: string
    seasonLine: string
    goalLine: string
    teachingLabel: string
    levelsLink: string
    howLink: string
    prev: string
    next: string
    rocksLabel: string
    guideLink: string
  }
  play: {
    back: string
    eaten: string
    sheepLeft: string
    turnWolf: string
    turnSheep: string
    chain: string
    doubleLeft: string
    endChain: string
    win: string
    lose: string
    winSub: string
    loseSub: string
    draw: string
    drawSub: string
    winAdvice: string
    loseAdvice: string
    firstLoseAdvice: string
    drawAdvice: string
    preparing: string
    again: string
    doubleAd: string
    adFailed: string
    levelList: string
    nextLevel: string
    tip: string
    reset: string
    resetConfirm: string
    mute: string
    unmute: string
    exit: string
    guideTitle: string
    guideStep1: string
    guideStep2: string
    guideSkip: string
    guideNext: string
    guideStart: string
    guideSelectWolf: string
    guideMoveGreen: string
    guideWaitSheep: string
    guideFindCapture: string
    noDrop: string
    firstClear: string
    repeatClear: string
    doubled: string
    universal: string
  }
  settings: {
    title: string
    mute: string
    help: string
    privacy: string
    close: string
    helpBody: string[]
  }
  privacy: {
    title: string
    p1: string
    p2: string
    p3: string
    p4: string
  }
  skins: { title: string; equip: string; equipped: string; cost: string }
  quests: { title: string; claim: string; claimed: string; empty: string }
  common: { back: string; loading: string }
  locale: { switchLabel: string }
}

export const en: MessageTree = {
  meta: {
    title: 'Fangrush — Combo board hunt with 3 wolves',
    description:
      'Command 3 wolves. Gap-rush sheep on a 6×6 board, chain eats, crack lines with rocks across four seasons.',
    og: 'Fangrush: gap-rush the flock. Chain hunts. Seasonal boards.',
  },
  brand: {
    name: 'Fangrush',
    subtitle: '',
    tagline: 'Command 3 wolves. Gap-rush the flock in chains — break lines with rocks.',
    support: '6×6 point board · chain up to 5 · seasonal hunts',
  },
  nav: {
    play: 'Play now',
    continue: 'Continue',
    continueNamed: 'Continue · {name}',
    skins: 'Skins',
    quests: 'Quests',
    settings: 'Settings',
    home: 'Home',
    chapters: 'Hunts',
    privacy: 'Privacy',
    admin: 'Admin',
    language: 'Language',
    howToPlay: 'How to play',
  },
  home: {
    howTitle: 'How to play',
    how: [
      'Select a wolf and step to an empty adjacent point.',
      'Gap-eat: wolf — empty — sheep on a line; land on the sheep.',
      'Chain up to 5 eats per turn — or end the chain early.',
      'Eat 8 sheep to clear; lose if all three wolves have no moves.',
    ],
    howMore: 'Full rules',
    seasonsTitle: 'Seasons',
    seasons: {
      spring: 'Learn the hunt · gentle flock',
      summer: 'Real blocking · real pressure',
      autumn: 'Same AI tier · rocks crack the line',
      winter: 'Master surround · empty-board duel',
    },
    trust: 'Progress stays in this browser · no account',
    faqTitle: 'FAQ',
    faq: [
      { q: 'Download required?', a: 'No. Play in the browser.' },
      {
        q: 'Will I lose progress?',
        a: 'Saved locally. Clearing site data or switching devices resets it.',
      },
      { q: 'Mobile?', a: 'Yes. Portrait-first; the board stays square.' },
      { q: 'Account?', a: 'No accounts or cloud saves in this version.' },
    ],
    secondary: 'Quick links',
  },
  chapters: {
    title: 'Choose a hunt',
    locked: 'Locked',
    unlocked: 'Open',
    howLink: 'How to play Fangrush',
  },
  howTo: {
    title: 'How to play Fangrush',
    metaDescription:
      'Learn Fangrush rules: gap-eat, chain captures up to 5, rocks, and seasonal hunts. Play free in the browser.',
    intro:
      'Fangrush is an asymmetric board hunt: you command three wolves against fifteen sheep on a 6×6 point grid.',
    winTitle: 'Win and lose',
    winBody: 'Eat 8 sheep to clear the level. You lose if all three wolves have no legal moves.',
    moveTitle: 'Move and gap-eat',
    moveBody:
      'Wolves step orthogonally to an empty adjacent point. Gap-eat when wolf — empty — sheep share a line: land on the sheep and remove it.',
    chainTitle: 'Chain captures',
    chainBody:
      'After a gap-eat you may chain further eats up to 5 times in one turn, or end the chain early to keep position.',
    sheepTitle: 'Sheep AI',
    sheepBody:
      'Sheep move by AI, never capture, and cannot retreat toward row 1. Wait for their turn before you move again.',
    rocksTitle: 'Rocks and seasons',
    rocksBody:
      'Rocks block landing points. Spring teaches rules; summer adds pressure; autumn packs rocks; winter is an empty-board hard duel.',
    saveTitle: 'Local progress',
    saveBody: 'Clears, shards, and skins stay in this browser. No account. Clearing site data resets everything.',
    ctaSpring: 'Play Spring · Open Meadow',
    ctaChapters: 'Browse seasonal hunts',
    faqTitle: 'FAQ',
  },
  hunt: {
    playCta: 'Play this hunt',
    seasonLine: '{season} · {rocks} rocks',
    goalLine: 'Goal: eat {n} sheep · target {target} moves',
    teachingLabel: 'This hunt teaches',
    levelsLink: 'All levels in this season',
    howLink: 'How to play',
    prev: 'Previous',
    next: 'Next',
    rocksLabel: '{n} rocks',
    guideLink: 'Guide',
  },
  play: {
    back: 'Back',
    eaten: 'Eaten {n}/8',
    sheepLeft: 'Sheep {n}',
    turnWolf: 'Wolf turn',
    turnSheep: 'Sheep turn',
    chain: 'Chain {n}/5',
    doubleLeft: 'Double drop {t}',
    endChain: 'End chain',
    win: 'Victory',
    lose: 'Defeat',
    winSub: 'Eight sheep taken',
    loseSub: 'No moves for the wolves',
    draw: 'Stalemate',
    drawSub: 'The hunt reached its move limit.',
    winAdvice: 'Your route worked. Continue while the three-wolf coordination is fresh.',
    loseAdvice: 'On the retry, keep two wolves mobile while the third creates contact.',
    firstLoseAdvice: 'Retry with three roles: the center wolf approaches while both side wolves keep exits covered.',
    drawAdvice: 'Retry with a different approach line; repeated waiting will not open the flock.',
    preparing: 'Preparing…',
    again: 'Play again',
    doubleAd: 'Watch ad · double shards 30 min',
    adFailed: 'The reward video is unavailable. Your clear is still safe.',
    levelList: 'Level list',
    nextLevel: 'Next hunt',
    tip: 'Green = step · Red ring on sheep = gap-eat',
    reset: 'Reset',
    resetConfirm: 'Tap again',
    mute: 'Mute',
    unmute: 'Unmute',
    exit: 'Exit',
    guideTitle: 'Spring lesson',
    guideStep1: 'Select a dark wolf, then tap a green empty point to step.',
    guideStep2:
      'Gap-eat: on a line wolf — empty — sheep, tap the red-ringed sheep or the empty middle. Chain up to 5.',
    guideSkip: 'Skip',
    guideNext: 'Next',
    guideStart: 'Start hunt',
    guideSelectWolf: 'First: select a dark wolf.',
    guideMoveGreen: 'Now tap a green point to move that wolf.',
    guideWaitSheep: 'The sheep are responding. Wait for your turn.',
    guideFindCapture: 'Keep the side wolves mobile. Look for a red-ringed sheep to make your first capture.',
    noDrop: 'No shards this clear',
    firstClear: 'First clear',
    repeatClear: 'Repeat clear',
    doubled: '(doubled)',
    universal: 'Universal shards {n}',
  },
  settings: {
    title: 'Settings',
    mute: 'Mute sound',
    help: 'How to play',
    privacy: 'Privacy',
    close: 'Close',
    helpBody: [
      'Command 3 wolves. Gap-eat sheep; eat 8 to win.',
      'Move orthogonally one step. Gap-eat is wolf — empty — sheep; land on the sheep.',
      'Chain up to 5 eats; you may end the chain early.',
      'Sheep move by AI, cannot retreat toward row 1, never capture.',
      'Lose if all three wolves have no moves. Rocks are blocked.',
    ],
  },
  privacy: {
    title: 'Privacy',
    p1: 'Fangrush stores progress in your browser (localStorage). There is no account login in this version.',
    p2: 'We do not upload your game saves or move lists to our own servers.',
    p3: 'Ads (when enabled) follow the ad provider’s privacy policy. Analytics may use anonymous page views.',
    p4: 'Clearing site data resets progress. Contact: via the domain WHOIS / site operator email when published.',
  },
  skins: {
    title: 'Skins',
    equip: 'Equip',
    equipped: 'Equipped',
    cost: '{n} shards',
  },
  quests: {
    title: 'Quests',
    claim: 'Claim',
    claimed: 'Claimed',
    empty: 'No quests yet.',
  },
  common: { back: 'Back', loading: '…' },
  locale: { switchLabel: 'Language' },
}

export const zh: MessageTree = {
  meta: {
    title: '三狼连猎 · Fangrush',
    description: '操控三狼，隔空连吃破阵，借岩石闯关四季猎场。网页免费玩。',
    og: '三狼连猎：隔空连吃，四季闯关。',
  },
  brand: {
    name: 'Fangrush',
    subtitle: '三狼连猎',
    tagline: '操控三狼，隔空连吃破阵，借岩石通关四季猎场。',
    support: '6×6 交点棋盘 · 连吃最多 5 次 · 四季闯关',
  },
  nav: {
    play: '开始冒险',
    continue: '继续狩猎',
    continueNamed: '继续 · {name}',
    skins: '图鉴',
    quests: '任务',
    settings: '设置',
    home: '首页',
    chapters: '猎场',
    privacy: '隐私',
    admin: 'Admin',
    language: '语言',
    howToPlay: '怎么玩',
  },
  home: {
    howTitle: '怎么玩',
    how: [
      '点选一只狼，走到相邻空点。',
      '隔空吃：同线「狼—空—羊」，狼冲到羊位。',
      '同回合可连吃最多 5 次；也可主动结束。',
      '吃满 8 只羊过关；三狼无着则败。',
    ],
    howMore: '完整规则',
    seasonsTitle: '四季猎场',
    seasons: {
      spring: '学规则 · 简易羊群',
      summer: '标准合围 · 开始吃力',
      autumn: '同档 AI · 岩石破阵爽感',
      winter: '大师合围 · 空板硬仗',
    },
    trust: '进度保存在本机浏览器 · 无需登录',
    faqTitle: '常见问题',
    faq: [
      { q: '要下载吗？', a: '不用。浏览器打开即可玩。' },
      { q: '进度会丢吗？', a: '存在本机。清站点数据或换设备会丢。' },
      { q: '手机能玩吗？', a: '可以。竖屏为主，棋盘等比缩放。' },
      { q: '有没有账号？', a: '一期无账号、无云存档。' },
    ],
    secondary: '快捷入口',
  },
  chapters: {
    title: '选择猎场',
    locked: '未解锁',
    unlocked: '可进入',
    howLink: 'Fangrush 怎么玩',
  },
  howTo: {
    title: '三狼连猎怎么玩',
    metaDescription: 'Fangrush（三狼连猎）规则：隔空吃、连吃最多 5 次、岩石与四季猎场。浏览器免费玩。',
    intro: 'Fangrush 是不对称猎杀棋：你操控三狼，对阵十五羊，棋盘为 6×6 交点。',
    winTitle: '胜负',
    winBody: '吃满 8 只羊过关；三狼皆无合法着法即败。',
    moveTitle: '移动与隔空吃',
    moveBody: '狼横竖走一格至空点。同线「狼—空—羊」时可隔空吃：狼落到羊位并移除该羊。',
    chainTitle: '连吃',
    chainBody: '隔空吃后可同回合继续连吃，最多 5 次；也可主动结束连吃以保全站位。',
    sheepTitle: '羊群 AI',
    sheepBody: '羊由电脑移动，不吃子，不能向第 1 行后退。等羊走完你才能再操作。',
    rocksTitle: '岩石与四季',
    rocksBody: '岩石不可落子。春学规则、夏承压、秋密岩破阵、冬空盘硬仗。',
    saveTitle: '本地进度',
    saveBody: '通关、碎片与皮肤存在本机浏览器；无账号。清除站点数据会清空进度。',
    ctaSpring: '去春日 · 空野',
    ctaChapters: '浏览四季猎场',
    faqTitle: '常见问题',
  },
  hunt: {
    playCta: '开始本关',
    seasonLine: '{season} · {rocks} 枚岩石',
    goalLine: '目标：吃掉 {n} 只羊 · 预计 {target} 步',
    teachingLabel: '本关学习',
    levelsLink: '本章全部关卡',
    howLink: '怎么玩',
    prev: '上一关',
    next: '下一关',
    rocksLabel: '{n} 石',
    guideLink: '说明',
  },
  play: {
    back: '返回',
    eaten: '已吃 {n}/8',
    sheepLeft: '剩羊 {n}',
    turnWolf: '狼回合',
    turnSheep: '羊回合',
    chain: '连吃 {n}/5',
    doubleLeft: '双倍掉落 {t}',
    endChain: '结束连吃',
    win: '胜利',
    lose: '失败',
    winSub: '吃羊达到 8 只',
    loseSub: '三狼无路可走',
    draw: '和局',
    drawSub: '对局达到步数上限，请重新挑战。',
    winAdvice: '这条狩猎路线有效。趁三狼分工还清楚，继续下一关。',
    loseAdvice: '重试时保留两狼机动，让第三只狼负责建立接触。',
    firstLoseAdvice: '重试时让中狼接近羊群，两侧狼保留出口，不要三狼追向同一处。',
    drawAdvice: '换一侧建立接触；原地往返和等待不会自动打开羊阵。',
    preparing: '准备中…',
    again: '再来一局',
    doubleAd: '看广告 · 碎片双倍 30 分钟',
    adFailed: '广告暂时不可用，本关进度和碎片不受影响。',
    levelList: '关卡列表',
    nextLevel: '进入下一关',
    tip: '绿点走空格 · 红圈在羊上即隔空吃',
    reset: '重置',
    resetConfirm: '再点确认',
    mute: '静音',
    unmute: '取消静音',
    exit: '退出',
    guideTitle: '春日第一课',
    guideStep1: '点选深色狼，再点绿色高亮空格，即可走一格。',
    guideStep2: '隔空吃：同线「狼—空—羊」时，点红圈羊或中间空即可冲吃。连吃可继续，最多 5 次。',
    guideSkip: '跳过',
    guideNext: '下一步',
    guideStart: '开始猎食',
    guideSelectWolf: '第一步：点选一只深色狼。',
    guideMoveGreen: '现在点绿色空点，让这只狼走一步。',
    guideWaitSheep: '羊群正在回应，等它走完再操作。',
    guideFindCapture: '保持两侧狼能走，寻找带红圈的羊，完成第一次隔空吃。',
    noDrop: '本次无碎片掉落',
    firstClear: '首次通关',
    repeatClear: '重复通关',
    doubled: '（双倍）',
    universal: '通用碎片 {n}',
  },
  settings: {
    title: '设置',
    mute: '静音',
    help: '玩法说明',
    privacy: '隐私说明',
    close: '关闭',
    helpBody: [
      '操控 3 狼，隔空吃绵羊；吃满 8 只获胜。',
      '横竖走一格；隔空吃为「狼—空—羊」同线，狼移到羊位。',
      '连吃最多 5 次，可主动结束连吃。',
      '羊由电脑走，不能往第 1 行退，不吃子。',
      '三狼皆无合法步则失败。岩石不可落子。',
    ],
  },
  privacy: {
    title: '隐私说明',
    p1: '三狼连猎（Fangrush）将进度保存在本机浏览器（localStorage）。本期无账号登录。',
    p2: '我们不会把你的存档或棋谱上传到自建服务器。',
    p3: '启用广告时适用广告商隐私政策。统计可能使用匿名页面浏览。',
    p4: '清除站点数据会重置进度。联系方式见站点运营方公示邮箱。',
  },
  skins: {
    title: '图鉴',
    equip: '穿戴',
    equipped: '已穿戴',
    cost: '{n} 碎片',
  },
  quests: {
    title: '任务',
    claim: '领取',
    claimed: '已领',
    empty: '暂无任务',
  },
  common: { back: '返回', loading: '…' },
  locale: { switchLabel: '语言' },
}

export const messages = { en, zh } as const

export function getMessages(locale: SupportedLocale): MessageTree {
  return messages[locale] ?? en
}

export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}
