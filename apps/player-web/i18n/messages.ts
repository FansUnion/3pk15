import type { SupportedLocale } from '@/config/locales'

export type MessageTree = {
  meta: { title: string; description: string; og: string }
  brand: { name: string; subtitle: string; tagline: string; support: string }
  nav: {
    play: string
    continue: string
    continueNamed: string
    nextNamed: string
    replayNamed: string
    startFirst: string
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
    eyebrow: string
    heroAlt: string
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
    eyebrow: string
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
    basicsTitle: string
    controlsTitle: string
    strategyTitle: string
    strategyBody: string[]
    diagramTitle: string
    diagramMove: string
    diagramCapture: string
    diagramLegend: string
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
    noRocks: string
    oneRock: string
    guideLink: string
  }
  play: {
    back: string
    eaten: string
    sheepLeft: string
    turnWolf: string
    turnSheep: string
    chain: string
    endChain: string
    endChainCount: string
    chainDecision: string
    win: string
    lose: string
    winSub: string
    loseSub: string
    draw: string
    drawRepetitionSub: string
    drawMaxSub: string
    repetitionWarning: string
    repetitionStrongWarning: string
    gameEnded: string
    winAdvice: string
    loseAdvice: string
    firstLoseAdvice: string
    drawAdvice: string
    preparing: string
    again: string
    rewardAd: string
    rewardAdTarget: string
    rewardAdUnlock: string
    rewardAdGranted: string
    questReady: string
    adFailed: string
    share: string
    sharePreparing: string
    shareShared: string
    shareCopied: string
    shareDownloaded: string
    shareFailed: string
    levelList: string
    nextLevel: string
    resultDetails: string
    viewResult: string
    closeResult: string
    reportGame: string
    reportReady: string
    allSeasons: string
    resultMetrics: string
    none: string
    noCaptures: string
    firstCaptureAt: string
    boardLabel: string
    rockLabel: string
    sheepLabel: string
    wolfLabel: string
    terminalReasons: Record<'targetEaten' | 'wolvesTrapped' | 'maxPlies' | 'repetition' | 'unexpected', string>
    tip: string
    reset: string
    resetConfirm: string
    mute: string
    unmute: string
    exit: string
    more: string
    moreTitle: string
    restart: string
    nextPreview: string
    difficulty: string
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
    wolfSelected: string
    selectWolfFirst: string
    invalidTarget: string
    aiError: string
    aiErrorFallback: string
    retryAi: string
    noDrop: string
    firstClear: string
    repeatClear: string
    universal: string
    rewardBalance: string
    nextRewardTarget: string
    rewardRemaining: string
    rewardReady: string
    openSkins: string
    adBonusSeparate: string
    help: string
    hint: string
    hintTitle: string
    hintLevels: [string, string, string]
    hintObserve: string
    hintGoal: string
    hintStrategy: string
    hintNext: string
    hintClose: string
    hintAvailable: string
    helpTitle: string
    wolfTrapped: string
    restoreSound: string
    soundBlocked: string
  }
  settings: {
    title: string
    mute: string
    help: string
    privacy: string
    close: string
    soundTitle: string
    soundBody: string
    soundPlay: string
    soundReady: string
    soundBlocked: string
    soundLabels: Record<string, string>
  }
  privacy: {
    title: string
    p1: string
    p2: string
    p3: string
    p4: string
  }
  skins: {
    eyebrow: string
    title: string; equip: string; equipped: string; unlocked: string; unlock: string
    universalCost: string; seasonCost: string; chapterUnlock: string; intro: string
    wolfSets: string; boards: string; preview: string; previewActive: string
    unlockSuccess: string; insufficient: string; unavailable: string; costProgress: string; remaining: string; readyUnlock: string
    seasonBalances: string; seasonBalance: string
  }
  quests: {
    title: string; claim: string; claimAll: string; claimed: string; empty: string; daily: string; weekly: string
    reward: string; claimSuccess: string; claimAllSuccess: string; balance: string; error: string; intro: string
    targetRemaining: string; targetReady: string; allCollected: string
  }
  common: { back: string; loading: string }
  locale: { switchLabel: string }
}

export const en: MessageTree = {
  meta: {
    title: 'Fangrush | A 3-wolf strategy board game',
    description:
      'Command three wolves against fifteen AI sheep. Leap across one empty point to capture and master 24 seasonal hunts.',
    og: 'Command three wolves, outmaneuver the flock, and master 24 seasonal hunts.',
  },
  brand: {
    name: 'Fangrush',
    subtitle: '',
    tagline: 'Command three wolves. Outmaneuver the flock. Chain the hunt.',
    support: '6×6 point board · chain up to 5 · seasonal hunts',
  },
  nav: {
    play: 'Play now',
    continue: 'Continue',
    continueNamed: 'Continue · {name}',
    nextNamed: 'Next hunt · {name}',
    replayNamed: 'Play again · {name}',
    startFirst: 'Start from the first hunt',
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
    eyebrow: 'Three wolves · one moving flock',
    heroAlt: 'Three wolves face a flock of sheep on the Fangrush board.',
    howTitle: 'How to play',
    how: [
      'Select a wolf and step to an empty adjacent point.',
      'Leap-capture: wolf — empty — sheep on a line; land on the sheep.',
      'Chain up to 5 captures per turn — or end the chain early.',
      'Capture 8 sheep to clear; lose if all three wolves have no moves.',
    ],
    howMore: 'Full rules',
    seasonsTitle: 'Seasons',
    seasons: {
      spring: 'Learn movement · build confidence',
      summer: 'Real blocking · real pressure',
      autumn: 'Read routes · time the attack',
      winter: 'Master spacing · coordinate all three wolves',
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
    eyebrow: 'Fangrush field guide',
    title: 'How to play Fangrush',
    metaDescription:
      'Learn Fangrush rules: leap across one empty point to capture, chain up to 5 times, and navigate rock-blocked seasonal boards.',
    intro:
      'Fangrush is an asymmetric board hunt: you command three wolves against fifteen sheep on a 6×6 point grid.',
    winTitle: 'Win and lose',
    winBody: 'Reach the capture target before the flock blocks every wolf. If the flock cannot move, it passes and your turn continues.',
    moveTitle: 'Move and leap-capture',
    moveBody:
      'Wolves step orthogonally to an empty adjacent point. Leap-capture when wolf — empty — sheep share a line: land on the sheep and remove it.',
    chainTitle: 'Chain captures',
    chainBody:
      'After a leap-capture you may capture again, up to 5 times in one turn, or stop early to keep a safer position.',
    sheepTitle: 'Sheep AI',
    sheepBody:
      'The computer moves the sheep. They move sideways or toward the wolves, never back toward their starting edge, and never capture. If the whole flock is blocked, it passes the turn.',
    rocksTitle: 'Rocks and seasons',
    rocksBody:
      'Rocks block landing points. Spring teaches movement, summer adds defensive pressure, autumn tests routes and timing, and winter tests spacing and teamwork.',
    saveTitle: 'Local progress',
    saveBody: 'Clears, shards, and skins stay in this browser. No account. Clearing site data resets everything.',
    basicsTitle: 'Rules at a glance',
    controlsTitle: 'Controls and feedback',
    strategyTitle: 'Wolf strategy',
    strategyBody: [
      'Keep all three wolves mobile. One wolf creates contact while the other two cover exits.',
      'Control a route before chasing a single sheep. A capture that traps a wolf can lose the hunt.',
      'Before extending a chain, compare the next landing point with the exits you will leave open.',
      'Rocks are blocked points. Use the corridors around them to split and contain the flock.',
    ],
    diagramTitle: 'Board examples',
    diagramMove: 'Step: wolf moves one point orthogonally into an empty point.',
    diagramCapture: 'Leap-capture: when wolf, empty point, and sheep share a line, tap the sheep to land there and capture it.',
    diagramLegend: 'The examples use the same wolves, sheep, rocks, and action highlights as the live board.',
    ctaSpring: 'Play Spring · Open Meadow',
    ctaChapters: 'Browse seasonal hunts',
    faqTitle: 'FAQ',
  },
  hunt: {
    playCta: 'Play this hunt',
    seasonLine: '{season} · {rocks}',
    goalLine: 'Goal: capture {n} sheep before all wolves are blocked',
    teachingLabel: 'This hunt teaches',
    levelsLink: 'All levels in this season',
    howLink: 'How to play',
    prev: 'Previous',
    next: 'Next',
    rocksLabel: '{n} rocks',
    noRocks: 'No rocks',
    oneRock: '1 rock',
    guideLink: 'Guide',
  },
  play: {
    back: 'Back',
    eaten: 'Captured {n}/{target}',
    sheepLeft: 'Sheep {n}',
    turnWolf: 'Wolf turn',
    turnSheep: 'Sheep turn',
    chain: 'Chain {n}/5',
    endChain: 'End chain',
    endChainCount: 'End chain · {n}/5 captured',
    chainDecision: 'Red rings continue this chain. End now to keep this position and let the sheep respond.',
    win: 'Victory',
    lose: 'Defeat',
    winSub: 'Capture target reached: {target}',
    loseSub: 'No moves for the wolves',
    draw: 'Draw',
    drawRepetitionSub: 'Challenge incomplete: the same position occurred six times.',
    drawMaxSub: 'Challenge incomplete: the action limit was reached.',
    repetitionWarning: 'This position has repeated {n}/6 times. Switch wolves or approach from another side.',
    repetitionStrongWarning: 'One more return to this position will end the challenge.',
    gameEnded: 'Game ended',
    winAdvice: 'Your route worked. Continue while the three-wolf coordination is fresh.',
    loseAdvice: 'On the retry, keep two wolves mobile while the third creates contact.',
    firstLoseAdvice: 'Retry with three roles: the center wolf approaches while both side wolves keep exits covered.',
    drawAdvice: 'Retry with a different approach line; repeated waiting will not open the flock.',
    preparing: 'Preparing…',
    again: 'Play again',
    rewardAd: 'Watch ad · get {n} universal shards now',
    rewardAdTarget: 'Watch ad +{n} · {remaining} left for {name}',
    rewardAdUnlock: 'Watch ad +{n} · unlock {name}',
    rewardAdGranted: 'Reward received: +{n} universal shards.',
    questReady: '{n} quest rewards ready to claim',
    adFailed: 'The reward video is unavailable. Your clear is still safe.',
    share: 'Share result',
    sharePreparing: 'Preparing result card...',
    shareShared: 'Shared.',
    shareCopied: 'Result copied.',
    shareDownloaded: 'Result card downloaded.',
    shareFailed: 'Sharing was cancelled or unavailable.',
    levelList: 'Level list',
    nextLevel: 'Next hunt',
    resultDetails: 'Match details',
    viewResult: 'View result',
    closeResult: 'View final board',
    reportGame: 'Report this game',
    reportReady: 'Game report downloaded. Attach this file when sending feedback.',
    allSeasons: 'All seasons',
    resultMetrics: 'Attempt {attempt} · {time} · {plies} actions · {capture} · {reason}',
    none: 'none',
    noCaptures: 'no captures',
    firstCaptureAt: 'first capture at action {n}',
    boardLabel: 'Fangrush board',
    rockLabel: 'Rock at row {r}, column {c}',
    sheepLabel: 'Sheep',
    wolfLabel: 'Wolf',
    terminalReasons: {
      targetEaten: 'capture target',
      wolvesTrapped: 'wolves trapped',
      maxPlies: 'action limit',
      repetition: 'sixfold repetition',
      unexpected: 'unexpected ending',
    },
    tip: 'Select a wolf. Tap a green empty point to move, or a red-ringed sheep to capture.',
    reset: 'Restart',
    resetConfirm: 'Tap again',
    mute: 'Mute',
    unmute: 'Unmute',
    exit: 'Leave hunt',
    more: 'More',
    moreTitle: 'Hunt options',
    restart: 'Restart hunt',
    nextPreview: 'Up next',
    difficulty: 'Challenge {n}/5',
    guideTitle: 'Spring lesson',
    guideStep1: 'Select a dark wolf, then tap a green empty point to step.',
    guideStep2:
      'Leap capture: when wolf — empty point — sheep share a line, tap the red-ringed sheep. Chain up to 5 captures.',
    guideSkip: 'Skip',
    guideNext: 'Next',
    guideStart: 'Start hunt',
    guideSelectWolf: 'First: select a dark wolf.',
    guideMoveGreen: 'Now tap a green point to move that wolf.',
    guideWaitSheep: 'The sheep are responding. Wait for your turn.',
    guideFindCapture: 'Keep the side wolves mobile. Look for a red-ringed sheep to make your first capture.',
    wolfSelected: 'Wolf selected. Tap a green empty point to move, or a red-ringed sheep to capture.',
    selectWolfFirst: 'Select a wolf before choosing a destination.',
    invalidTarget: 'That point is not legal. Tap a green empty point or a red-ringed sheep.',
    aiError: 'The sheep turn was interrupted.',
    aiErrorFallback: 'The board is safe. Retry the same sheep turn.',
    retryAi: 'Retry sheep turn',
    noDrop: 'No shards this clear',
    firstClear: 'First clear',
    repeatClear: 'Repeat clear',
    universal: 'Universal shards {n}',
    rewardBalance: 'Current balance: {n} universal shards',
    nextRewardTarget: 'Next skin: {name} · {cost} universal shards',
    rewardRemaining: '{n} more shards needed',
    rewardReady: 'Enough shards — ready to unlock',
    openSkins: 'View and equip skins',
    adBonusSeparate: 'Ad bonuses are optional and never replace this clear reward.',
    help: 'Help',
    hint: 'Hint',
    hintTitle: 'Hunt guidance',
    hintLevels: ['Observe', 'Objective', 'Strategy'],
    hintObserve: 'Watch for this pattern: {point}',
    hintGoal: 'Your objective: {point}',
    hintStrategy: 'Plan before moving: {point}',
    hintNext: 'Show next level',
    hintClose: 'Return to hunt',
    hintAvailable: 'You have failed this hunt twice. A free strategy hint is available.',
    helpTitle: 'Field guide',
    wolfTrapped: 'One wolf is trapped. Use the other wolves to reopen a route.',
    restoreSound: 'Restore sound',
    soundBlocked: 'Sound is paused by the browser.',
  },
  settings: {
    title: 'Settings',
    mute: 'Mute sound',
    help: 'How to play',
    privacy: 'Privacy',
    close: 'Close',
    soundTitle: 'Sound check',
    soundBody: 'Play each game moment. The label describes when it is heard during a hunt.',
    soundPlay: 'Play',
    soundReady: 'Sound is ready.',
    soundBlocked: 'Your browser paused sound. Press a sound button again to restore it.',
    soundLabels: { step: 'Wolf moves', sheepStep: 'Sheep moves', jump: 'Capture', chain: 'Chain capture', threat: 'Sheep newly in danger', trapped: 'One wolf becomes trapped', win: 'Victory', lose: 'Defeat', draw: 'Repeated position or move limit', select: 'Select wolf', invalid: 'Invalid destination', ai: 'Sheep thinking', unlock: 'Unlock skin', equip: 'Equip skin' },
  },
  privacy: {
    title: 'Privacy',
    p1: 'Fangrush stores progress only in this browser. There is no account login in this version.',
    p2: 'We do not upload your game saves or move lists to our own servers.',
    p3: 'Ads, when enabled, follow the active platform or ad provider privacy policy.',
    p4: 'Clearing site data resets progress. Contact the site operator through the email published on fangrush.com.',
  },
  skins: {
    eyebrow: 'Collection',
    title: 'Skins',
    equip: 'Equip',
    equipped: 'Equipped',
    unlocked: 'Unlocked',
    unlock: 'Unlock',
    universalCost: '{n} universal shards',
    seasonCost: '{n} {season} shards',
    chapterUnlock: 'Unlocked when this season opens',
    intro: 'The field preview updates immediately. Wolf, sheep, and board belong to one theme.',
    wolfSets: 'Wolf sets',
    boards: 'Field boards',
    preview: 'Field preview',
    previewActive: 'Changes apply immediately',
    unlockSuccess: 'Unlocked and ready to equip.',
    insufficient: 'Not enough shards. Clear more hunts first.',
    unavailable: 'This skin could not be unlocked. Refresh and try again.',
    costProgress: '{current}/{cost} shards',
    remaining: '{n} more needed',
    readyUnlock: 'Ready to unlock',
    seasonBalances: 'Season shards',
    seasonBalance: '{season}: {n}',
  },
  quests: {
    title: 'Quests',
    claim: 'Claim',
    claimAll: 'Claim all',
    claimed: 'Claimed',
    empty: 'No quests yet.',
    daily: 'Daily',
    weekly: 'Weekly',
    reward: '+{n} universal shards',
    claimSuccess: 'Claimed +{n} universal shards',
    claimAllSuccess: 'Claimed {count} rewards · +{n} universal shards',
    balance: '{n} universal shards',
    error: 'Quest status changed. Refresh and try again.',
    intro: 'Quests track automatically. Claim completed rewards here; completed rewards are protected when the day or week changes.',
    targetRemaining: '{name}: {n} more shards needed',
    targetReady: '{name} is ready to unlock',
    allCollected: 'All current character themes are collected.',
  },
  common: { back: 'Back', loading: '…' },
  locale: { switchLabel: 'Language' },
}

export const zh: MessageTree = {
  meta: {
    title: '三狼连猎 · Fangrush',
    description: '操控三狼对阵十五只 AI 羊，隔空连吃，挑战四季 24 关。网页免费玩。',
    og: '三狼连猎：隔空连吃，四季闯关。',
  },
  brand: {
    name: 'Fangrush',
    subtitle: '三狼连猎',
    tagline: '操控三狼，隔空连吃破阵，闯过四季猎场。',
    support: '6×6 交点棋盘 · 连吃最多 5 次 · 四季闯关',
  },
  nav: {
    play: '开始冒险',
    continue: '继续狩猎',
    continueNamed: '继续 · {name}',
    nextNamed: '下一关 · {name}',
    replayNamed: '再次挑战 · {name}',
    startFirst: '从第一关开始',
    skins: '装扮',
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
    eyebrow: '三狼迎战 · 羊群应变',
    heroAlt: 'Fangrush 棋盘上，三只狼正在围猎羊群。',
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
      spring: '基础走位 · 逐步学习',
      summer: '标准合围 · 开始吃力',
      autumn: '判断路线 · 把握时机',
      winter: '控制间距 · 三狼协作',
    },
    trust: '进度保存在本机浏览器 · 无需登录',
    faqTitle: '常见问题',
    faq: [
      { q: '要下载吗？', a: '不用。浏览器打开即可玩。' },
      { q: '进度会丢吗？', a: '存在本机。清站点数据或换设备会丢。' },
      { q: '手机能玩吗？', a: '可以。竖屏为主，棋盘等比缩放。' },
      { q: '有没有账号？', a: '当前版本暂无账号和云存档。' },
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
    eyebrow: 'Fangrush 猎场指南',
    title: '三狼连猎怎么玩',
    metaDescription: 'Fangrush（三狼连猎）规则：隔空吃、连吃最多 5 次、岩石与四季猎场。浏览器免费玩。',
    intro: 'Fangrush 是不对称猎杀棋：你操控三狼，对阵十五羊，棋盘为 6×6 交点。',
    winTitle: '胜负',
    winBody: '在三狼被全部封住前达到本关捕食目标。若全体羊都无法移动，羊方跳过一次，继续轮到狼方。',
    moveTitle: '移动与隔空吃',
    moveBody: '狼横竖走一格至空点。同线「狼—空—羊」时可隔空吃：狼落到羊位并移除该羊。',
    chainTitle: '连吃',
    chainBody: '隔空吃后可同回合继续连吃，最多 5 次；也可主动结束连吃以保全站位。',
    sheepTitle: '羊群 AI',
    sheepBody: '羊由电脑移动，可以横向走或朝狼方前进，不能退回开局所在的一侧，也不能吃子。若全体羊都无路可走，羊方跳过一次。',
    rocksTitle: '岩石与四季',
    rocksBody: '岩石不可落子。春季学习走位，夏季面对封锁，秋季判断路线与时机，冬季考验间距和三狼配合。',
    saveTitle: '本地进度',
    saveBody: '通关、碎片与皮肤存在本机浏览器；无账号。清除站点数据会清空进度。',
    basicsTitle: '基础规则',
    controlsTitle: '操作与反馈',
    strategyTitle: '狼方基础策略',
    strategyBody: [
      '保持三只狼都有行动空间：一狼建立接触，另外两狼控制出口。',
      '先控制路线再追单羊。一次捕食如果让狼失去退路，可能直接输掉本局。',
      '继续连吃前，比较下一个落点与仍然开放的出口。',
      '岩石是不可落脚点。利用岩石之间的通道分割并限制羊群。',
    ],
    diagramTitle: '棋盘图例',
    diagramMove: '普通移动：狼横向或纵向走一格，落到相邻空点。',
    diagramCapture: '隔空吃：同线「狼—空—羊」，狼落到羊位并移除羊。',
    diagramLegend: 'W = 狼 · S = 羊 · # = 岩石 · . = 空点',
    ctaSpring: '去春日 01 · 初猎之野',
    ctaChapters: '浏览四季猎场',
    faqTitle: '常见问题',
  },
  hunt: {
    playCta: '开始本关',
    seasonLine: '{season} · {rocks}',
    goalLine: '目标：在三狼被封住前捕获 {n} 只羊',
    teachingLabel: '本关学习',
    levelsLink: '本章全部关卡',
    howLink: '怎么玩',
    prev: '上一关',
    next: '下一关',
    rocksLabel: '{n} 枚岩石',
    noRocks: '无岩石',
    oneRock: '1 枚岩石',
    guideLink: '说明',
  },
  play: {
    back: '返回',
    eaten: '捕获 {n}/{target}',
    sheepLeft: '剩羊 {n}',
    turnWolf: '狼回合',
    turnSheep: '羊回合',
    chain: '连吃 {n}/5',
    endChain: '结束连吃',
    endChainCount: '结束连吃 · 已连吃 {n}/5',
    chainDecision: '点红圈可继续连吃；现在收手会保留当前位置，并交给羊方行动。',
    win: '胜利',
    lose: '失败',
    winSub: '已达到捕食目标：{target} 只',
    loseSub: '三狼无路可走',
    draw: '和局',
    drawRepetitionSub: '挑战未完成：同一局面已经重复六次。',
    drawMaxSub: '挑战未完成：本局已达到行动上限。',
    repetitionWarning: '当前局面已重复 {n}/6 次。请换一只狼，或从另一侧建立接触。',
    repetitionStrongWarning: '再回到当前局面一次，本局将以僵局结束。',
    gameEnded: '对局已结束',
    winAdvice: '这条狩猎路线有效。趁三狼分工还清楚，继续下一关。',
    loseAdvice: '重试时保留两狼机动，让第三只狼负责建立接触。',
    firstLoseAdvice: '重试时让中狼接近羊群，两侧狼保留出口，不要三狼追向同一处。',
    drawAdvice: '换一侧建立接触；原地往返和等待不会自动打开羊阵。',
    preparing: '准备中…',
    again: '再来一局',
    rewardAd: '看广告 · 立即获得 {n} 通用碎片',
    rewardAdTarget: '看视频 +{n} · 距离{name}还差 {remaining}',
    rewardAdUnlock: '看视频 +{n} · 可解锁{name}',
    rewardAdGranted: '奖励已到账：通用碎片 +{n}。',
    questReady: '有 {n} 项任务奖励可领取',
    adFailed: '广告暂时不可用，本关进度和碎片不受影响。',
    share: '分享战绩',
    sharePreparing: '正在生成战绩卡片...',
    shareShared: '已分享。',
    shareCopied: '战绩文字已复制。',
    shareDownloaded: '战绩卡片已下载。',
    shareFailed: '分享已取消或暂不可用。',
    levelList: '关卡列表',
    nextLevel: '进入下一关',
    resultDetails: '本局详情',
    viewResult: '查看结果',
    closeResult: '查看终局棋盘',
    reportGame: '报告本局问题',
    reportReady: '问题记录已下载。反馈时请附上这个文件。',
    allSeasons: '返回四季总览',
    resultMetrics: '第 {attempt} 次 · 用时 {time} · {plies} 次行动 · {capture} · {reason}',
    none: '无',
    noCaptures: '本局未捕获',
    firstCaptureAt: '第 {n} 次行动首次捕获',
    boardLabel: 'Fangrush 棋盘',
    rockLabel: '第 {r} 行第 {c} 列的岩石',
    sheepLabel: '羊',
    wolfLabel: '狼',
    terminalReasons: {
      targetEaten: '达到捕食目标',
      wolvesTrapped: '三狼无合法行动',
      maxPlies: '达到行动上限',
      repetition: '同一局面重复六次',
      unexpected: '异常终局',
    },
    tip: '先选一只狼。点绿色空位移动；点红圈中的羊捕食。',
    reset: '重新开始',
    resetConfirm: '再点确认',
    mute: '静音',
    unmute: '取消静音',
    exit: '退出本局',
    more: '更多',
    moreTitle: '本局选项',
    restart: '重新开始本局',
    nextPreview: '下一关',
    difficulty: '挑战难度 {n}/5',
    guideTitle: '春日第一课',
    guideStep1: '点选深色狼，再点绿色高亮空格，即可走一格。',
    guideStep2: '隔空吃：同线「狼—空—羊」时，点红圈中的羊。完成后可继续连吃，最多 5 次。',
    guideSkip: '跳过',
    guideNext: '下一步',
    guideStart: '开始猎食',
    guideSelectWolf: '第一步：点选一只深色狼。',
    guideMoveGreen: '现在点绿色空点，让这只狼走一步。',
    guideWaitSheep: '羊群正在回应，等它走完再操作。',
    guideFindCapture: '保持两侧狼能走，寻找带红圈的羊，完成第一次隔空吃。',
    wolfSelected: '已选中狼：点绿色空位移动；点红圈中的羊捕食。',
    selectWolfFirst: '请先点选一只狼，再选择落点。',
    invalidTarget: '这里不能走。请点绿色空位，或点红圈中的羊。',
    aiError: '羊方行动中断。',
    aiErrorFallback: '当前棋盘已保留，可以重试同一个羊回合。',
    retryAi: '重试羊回合',
    noDrop: '本次无碎片掉落',
    firstClear: '首次通关',
    repeatClear: '重复通关',
    universal: '通用碎片 {n}',
    rewardBalance: '当前通用碎片：{n}',
    nextRewardTarget: '下一件皮肤：{name} · 需要 {cost} 通用碎片',
    rewardRemaining: '还差 {n} 碎片',
    rewardReady: '碎片已足够，可以兑换',
    openSkins: '查看并装备皮肤',
    adBonusSeparate: '广告奖励为可选加成，不会替代本局基础奖励。',
    help: '帮助',
    hint: '提示',
    hintTitle: '本关指导',
    hintLevels: ['观察', '目标', '策略'],
    hintObserve: '先观察：{point}',
    hintGoal: '本关目标：{point}',
    hintStrategy: '行动前规划：{point}',
    hintNext: '查看下一层',
    hintClose: '返回对局',
    hintAvailable: '本关已连续失败两次，可以免费查看策略提示。',
    helpTitle: '猎场帮助',
    wolfTrapped: '一只狼已被困住。调动其他狼，尝试重新打开路线。',
    restoreSound: '恢复声音',
    soundBlocked: '浏览器暂停了声音。',
  },
  settings: {
    title: '设置',
    mute: '静音',
    help: '玩法说明',
    privacy: '隐私说明',
    close: '关闭',
    soundTitle: '声音试听',
    soundBody: '逐项试听真实游戏场景；名称表示它会在什么时候播放。',
    soundPlay: '播放',
    soundReady: '声音已恢复。',
    soundBlocked: '浏览器暂停了声音，请再次点击任一试听按钮恢复。',
    soundLabels: { step: '狼移动', sheepStep: '羊移动', jump: '第一次捕食', chain: '连续捕食', threat: '羊新进入危险', trapped: '一只狼新近受困', win: '胜利', lose: '失败', draw: '僵局或行动耗尽', select: '选中狼', invalid: '无效落点', ai: '羊方思考', unlock: '解锁皮肤', equip: '装备皮肤' },
  },
  privacy: {
    title: '隐私说明',
    p1: '三狼连猎（Fangrush）只把进度保存在当前浏览器。当前版本暂无账号登录。',
    p2: '我们不会把你的存档或棋谱上传到自建服务器。',
    p3: '启用广告时，适用当前平台或广告服务商的隐私政策。',
    p4: '清除站点数据会重置进度。联系方式见站点运营方公示邮箱。',
  },
  skins: {
    eyebrow: '装扮收藏',
    title: '装扮',
    equip: '穿戴',
    equipped: '已穿戴',
    unlocked: '已解锁',
    unlock: '兑换',
    universalCost: '{n} 通用碎片',
    seasonCost: '{n} {season}碎片',
    chapterUnlock: '解锁对应季节后获得',
    intro: '选择皮肤后，猎场预览会立即更新。狼、羊与棋盘应属于同一个主题。',
    wolfSets: '狼羊套装',
    boards: '猎场棋盘',
    preview: '猎场预览',
    previewActive: '装备后立即生效',
    unlockSuccess: '已解锁，可立即装备。',
    insufficient: '碎片不足，先完成更多猎场。',
    unavailable: '暂时无法解锁这件装扮，请刷新后重试。',
    costProgress: '已有 {current}/{cost} 碎片',
    remaining: '还差 {n}',
    readyUnlock: '可以兑换',
    seasonBalances: '四季碎片',
    seasonBalance: '{season}：{n}',
  },
  quests: {
    title: '任务',
    claim: '领取',
    claimAll: '全部领取',
    claimed: '已领',
    empty: '暂无任务',
    daily: '每日',
    weekly: '每周',
    reward: '+{n} 通用碎片',
    claimSuccess: '领取 +{n} 通用碎片',
    claimAllSuccess: '已领取 {count} 项奖励 · 通用碎片 +{n}',
    balance: '通用碎片 {n}',
    error: '任务状态已更新，请刷新后重试。',
    intro: '任务无需接取，正常游玩会自动累计。已完成奖励可在这里领取；跨日或跨周时，完成但未领取的奖励会自动保留。',
    targetRemaining: '距离{name}还差 {n} 通用碎片',
    targetReady: '碎片已足够兑换{name}',
    allCollected: '当前角色主题已经全部收集。',
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

export function formatRockCount(count: number, locale: SupportedLocale, t: MessageTree): string {
  if (count === 0) return t.hunt.noRocks
  if (count === 1) return t.hunt.oneRock
  return fmt(t.hunt.rocksLabel, { n: count })
}
