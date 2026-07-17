(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/game-core/src/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BOARD_MAX",
    ()=>BOARD_MAX,
    "BOARD_MIN",
    ()=>BOARD_MIN,
    "MAX_CHAIN",
    ()=>MAX_CHAIN,
    "OPENING_SHEEP",
    ()=>OPENING_SHEEP,
    "WIN_EATEN",
    ()=>WIN_EATEN
]);
const BOARD_MIN = 1;
const BOARD_MAX = 6;
const WIN_EATEN = 8;
const MAX_CHAIN = 5;
const OPENING_SHEEP = 15;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/board.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ORTHO",
    ()=>ORTHO,
    "cloneRocks",
    ()=>cloneRocks,
    "inBounds",
    ()=>inBounds,
    "inBoundsPos",
    ()=>inBoundsPos,
    "keyOf",
    ()=>keyOf,
    "parseKey",
    ()=>parseKey,
    "posKey",
    ()=>posKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-client] (ecmascript)");
;
function posKey(r, c) {
    return "".concat(r, ",").concat(c);
}
function keyOf(p) {
    return posKey(p.r, p.c);
}
function parseKey(key) {
    const [rs, cs] = key.split(',');
    return {
        r: Number(rs),
        c: Number(cs)
    };
}
function inBounds(r, c) {
    return r >= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOARD_MIN"] && r <= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOARD_MAX"] && c >= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOARD_MIN"] && c <= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOARD_MAX"];
}
function inBoundsPos(p) {
    return inBounds(p.r, p.c);
}
const ORTHO = [
    {
        r: -1,
        c: 0
    },
    {
        r: 1,
        c: 0
    },
    {
        r: 0,
        c: -1
    },
    {
        r: 0,
        c: 1
    }
];
function cloneRocks(rocks) {
    return new Set(rocks);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/content/levels.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CHAPTER_AI",
    ()=>CHAPTER_AI,
    "CHAPTER_BLURB_EN",
    ()=>CHAPTER_BLURB_EN,
    "CHAPTER_BLURB_ZH",
    ()=>CHAPTER_BLURB_ZH,
    "CHAPTER_LABEL",
    ()=>CHAPTER_LABEL,
    "CHAPTER_LABEL_EN",
    ()=>CHAPTER_LABEL_EN,
    "CHAPTER_ORDER",
    ()=>CHAPTER_ORDER,
    "LEVELS",
    ()=>LEVELS,
    "adjacentLevels",
    ()=>adjacentLevels,
    "getLevel",
    ()=>getLevel,
    "levelBlurb",
    ()=>levelBlurb,
    "levelDisplayName",
    ()=>levelDisplayName,
    "levelsForChapter",
    ()=>levelsForChapter,
    "validateAllLevels",
    ()=>validateAllLevels,
    "validateLevel",
    ()=>validateLevel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-client] (ecmascript)");
;
;
/** Opening piece positions — rocks must not occupy these. */ const OPENING_KEYS = new Set([
    ...[
        1,
        2,
        3
    ].flatMap((r)=>[
            1,
            2,
            3,
            4,
            5
        ].map((c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(r, c))),
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(6, 2),
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(6, 3),
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(6, 5)
]);
const CHAPTER_AI = {
    spring: 'normal',
    summer: 'normal',
    autumn: 'normal',
    winter: 'hard'
};
const CHAPTER_ORDER = [
    'spring',
    'summer',
    'autumn',
    'winter'
];
const CHAPTER_LABEL = {
    spring: '春日',
    summer: '夏日',
    autumn: '秋日',
    winter: '冬日'
};
const CHAPTER_LABEL_EN = {
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter'
};
const CHAPTER_BLURB_EN = {
    spring: 'Learn gap-eat and short chains on a gentle flock — rocks stay scarce.',
    summer: 'The flock blocks for real. Midfield rocks start to matter.',
    autumn: 'Same AI tier as summer, but dense rocks crack your lines and create lanes.',
    winter: 'Empty-board master duel — the hard AI surrounds without rock crutches.'
};
const CHAPTER_BLURB_ZH = {
    spring: '在温和羊群上学会隔空吃与短连吃；岩石很少，专注规则。',
    summer: '羊群开始认真挡线，中场岩石开始影响路线。',
    autumn: 'AI 档位与夏同级，但密岩撕开通道、逼出隔空连吃。',
    winter: '空盘硬仗：高阶合围，不再靠岩石挡点。'
};
const ROCK_COUNT_RANGE = {
    spring: {
        min: 0,
        max: 2
    },
    summer: {
        min: 2,
        max: 4
    },
    autumn: {
        min: 5,
        max: 6
    },
    winter: {
        min: 0,
        max: 0
    }
};
function validateLevel(level) {
    const errors = [];
    const allowedAi = {
        spring: [
            'easy',
            'normal'
        ],
        summer: [
            'normal',
            'hard'
        ],
        autumn: [
            'normal',
            'hard'
        ],
        winter: [
            'hard'
        ]
    };
    if (!allowedAi[level.chapterId].includes(level.ai)) {
        errors.push("ai ".concat(level.ai, " is not allowed for ").concat(level.chapterId));
    }
    if (level.targetEaten !== undefined && (!Number.isInteger(level.targetEaten) || level.targetEaten < 1 || level.targetEaten > 15)) {
        errors.push('targetEaten must be an integer between 1 and 15');
    }
    if (level.maxPlies !== undefined && (!Number.isInteger(level.maxPlies) || level.maxPlies < 20)) {
        errors.push('maxPlies must be an integer of at least 20');
    }
    if (level.expectedPlies) {
        const { min, target, max } = level.expectedPlies;
        if (!(min > 0 && min <= target && target <= max)) {
            errors.push('expectedPlies must satisfy 0 < min <= target <= max');
        }
    }
    const range = ROCK_COUNT_RANGE[level.chapterId];
    if (level.rocks.length < range.min || level.rocks.length > range.max) {
        errors.push("rocks count ".concat(level.rocks.length, " out of range [").concat(range.min, ",").concat(range.max, "] for ").concat(level.chapterId));
    }
    const seen = new Set();
    for (const p of level.rocks){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inBounds"])(p.r, p.c)) {
            errors.push("rock out of bounds (".concat(p.r, ",").concat(p.c, ")"));
            continue;
        }
        const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyOf"])(p);
        if (seen.has(k)) errors.push("duplicate rock ".concat(k));
        seen.add(k);
        if (OPENING_KEYS.has(k)) errors.push("rock on opening piece ".concat(k));
    }
    const adj = new Set();
    for (const a of level.rocks){
        for (const d of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ORTHO"]){
            const nr = a.r + d.r;
            const nc = a.c + d.c;
            if (nr < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOARD_MIN"] || nr > __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOARD_MAX"] || nc < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOARD_MIN"] || nc > __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BOARD_MAX"]) continue;
            if (seen.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(nr, nc))) {
                const pair = [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyOf"])(a),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(nr, nc)
                ].sort().join('|');
                adj.add("adjacent rocks ".concat(pair));
            }
        }
    }
    errors.push(...adj);
    return errors;
}
function L(partial) {
    const seasonTeaching = {
        spring: 'Learn one clear movement or capture idea before adding pressure.',
        summer: 'Read flock blocking and plan a route through midfield pressure.',
        autumn: 'Use dense rock corridors to plan the order of a short chain.',
        winter: 'Keep all wolves mobile and solve the open-board surround.'
    };
    const seasonDifficulty = {
        spring: 1,
        summer: 3,
        autumn: 4,
        winter: 5
    };
    const baseExpected = {
        spring: {
            min: 30,
            target: 100,
            max: 260
        },
        summer: {
            min: 40,
            target: 130,
            max: 290
        },
        autumn: {
            min: 45,
            target: 145,
            max: 300
        },
        winter: {
            min: 50,
            target: 160,
            max: 300
        }
    };
    var _partial_ai, _partial_targetEaten, _partial_maxPlies, _partial_openingTemplate, _partial_teachingPoint, _partial_expectedPlies, _partial_difficulty, _partial_firstClearReward, _partial_repeatDrop;
    return {
        ...partial,
        name: partial.nameZh,
        ai: (_partial_ai = partial.ai) !== null && _partial_ai !== void 0 ? _partial_ai : CHAPTER_AI[partial.chapterId],
        targetEaten: (_partial_targetEaten = partial.targetEaten) !== null && _partial_targetEaten !== void 0 ? _partial_targetEaten : 8,
        maxPlies: (_partial_maxPlies = partial.maxPlies) !== null && _partial_maxPlies !== void 0 ? _partial_maxPlies : 300,
        openingTemplate: (_partial_openingTemplate = partial.openingTemplate) !== null && _partial_openingTemplate !== void 0 ? _partial_openingTemplate : "".concat(partial.chapterId, "-standard-").concat(partial.indexInChapter),
        teachingPoint: (_partial_teachingPoint = partial.teachingPoint) !== null && _partial_teachingPoint !== void 0 ? _partial_teachingPoint : seasonTeaching[partial.chapterId],
        expectedPlies: (_partial_expectedPlies = partial.expectedPlies) !== null && _partial_expectedPlies !== void 0 ? _partial_expectedPlies : baseExpected[partial.chapterId],
        difficulty: (_partial_difficulty = partial.difficulty) !== null && _partial_difficulty !== void 0 ? _partial_difficulty : Math.min(5, seasonDifficulty[partial.chapterId] + Math.max(0, partial.indexInChapter - 1)),
        firstClearReward: (_partial_firstClearReward = partial.firstClearReward) !== null && _partial_firstClearReward !== void 0 ? _partial_firstClearReward : {
            universal: 10,
            season: {
                [partial.chapterId]: 2
            }
        },
        repeatDrop: (_partial_repeatDrop = partial.repeatDrop) !== null && _partial_repeatDrop !== void 0 ? _partial_repeatDrop : {
            chance: 0.3,
            universal: 2
        }
    };
}
_c = L;
function levelDisplayName(level, locale) {
    return locale === 'zh' ? level.nameZh : level.nameEn;
}
function levelBlurb(level, locale) {
    return locale === 'zh' ? level.blurbZh : level.blurbEn;
}
const LEVELS = [
    L({
        id: 'spring-01',
        chapterId: 'spring',
        indexInChapter: 1,
        nameZh: '春日 · 空野',
        nameEn: 'Spring · Open Meadow',
        blurbZh: '带一枚边缘岩石的开阔草地。先学会点选狼、走空格，再试一次隔空吃。',
        blurbEn: 'An open meadow with one safe edge rock. Learn to select a wolf, step to empty points, then try one gap-eat.',
        rocks: [
            {
                r: 4,
                c: 6
            }
        ],
        openingTemplate: 'spring-gentle-edge-rock',
        teachingPoint: 'Select a wolf, make one step, then complete the first gap-eat.',
        expectedPlies: {
            min: 20,
            target: 90,
            max: 220
        },
        difficulty: 1
    }),
    L({
        id: 'spring-02',
        chapterId: 'spring',
        indexInChapter: 2,
        nameZh: '春日 · 一石',
        nameEn: 'Spring · Single Stone',
        blurbZh: '一枚边石轻轻挡路。绕开它，把隔空吃练顺，别急着连吃。',
        blurbEn: 'One edge rock nudges your path. Slip around it, clean a gap-eat, and keep chains short.',
        rocks: [
            {
                r: 4,
                c: 6
            }
        ],
        openingTemplate: 'spring-single-edge-rock',
        teachingPoint: 'Read a rock as a blocked landing point and route around it.',
        expectedPlies: {
            min: 25,
            target: 100,
            max: 240
        },
        difficulty: 2
    }),
    L({
        id: 'spring-03',
        chapterId: 'spring',
        indexInChapter: 3,
        nameZh: '春日 · 双石',
        nameEn: 'Spring · Twin Stones',
        blurbZh: '两枚中场石切开通道。用它们当支点，完成春日的第一次短连吃。',
        blurbEn: 'Two midfield stones split the lanes. Use them as pivots for your first short spring chain.',
        rocks: [
            {
                r: 4,
                c: 2
            },
            {
                r: 4,
                c: 5
            }
        ],
        openingTemplate: 'spring-twin-midfield-rocks',
        teachingPoint: 'Choose a short chain route and end it before stranding a wolf.',
        expectedPlies: {
            min: 30,
            target: 110,
            max: 260
        },
        difficulty: 3
    }),
    L({
        id: 'spring-04',
        chapterId: 'spring',
        indexInChapter: 4,
        ai: 'normal',
        nameZh: '春日 · 回旋',
        nameEn: 'Spring · Turnaround',
        blurbZh: '边缘岩石改变回路，学会先稳住位置再找吃口。',
        blurbEn: 'An edge rock bends the route. Hold position before opening the next gap.',
        rocks: [
            {
                r: 4,
                c: 1
            }
        ],
        openingTemplate: 'spring-edge-turnaround',
        teachingPoint: 'Use a safe reposition before committing to a capture.',
        expectedPlies: {
            min: 35,
            target: 120,
            max: 280
        },
        difficulty: 3
    }),
    L({
        id: 'spring-05',
        chapterId: 'spring',
        indexInChapter: 5,
        ai: 'normal',
        nameZh: '春日 · 双线',
        nameEn: 'Spring · Two Lanes',
        blurbZh: '两条路线都能接近羊群，选择先处理哪一侧。',
        blurbEn: 'Two lanes reach the flock. Choose which side to pressure first.',
        rocks: [
            {
                r: 4,
                c: 1
            },
            {
                r: 4,
                c: 4
            }
        ],
        openingTemplate: 'spring-two-lanes',
        teachingPoint: 'Compare two capture lanes before moving the second wolf.',
        expectedPlies: {
            min: 40,
            target: 130,
            max: 290
        },
        difficulty: 3
    }),
    L({
        id: 'spring-06',
        chapterId: 'spring',
        indexInChapter: 6,
        ai: 'normal',
        nameZh: '春日 · 收束',
        nameEn: 'Spring · Close',
        blurbZh: '春日终局，综合短连吃、路线选择和提前收束。',
        blurbEn: 'Spring finale: combine short chains, route choice, and clean exits.',
        rocks: [
            {
                r: 4,
                c: 1
            },
            {
                r: 4,
                c: 4
            }
        ],
        openingTemplate: 'spring-finale',
        teachingPoint: 'Finish a short spring hunt without stranding a wolf.',
        expectedPlies: {
            min: 45,
            target: 140,
            max: 300
        },
        difficulty: 4
    }),
    L({
        id: 'summer-01',
        chapterId: 'summer',
        indexInChapter: 1,
        nameZh: '夏日 · 裂隙',
        nameEn: 'Summer · Fissure',
        blurbZh: '羊群开始认真挡线。两枚岩石撕开裂隙，逼你选择冲吃方向。',
        blurbEn: 'The flock blocks for real. Two rocks tear a fissure — pick which gap-rush line to force.',
        rocks: [
            {
                r: 3,
                c: 6
            },
            {
                r: 4,
                c: 3
            }
        ],
        openingTemplate: 'summer-midfield-fissure',
        teachingPoint: 'Read flock blocking and choose one of two pressure lanes.',
        expectedPlies: {
            min: 35,
            target: 120,
            max: 280
        },
        difficulty: 3
    }),
    L({
        id: 'summer-02',
        chapterId: 'summer',
        indexInChapter: 2,
        ai: 'hard',
        nameZh: '夏日 · 横切',
        nameEn: 'Summer · Crosscut',
        blurbZh: '三石横切中场。耐心摆位，再隔空切入，别被羊群拖进死角。',
        blurbEn: 'Three rocks crosscut the midfield. Set up patiently, then gap-cut in — don’t get herded into a dead corner.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 1
            },
            {
                r: 4,
                c: 4
            }
        ],
        openingTemplate: 'summer-crosscut-rocks',
        teachingPoint: 'Delay the rush and keep a second wolf available for the crosscut.',
        expectedPlies: {
            min: 40,
            target: 135,
            max: 290
        },
        difficulty: 4
    }),
    L({
        id: 'summer-03',
        chapterId: 'summer',
        indexInChapter: 3,
        nameZh: '夏日 · 拉扯',
        nameEn: 'Summer · Tug',
        blurbZh: '四石拉扯战线。三狼要分工：一狼诱开，另两狼冲吃收割。',
        blurbEn: 'Four rocks tug the front. Split duties: one wolf baits, the other two gap-rush the harvest.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 2
            },
            {
                r: 4,
                c: 5
            },
            {
                r: 5,
                c: 3
            }
        ],
        openingTemplate: 'summer-tug-of-war',
        teachingPoint: 'Split wolf roles and avoid entering a dead corner too early.',
        expectedPlies: {
            min: 45,
            target: 145,
            max: 300
        },
        difficulty: 4
    }),
    L({
        id: 'summer-04',
        chapterId: 'summer',
        indexInChapter: 4,
        nameZh: '夏日 · 分流',
        nameEn: 'Summer · Split Flow',
        blurbZh: '羊群分流后，狼需要决定追击主线还是侧翼。',
        blurbEn: 'The flock splits the flow. Choose the main lane or the flank.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 2
            },
            {
                r: 5,
                c: 5
            }
        ],
        openingTemplate: 'summer-split-flow',
        teachingPoint: 'Assign wolves to pressure two flock lanes without losing mobility.',
        expectedPlies: {
            min: 50,
            target: 150,
            max: 300
        },
        difficulty: 4
    }),
    L({
        id: 'summer-05',
        chapterId: 'summer',
        indexInChapter: 5,
        ai: 'hard',
        nameZh: '夏日 · 反推',
        nameEn: 'Summer · Counterpush',
        blurbZh: '羊群会把狼推向边角，提前保留第二条退路。',
        blurbEn: 'The flock pushes back toward the edge. Keep a second exit open.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 1
            },
            {
                r: 4,
                c: 4
            },
            {
                r: 6,
                c: 1
            }
        ],
        openingTemplate: 'summer-counterpush',
        teachingPoint: 'Protect a retreat route before starting a committed chain.',
        expectedPlies: {
            min: 55,
            target: 160,
            max: 300
        },
        difficulty: 5
    }),
    L({
        id: 'summer-06',
        chapterId: 'summer',
        indexInChapter: 6,
        nameZh: '夏日 · 压线',
        nameEn: 'Summer · Pressure Line',
        blurbZh: '夏日终局，综合阻挡、分工和中场路线压力。',
        blurbEn: 'Summer finale: combine blocking, wolf roles, and midfield pressure.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 2
            },
            {
                r: 4,
                c: 5
            },
            {
                r: 5,
                c: 3
            }
        ],
        openingTemplate: 'summer-pressure-line',
        teachingPoint: 'Coordinate all three wolves before taking the decisive line.',
        expectedPlies: {
            min: 60,
            target: 170,
            max: 300
        },
        difficulty: 5
    }),
    L({
        id: 'autumn-01',
        chapterId: 'autumn',
        indexInChapter: 1,
        ai: 'normal',
        nameZh: '秋日 · 碎盘',
        nameEn: 'Autumn · Shattered Board',
        blurbZh: '六枚岩石把盘面打碎。找窄通道连吃，岩石就是你的跳板。',
        blurbEn: 'Six rocks shatter the board. Hunt narrow corridors — the stones become your springboards.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 1
            },
            {
                r: 4,
                c: 3
            },
            {
                r: 4,
                c: 5
            },
            {
                r: 5,
                c: 2
            },
            {
                r: 5,
                c: 6
            }
        ]
    }),
    L({
        id: 'autumn-02',
        chapterId: 'autumn',
        indexInChapter: 2,
        ai: 'normal',
        nameZh: '秋日 · 通道',
        nameEn: 'Autumn · Corridor',
        blurbZh: '七石挤出一条主通道。控制通道两端，连吃会像潮水一样涌出。',
        blurbEn: 'Seven rocks squeeze one main corridor. Own both ends and chains will surge like a tide.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 1
            },
            {
                r: 4,
                c: 3
            },
            {
                r: 4,
                c: 5
            },
            {
                r: 5,
                c: 2
            },
            {
                r: 5,
                c: 6
            }
        ]
    }),
    L({
        id: 'autumn-03',
        chapterId: 'autumn',
        indexInChapter: 3,
        ai: 'normal',
        nameZh: '秋日 · 丰收',
        nameEn: 'Autumn · Harvest',
        blurbZh: '八石密布的丰收盘。敢冲敢停：连吃满档前记得主动结束，保住胜势。',
        blurbEn: 'An eight-rock harvest board. Rush hard, stop clean — end the chain before you strand a wolf.',
        rocks: [
            {
                r: 1,
                c: 6
            },
            {
                r: 3,
                c: 6
            },
            {
                r: 4,
                c: 2
            },
            {
                r: 4,
                c: 4
            },
            {
                r: 5,
                c: 1
            },
            {
                r: 5,
                c: 3
            }
        ]
    }),
    L({
        id: 'autumn-04',
        chapterId: 'autumn',
        indexInChapter: 4,
        ai: 'normal',
        nameZh: '秋日 · 断桥',
        nameEn: 'Autumn · Broken Bridge',
        blurbZh: '密集岩石留下多个断点，必须提前判断连吃方向。',
        blurbEn: 'Dense rocks leave broken bridges. Read the chain direction early.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 1
            },
            {
                r: 4,
                c: 3
            },
            {
                r: 4,
                c: 5
            },
            {
                r: 5,
                c: 2
            }
        ],
        openingTemplate: 'autumn-broken-bridge',
        teachingPoint: 'Use rock gaps as deliberate chain entry points.',
        expectedPlies: {
            min: 60,
            target: 165,
            max: 300
        },
        difficulty: 5
    }),
    L({
        id: 'autumn-05',
        chapterId: 'autumn',
        indexInChapter: 5,
        ai: 'normal',
        nameZh: '秋日 · 窄门',
        nameEn: 'Autumn · Narrow Gate',
        blurbZh: '两端都要保持通行，任何一只狼走错都会失去窗口。',
        blurbEn: 'Keep both ends open. One careless wolf can close the window.',
        rocks: [
            {
                r: 2,
                c: 6
            },
            {
                r: 4,
                c: 1
            },
            {
                r: 4,
                c: 3
            },
            {
                r: 4,
                c: 5
            },
            {
                r: 5,
                c: 6
            },
            {
                r: 5,
                c: 4
            }
        ],
        openingTemplate: 'autumn-narrow-gate',
        teachingPoint: 'Preserve both corridor ends while planning a forced capture.',
        expectedPlies: {
            min: 65,
            target: 180,
            max: 300
        },
        difficulty: 5
    }),
    L({
        id: 'autumn-06',
        chapterId: 'autumn',
        indexInChapter: 6,
        ai: 'normal',
        nameZh: '秋日 · 丰收终局',
        nameEn: 'Autumn · Harvest Finale',
        blurbZh: '秋日终局，要求在密集岩石中完成干净的连吃。',
        blurbEn: 'Autumn finale: land a clean chain through the dense rock field.',
        rocks: [
            {
                r: 1,
                c: 6
            },
            {
                r: 3,
                c: 6
            },
            {
                r: 4,
                c: 2
            },
            {
                r: 4,
                c: 4
            },
            {
                r: 5,
                c: 1
            }
        ],
        openingTemplate: 'autumn-harvest-finale',
        teachingPoint: 'Balance chain ambition against the need to keep wolves mobile.',
        expectedPlies: {
            min: 70,
            target: 190,
            max: 300
        },
        difficulty: 5
    }),
    L({
        id: 'winter-01',
        chapterId: 'winter',
        indexInChapter: 1,
        nameZh: '冬日 · 空寂',
        nameEn: 'Winter · Silence',
        blurbZh: '空盘寂静。没有岩石挡点，完全靠走位撕开合围。',
        blurbEn: 'Silent empty board. No rocks to lean on — only spacing can tear the surround.',
        rocks: []
    }),
    L({
        id: 'winter-02',
        chapterId: 'winter',
        indexInChapter: 2,
        nameZh: '冬日 · 合围',
        nameEn: 'Winter · Encirclement',
        blurbZh: '高阶羊群合力围狼。先保三狼通路，再找隔空破口。',
        blurbEn: 'A hard flock closes the ring. Keep all three wolves mobile, then punch a gap-eat hole.',
        rocks: []
    }),
    L({
        id: 'winter-03',
        chapterId: 'winter',
        indexInChapter: 3,
        nameZh: '冬日 · 绝境',
        nameEn: 'Winter · Last Stand',
        blurbZh: '四季终章。在绝境里打出干净的隔空连吃，证明你真正掌控猎场。',
        blurbEn: 'Season finale. Land clean gap-chains under pressure — prove you own the hunt.',
        rocks: []
    }),
    L({
        id: 'winter-04',
        chapterId: 'winter',
        indexInChapter: 4,
        nameZh: '冬日 · 回环',
        nameEn: 'Winter · Loop',
        blurbZh: '空盘中羊群不断回环，保持狼的覆盖范围。',
        blurbEn: 'The flock loops across the empty board. Keep wolf coverage wide.',
        rocks: [],
        openingTemplate: 'winter-open-loop',
        teachingPoint: 'Avoid chasing one sheep while the flock changes the whole board.',
        expectedPlies: {
            min: 70,
            target: 180,
            max: 300
        },
        difficulty: 5
    }),
    L({
        id: 'winter-05',
        chapterId: 'winter',
        indexInChapter: 5,
        nameZh: '冬日 · 合围线',
        nameEn: 'Winter · Ring Line',
        blurbZh: '先保持三狼机动，再从边缘撕开第一条吃子线。',
        blurbEn: 'Keep three wolves mobile, then tear the first capture line from the edge.',
        rocks: [],
        openingTemplate: 'winter-ring-line',
        teachingPoint: 'Build a surround before committing to the first gap-eat.',
        expectedPlies: {
            min: 75,
            target: 195,
            max: 300
        },
        difficulty: 5
    }),
    L({
        id: 'winter-06',
        chapterId: 'winter',
        indexInChapter: 6,
        nameZh: '冬日 · 终极狩猎',
        nameEn: 'Winter · Final Hunt',
        blurbZh: '四季终章，检验空盘位置计算和连续狩猎能力。',
        blurbEn: 'The four-season finale: prove open-board calculation and clean chains.',
        rocks: [],
        openingTemplate: 'winter-final-hunt',
        teachingPoint: 'Solve the open-board surround without sacrificing wolf mobility.',
        expectedPlies: {
            min: 80,
            target: 210,
            max: 300
        },
        difficulty: 5
    })
];
function getLevel(id) {
    return LEVELS.find((l)=>l.id === id);
}
function levelsForChapter(chapterId) {
    return LEVELS.filter((l)=>l.chapterId === chapterId).sort((a, b)=>a.indexInChapter - b.indexInChapter);
}
function validateAllLevels() {
    return LEVELS.flatMap((l)=>validateLevel(l).map((e)=>"".concat(l.id, ": ").concat(e)));
}
function adjacentLevels(id) {
    const idx = LEVELS.findIndex((l)=>l.id === id);
    if (idx < 0) return {};
    return {
        prev: idx > 0 ? LEVELS[idx - 1] : undefined,
        next: idx < LEVELS.length - 1 ? LEVELS[idx + 1] : undefined
    };
}
var _c;
__turbopack_context__.k.register(_c, "L");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/content/quests.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QUEST_DEFS",
    ()=>QUEST_DEFS,
    "claimQuest",
    ()=>claimQuest,
    "dailyKey",
    ()=>dailyKey,
    "emptyQuestState",
    ()=>emptyQuestState,
    "recordQuestMetric",
    ()=>recordQuestMetric,
    "refreshQuestPeriod",
    ()=>refreshQuestPeriod,
    "weeklyKey",
    ()=>weeklyKey
]);
const QUEST_DEFS = [
    {
        id: 'daily-play-1',
        period: 'daily',
        title: '今日对局 1 次',
        target: 1,
        metric: 'plays',
        rewardUniversal: 3
    },
    {
        id: 'daily-clear-1',
        period: 'daily',
        title: '今日通关 1 关',
        target: 1,
        metric: 'clears',
        rewardUniversal: 5
    },
    {
        id: 'weekly-clear-3',
        period: 'weekly',
        title: '本周通关 3 关',
        target: 3,
        metric: 'clears',
        rewardUniversal: 15
    },
    {
        id: 'weekly-frag-20',
        period: 'weekly',
        title: '本周获得 20 通用碎片',
        target: 20,
        metric: 'fragments_earned',
        rewardUniversal: 10
    }
];
function dailyKey() {
    let d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return "".concat(y, "-").concat(m, "-").concat(day);
}
function weeklyKey() {
    let d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : new Date();
    const tmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayNum = (tmp.getDay() + 6) % 7;
    tmp.setDate(tmp.getDate() - dayNum + 3);
    const firstThursday = new Date(tmp.getFullYear(), 0, 4);
    const week = 1 + Math.round(((tmp.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
    return "".concat(tmp.getFullYear(), "-W").concat(String(week).padStart(2, '0'));
}
function emptyQuestState() {
    let now = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : new Date();
    return {
        daily: {
            key: dailyKey(now),
            progress: {},
            claimed: []
        },
        weekly: {
            key: weeklyKey(now),
            progress: {},
            claimed: []
        }
    };
}
function refreshQuestPeriod(state) {
    let now = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : new Date();
    const dKey = dailyKey(now);
    const wKey = weeklyKey(now);
    return {
        daily: state.daily.key === dKey ? state.daily : {
            key: dKey,
            progress: {},
            claimed: []
        },
        weekly: state.weekly.key === wKey ? state.weekly : {
            key: wKey,
            progress: {},
            claimed: []
        }
    };
}
function recordQuestMetric(quests, period, metric, amount) {
    let now = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : new Date();
    let q = refreshQuestPeriod(quests, now);
    const apply = (bucket, p)=>{
        const progress = {
            ...bucket.progress
        };
        for (const def of QUEST_DEFS){
            if (def.period !== p || def.metric !== metric) continue;
            var _progress_def_id;
            progress[def.id] = Math.min(def.target, ((_progress_def_id = progress[def.id]) !== null && _progress_def_id !== void 0 ? _progress_def_id : 0) + amount);
        }
        return {
            ...bucket,
            progress
        };
    };
    if (period === 'daily' || period === 'both') {
        q = {
            ...q,
            daily: apply(q.daily, 'daily')
        };
    }
    if (period === 'weekly' || period === 'both') {
        q = {
            ...q,
            weekly: apply(q.weekly, 'weekly')
        };
    }
    return q;
}
function claimQuest(save, questId) {
    let now = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : new Date();
    const def = QUEST_DEFS.find((q)=>q.id === questId);
    if (!def) return {
        ok: false,
        error: 'unknown quest'
    };
    const quests = refreshQuestPeriod(save.quests, now);
    const bucket = def.period === 'daily' ? quests.daily : quests.weekly;
    if (bucket.claimed.includes(questId)) return {
        ok: false,
        error: 'already claimed'
    };
    var _bucket_progress_questId;
    const progress = (_bucket_progress_questId = bucket.progress[questId]) !== null && _bucket_progress_questId !== void 0 ? _bucket_progress_questId : 0;
    if (progress < def.target) return {
        ok: false,
        error: 'incomplete'
    };
    const nextBucket = {
        ...bucket,
        claimed: [
            ...bucket.claimed,
            questId
        ]
    };
    const nextQuests = {
        ...quests,
        [def.period]: nextBucket
    };
    return {
        ok: true,
        save: {
            ...save,
            quests: nextQuests,
            fragments: {
                ...save.fragments,
                universal: save.fragments.universal + def.rewardUniversal
            }
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/content/save.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SAVE_KEY",
    ()=>SAVE_KEY,
    "activateDoubleDrop",
    ()=>activateDoubleDrop,
    "applyClearToSave",
    ()=>applyClearToSave,
    "defaultSave",
    ()=>defaultSave,
    "grantUniversalFragments",
    ()=>grantUniversalFragments,
    "isChapterUnlocked",
    ()=>isChapterUnlocked,
    "isDoubleDropActive",
    ()=>isDoubleDropActive,
    "isLevelCleared",
    ()=>isLevelCleared,
    "migrate",
    ()=>migrate,
    "recomputeUnlockedChapters",
    ()=>recomputeUnlockedChapters,
    "recordPlayStarted",
    ()=>recordPlayStarted,
    "rollClearReward",
    ()=>rollClearReward
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/quests.ts [app-client] (ecmascript)");
;
;
const SAVE_KEY = 'wolf-sheep-save-v1';
function defaultSave() {
    return {
        schemaVersion: 1,
        clearedLevels: [],
        unlockedChapters: [
            'spring'
        ],
        fragments: {
            universal: 0,
            season: {
                spring: 0,
                summer: 0,
                autumn: 0,
                winter: 0
            }
        },
        unlockedSkinIds: [
            'wolf-default',
            'board-default',
            'board-spring'
        ],
        equipped: {
            wolfSetId: 'wolf-default',
            boardId: 'board-default'
        },
        guide: {
            spring1Done: false
        },
        settings: {
            muted: false
        },
        buffs: {
            doubleDropUntil: null
        },
        quests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["emptyQuestState"])()
    };
}
function emptySeason() {
    return {
        spring: 0,
        summer: 0,
        autumn: 0,
        winter: 0
    };
}
function safeAmount(value) {
    let fallback = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}
function parseQuests(raw) {
    var _o_daily, _o_daily1, _o_daily2, _o_weekly, _o_weekly1, _o_weekly2;
    if (!raw || typeof raw !== 'object') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["emptyQuestState"])();
    const o = raw;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["refreshQuestPeriod"])({
        daily: {
            key: typeof ((_o_daily = o.daily) === null || _o_daily === void 0 ? void 0 : _o_daily.key) === 'string' ? o.daily.key : '',
            progress: ((_o_daily1 = o.daily) === null || _o_daily1 === void 0 ? void 0 : _o_daily1.progress) && typeof o.daily.progress === 'object' ? o.daily.progress : {},
            claimed: Array.isArray((_o_daily2 = o.daily) === null || _o_daily2 === void 0 ? void 0 : _o_daily2.claimed) ? o.daily.claimed.filter((x)=>typeof x === 'string') : []
        },
        weekly: {
            key: typeof ((_o_weekly = o.weekly) === null || _o_weekly === void 0 ? void 0 : _o_weekly.key) === 'string' ? o.weekly.key : '',
            progress: ((_o_weekly1 = o.weekly) === null || _o_weekly1 === void 0 ? void 0 : _o_weekly1.progress) && typeof o.weekly.progress === 'object' ? o.weekly.progress : {},
            claimed: Array.isArray((_o_weekly2 = o.weekly) === null || _o_weekly2 === void 0 ? void 0 : _o_weekly2.claimed) ? o.weekly.claimed.filter((x)=>typeof x === 'string') : []
        }
    });
}
function migrate(raw) {
    var _this, _this1, _this2, _this3, _this4;
    if (!raw || typeof raw !== 'object') return defaultSave();
    const o = raw;
    if (o.schemaVersion !== 1) return defaultSave();
    const base = defaultSave();
    const fragments = o.fragments && typeof o.fragments === 'object' ? o.fragments : {};
    const rawSeason = fragments.season && typeof fragments.season === 'object' ? fragments.season : {};
    const unlockedChapters = Array.isArray(o.unlockedChapters) ? o.unlockedChapters.filter((x)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"].includes(x)) : [];
    return {
        schemaVersion: 1,
        clearedLevels: Array.isArray(o.clearedLevels) ? o.clearedLevels.filter((x)=>typeof x === 'string') : [],
        unlockedChapters: unlockedChapters.includes('spring') ? unlockedChapters : [
            'spring',
            ...unlockedChapters
        ],
        fragments: {
            universal: safeAmount(fragments.universal),
            season: {
                ...emptySeason(),
                spring: safeAmount(rawSeason.spring),
                summer: safeAmount(rawSeason.summer),
                autumn: safeAmount(rawSeason.autumn),
                winter: safeAmount(rawSeason.winter)
            }
        },
        unlockedSkinIds: Array.isArray(o.unlockedSkinIds) ? o.unlockedSkinIds.filter((x)=>typeof x === 'string') : base.unlockedSkinIds,
        equipped: {
            wolfSetId: typeof ((_this = o.equipped) === null || _this === void 0 ? void 0 : _this.wolfSetId) === 'string' ? o.equipped.wolfSetId : base.equipped.wolfSetId,
            boardId: typeof ((_this1 = o.equipped) === null || _this1 === void 0 ? void 0 : _this1.boardId) === 'string' ? o.equipped.boardId : base.equipped.boardId
        },
        guide: {
            spring1Done: Boolean((_this2 = o.guide) === null || _this2 === void 0 ? void 0 : _this2.spring1Done)
        },
        settings: {
            muted: Boolean((_this3 = o.settings) === null || _this3 === void 0 ? void 0 : _this3.muted)
        },
        buffs: {
            doubleDropUntil: typeof ((_this4 = o.buffs) === null || _this4 === void 0 ? void 0 : _this4.doubleDropUntil) === 'number' ? o.buffs.doubleDropUntil : null
        },
        quests: parseQuests(o.quests),
        lastPlayedLevelId: typeof o.lastPlayedLevelId === 'string' ? o.lastPlayedLevelId : undefined
    };
}
function isChapterUnlocked(save, chapterId) {
    return save.unlockedChapters.includes(chapterId);
}
function isLevelCleared(save, levelId) {
    return save.clearedLevels.includes(levelId);
}
function recomputeUnlockedChapters(save) {
    const unlocked = [
        'spring'
    ];
    for(let i = 0; i < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"].length - 1; i++){
        const chapter = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"][i];
        const next = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"][i + 1];
        const levels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["levelsForChapter"])(chapter);
        const allClear = levels.every((l)=>save.clearedLevels.includes(l.id));
        if (allClear) unlocked.push(next);
        else break;
    }
    return unlocked;
}
function isDoubleDropActive(save) {
    let now = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Date.now();
    return save.buffs.doubleDropUntil != null && save.buffs.doubleDropUntil > now;
}
function rollClearReward(level, save, rng) {
    let now = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : Date.now();
    const firstClear = !save.clearedLevels.includes(level.id);
    const doubled = isDoubleDropActive(save, now);
    const mult = doubled ? 2 : 1;
    if (firstClear) {
        const season = {};
        var _level_firstClearReward_season;
        for (const [k, v] of Object.entries((_level_firstClearReward_season = level.firstClearReward.season) !== null && _level_firstClearReward_season !== void 0 ? _level_firstClearReward_season : {})){
            season[k] = (v !== null && v !== void 0 ? v : 0) * mult;
        }
        var _level_firstClearReward_universal;
        return {
            universal: ((_level_firstClearReward_universal = level.firstClearReward.universal) !== null && _level_firstClearReward_universal !== void 0 ? _level_firstClearReward_universal : 0) * mult,
            season,
            firstClear: true,
            doubled
        };
    }
    const drop = level.repeatDrop;
    if (!drop || rng.nextFloat() >= drop.chance) {
        return {
            universal: 0,
            season: {},
            firstClear: false,
            doubled
        };
    }
    const season = {};
    var _drop_season;
    for (const [k, v] of Object.entries((_drop_season = drop.season) !== null && _drop_season !== void 0 ? _drop_season : {})){
        season[k] = (v !== null && v !== void 0 ? v : 0) * mult;
    }
    var _drop_universal;
    return {
        universal: ((_drop_universal = drop.universal) !== null && _drop_universal !== void 0 ? _drop_universal : 0) * mult,
        season,
        firstClear: false,
        doubled
    };
}
function applyClearToSave(save, level, grant) {
    const clearedLevels = save.clearedLevels.includes(level.id) ? save.clearedLevels : [
        ...save.clearedLevels,
        level.id
    ];
    const season = {
        ...save.fragments.season
    };
    for (const [k, v] of Object.entries(grant.season)){
        const id = k;
        var _season_id;
        season[id] = ((_season_id = season[id]) !== null && _season_id !== void 0 ? _season_id : 0) + (v !== null && v !== void 0 ? v : 0);
    }
    let quests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["recordQuestMetric"])(save.quests, 'both', 'clears', 1);
    if (grant.universal > 0) {
        quests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["recordQuestMetric"])(quests, 'both', 'fragments_earned', grant.universal);
    }
    const next = {
        ...save,
        clearedLevels,
        fragments: {
            universal: save.fragments.universal + grant.universal,
            season
        },
        lastPlayedLevelId: level.id,
        quests
    };
    next.unlockedChapters = recomputeUnlockedChapters(next);
    const skins = new Set(next.unlockedSkinIds);
    for (const ch of next.unlockedChapters){
        skins.add("board-".concat(ch));
    }
    skins.add('wolf-default');
    skins.add('board-default');
    next.unlockedSkinIds = [
        ...skins
    ];
    return next;
}
function recordPlayStarted(save, levelId) {
    return {
        ...save,
        ...levelId ? {
            lastPlayedLevelId: levelId
        } : {},
        quests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["recordQuestMetric"])(save.quests, 'both', 'plays', 1)
    };
}
function activateDoubleDrop(save) {
    let durationMs = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 30 * 60 * 1000, now = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Date.now();
    return {
        ...save,
        buffs: {
            doubleDropUntil: now + durationMs
        }
    };
}
function grantUniversalFragments(save, amount) {
    let quests = save.quests;
    if (amount > 0) {
        quests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["recordQuestMetric"])(quests, 'both', 'fragments_earned', amount);
    }
    return {
        ...save,
        quests,
        fragments: {
            ...save.fragments,
            universal: save.fragments.universal + amount
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/content/skins.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SKIN_CATALOG",
    ()=>SKIN_CATALOG,
    "equipSkin",
    ()=>equipSkin,
    "getBoardSkin",
    ()=>getBoardSkin,
    "getSkin",
    ()=>getSkin,
    "getWolfSet",
    ()=>getWolfSet,
    "isSkinUnlocked",
    ()=>isSkinUnlocked,
    "resolveSkin",
    ()=>resolveSkin,
    "unlockSkinWithCost",
    ()=>unlockSkinWithCost,
    "validateSkinCatalog",
    ()=>validateSkinCatalog
]);
const SKIN_CATALOG = [
    {
        id: 'wolf-default',
        kind: 'wolf_set',
        name: '原野狼',
        unlock: {
            type: 'default'
        },
        assets: {
            wolf: '/skins/default/wolf.svg',
            sheep: '/skins/default/sheep.svg'
        },
        wolfFill: '#3d4a3a',
        sheepFill: '#f4f1ea'
    },
    {
        id: 'wolf-frost',
        kind: 'wolf_set',
        name: '霜狼',
        unlock: {
            type: 'cost',
            universal: 50
        },
        assets: {
            wolf: '/skins/frost/wolf.svg',
            sheep: '/skins/frost/sheep.svg'
        },
        wolfFill: '#4a6b7c',
        sheepFill: '#e8eef2'
    },
    {
        id: 'wolf-night',
        kind: 'wolf_set',
        name: 'Night Watch',
        unlock: {
            type: 'cost',
            universal: 80
        },
        assets: {
            wolf: '/skins/night/wolf.svg',
            sheep: '/skins/night/sheep.svg'
        },
        wolfFill: '#26364c',
        sheepFill: '#dce8f0'
    },
    {
        id: 'board-default',
        kind: 'board',
        name: '原野棋盘',
        unlock: {
            type: 'default'
        },
        assets: {
            boardBg: '/skins/boards/default.svg'
        },
        boardFill: '#e4f0d8',
        lineStroke: '#4a5c3e'
    },
    {
        id: 'board-spring',
        kind: 'board',
        name: '春日棋盘',
        unlock: {
            type: 'chapter',
            chapterId: 'spring'
        },
        assets: {
            boardBg: '/skins/boards/spring.svg'
        },
        boardFill: '#e8f6d8',
        lineStroke: '#4a7a3a'
    },
    {
        id: 'board-summer',
        kind: 'board',
        name: '夏日棋盘',
        unlock: {
            type: 'chapter',
            chapterId: 'summer'
        },
        assets: {
            boardBg: '/skins/boards/summer.svg'
        },
        boardFill: '#f2e8c0',
        lineStroke: '#6a5a28'
    },
    {
        id: 'board-autumn',
        kind: 'board',
        name: '秋日棋盘',
        unlock: {
            type: 'chapter',
            chapterId: 'autumn'
        },
        assets: {
            boardBg: '/skins/boards/autumn.svg'
        },
        boardFill: '#f2dcb8',
        lineStroke: '#7a4020'
    },
    {
        id: 'board-winter',
        kind: 'board',
        name: '冬日棋盘',
        unlock: {
            type: 'chapter',
            chapterId: 'winter'
        },
        assets: {
            boardBg: '/skins/boards/winter.svg'
        },
        boardFill: '#e8f0f6',
        lineStroke: '#3a5566'
    },
    {
        id: 'board-night',
        kind: 'board',
        name: 'Moonlit Field',
        unlock: {
            type: 'cost',
            season: 'winter',
            amount: 30
        },
        assets: {
            boardBg: '/skins/boards/night.svg'
        },
        boardFill: '#1c3040',
        lineStroke: '#b7c8d4'
    }
];
function getSkin(id) {
    return SKIN_CATALOG.find((s)=>s.id === id);
}
function getWolfSet(id) {
    const s = getSkin(id);
    return (s === null || s === void 0 ? void 0 : s.kind) === 'wolf_set' ? s : undefined;
}
function getBoardSkin(id) {
    const s = getSkin(id);
    return (s === null || s === void 0 ? void 0 : s.kind) === 'board' ? s : undefined;
}
function resolveSkin(save) {
    var _getWolfSet;
    const wolf = (_getWolfSet = getWolfSet(save.equipped.wolfSetId)) !== null && _getWolfSet !== void 0 ? _getWolfSet : getWolfSet('wolf-default');
    var _getBoardSkin;
    const board = (_getBoardSkin = getBoardSkin(save.equipped.boardId)) !== null && _getBoardSkin !== void 0 ? _getBoardSkin : getBoardSkin('board-default');
    return {
        wolfSet: wolf,
        board
    };
}
function isSkinUnlocked(save, skin) {
    if (save.unlockedSkinIds.includes(skin.id)) return true;
    if (skin.unlock.type === 'default') return true;
    if (skin.unlock.type === 'chapter') {
        return save.unlockedChapters.includes(skin.unlock.chapterId);
    }
    return false;
}
function unlockSkinWithCost(save, skinId) {
    const skin = getSkin(skinId);
    if (!skin) return {
        ok: false,
        error: 'skin not found'
    };
    if (isSkinUnlocked(save, skin)) {
        return {
            ok: false,
            error: 'already unlocked'
        };
    }
    if (skin.unlock.type === 'cost' && skin.kind === 'wolf_set') {
        const cost = skin.unlock.universal;
        if (save.fragments.universal < cost) {
            return {
                ok: false,
                error: 'insufficient_universal'
            };
        }
        return {
            ok: true,
            save: {
                ...save,
                fragments: {
                    ...save.fragments,
                    universal: save.fragments.universal - cost
                },
                unlockedSkinIds: [
                    ...save.unlockedSkinIds,
                    skin.id
                ]
            }
        };
    }
    if (skin.unlock.type === 'cost' && skin.kind === 'board') {
        const { season, amount } = skin.unlock;
        var _save_fragments_season_season;
        if (((_save_fragments_season_season = save.fragments.season[season]) !== null && _save_fragments_season_season !== void 0 ? _save_fragments_season_season : 0) < amount) {
            return {
                ok: false,
                error: 'insufficient_season'
            };
        }
        return {
            ok: true,
            save: {
                ...save,
                fragments: {
                    ...save.fragments,
                    season: {
                        ...save.fragments.season,
                        [season]: save.fragments.season[season] - amount
                    }
                },
                unlockedSkinIds: [
                    ...save.unlockedSkinIds,
                    skin.id
                ]
            }
        };
    }
    return {
        ok: false,
        error: 'not purchasable'
    };
}
function equipSkin(save, skinId) {
    const skin = getSkin(skinId);
    if (!skin) return {
        ok: false,
        error: 'not found'
    };
    if (!isSkinUnlocked(save, skin)) return {
        ok: false,
        error: 'locked'
    };
    if (skin.kind === 'wolf_set') {
        return {
            ok: true,
            save: {
                ...save,
                equipped: {
                    ...save.equipped,
                    wolfSetId: skin.id
                }
            }
        };
    }
    return {
        ok: true,
        save: {
            ...save,
            equipped: {
                ...save.equipped,
                boardId: skin.id
            }
        }
    };
}
function validateSkinCatalog() {
    const errors = [];
    const ids = new Set();
    let defaultWolf = 0;
    let defaultBoard = 0;
    for (const s of SKIN_CATALOG){
        if (ids.has(s.id)) errors.push("duplicate id ".concat(s.id));
        ids.add(s.id);
        if (s.kind === 'wolf_set') {
            if (!s.assets.wolf || !s.assets.sheep) errors.push("".concat(s.id, " missing wolf/sheep asset"));
            if (s.unlock.type === 'default') defaultWolf++;
            if (s.unlock.type === 'cost' && s.unlock.universal < 0) errors.push("".concat(s.id, " bad cost"));
        } else {
            if (!s.assets.boardBg) errors.push("".concat(s.id, " missing boardBg"));
            if (s.unlock.type === 'default') defaultBoard++;
            if (s.unlock.type === 'cost' && s.unlock.amount < 0) errors.push("".concat(s.id, " bad cost"));
        }
    }
    if (defaultWolf < 1) errors.push('need default wolf_set');
    if (defaultBoard < 1) errors.push('need default board');
    return errors;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/rules.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MAX_PLIES",
    ()=>DEFAULT_MAX_PLIES,
    "applyAction",
    ()=>applyAction,
    "assertInvariants",
    ()=>assertInvariants,
    "countSide",
    ()=>countSide,
    "createInitialState",
    ()=>createInitialState,
    "endWolfTurn",
    ()=>endWolfTurn,
    "evaluateTerminal",
    ()=>evaluateTerminal,
    "getWolfLegalSummary",
    ()=>getWolfLegalSummary,
    "listLegalActions",
    ()=>listLegalActions,
    "listWolfActionsAsIfTurn",
    ()=>listWolfActionsAsIfTurn,
    "refreshStatus",
    ()=>refreshStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-client] (ecmascript)");
;
;
const SHEEP_OPENING = [
    {
        r: 1,
        c: 1
    },
    {
        r: 1,
        c: 2
    },
    {
        r: 1,
        c: 3
    },
    {
        r: 1,
        c: 4
    },
    {
        r: 1,
        c: 5
    },
    {
        r: 2,
        c: 1
    },
    {
        r: 2,
        c: 2
    },
    {
        r: 2,
        c: 3
    },
    {
        r: 2,
        c: 4
    },
    {
        r: 2,
        c: 5
    },
    {
        r: 3,
        c: 1
    },
    {
        r: 3,
        c: 2
    },
    {
        r: 3,
        c: 3
    },
    {
        r: 3,
        c: 4
    },
    {
        r: 3,
        c: 5
    }
];
const WOLF_OPENING = [
    {
        r: 6,
        c: 2
    },
    {
        r: 6,
        c: 3
    },
    {
        r: 6,
        c: 5
    }
];
const DEFAULT_MAX_PLIES = 300;
function createInitialState(levelId) {
    let rocks = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], targetEaten = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WIN_EATEN"], maxPlies = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : DEFAULT_MAX_PLIES;
    const rockSet = new Set(rocks.map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyOf"])(p)));
    for (const p of [
        ...SHEEP_OPENING,
        ...WOLF_OPENING
    ]){
        if (rockSet.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyOf"])(p))) {
            throw new Error("Rock overlaps opening piece at (".concat(p.r, ",").concat(p.c, ")"));
        }
    }
    const pieces = [
        ...WOLF_OPENING.map((p, i)=>({
                id: "wolf-".concat(i + 1),
                side: 'wolf',
                r: p.r,
                c: p.c
            })),
        ...SHEEP_OPENING.map((p, i)=>({
                id: "sheep-".concat(i + 1),
                side: 'sheep',
                r: p.r,
                c: p.c
            }))
    ];
    return refreshStatus({
        pieces,
        rocks: rockSet,
        eatenSheep: 0,
        toMove: 'wolf',
        chain: null,
        status: 'playing',
        levelId,
        targetEaten,
        plyCount: 0,
        maxPlies
    });
}
function occupancy(state) {
    const map = new Map();
    for (const p of state.pieces){
        map.set((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(p.r, p.c), p);
    }
    return map;
}
function isBlocked(state, r, c, occ) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inBounds"])(r, c)) return true;
    const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(r, c);
    if (state.rocks.has(k)) return true;
    return occ.has(k);
}
function listWolfSteps(state, wolf, occ) {
    const moves = [];
    for (const d of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ORTHO"]){
        const nr = wolf.r + d.r;
        const nc = wolf.c + d.c;
        if (!isBlocked(state, nr, nc, occ)) {
            moves.push({
                type: 'step',
                pieceId: wolf.id,
                to: {
                    r: nr,
                    c: nc
                }
            });
        }
    }
    return moves;
}
/** 隔空吃：狼 — 空 — 羊；落到羊位并移除羊 */ function listWolfJumps(state, wolf, occ) {
    const moves = [];
    for (const d of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ORTHO"]){
        const tr = wolf.r + d.r;
        const tc = wolf.c + d.c;
        const lr = wolf.r + 2 * d.r;
        const lc = wolf.c + 2 * d.c;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inBounds"])(tr, tc) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inBounds"])(lr, lc)) continue;
        const midKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(tr, tc);
        if (state.rocks.has(midKey) || occ.has(midKey)) continue;
        const target = occ.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(lr, lc));
        if (!target || target.side !== 'sheep') continue;
        moves.push({
            type: 'jump',
            pieceId: wolf.id,
            through: {
                r: tr,
                c: tc
            },
            to: {
                r: lr,
                c: lc
            }
        });
    }
    return moves;
}
function listSheepSteps(state, sheep, occ) {
    const moves = [];
    for (const d of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ORTHO"]){
        const nr = sheep.r + d.r;
        const nc = sheep.c + d.c;
        // Cannot retreat toward row 1 (decreasing r)
        if (nr < sheep.r) continue;
        if (!isBlocked(state, nr, nc, occ)) {
            moves.push({
                type: 'step',
                pieceId: sheep.id,
                to: {
                    r: nr,
                    c: nc
                }
            });
        }
    }
    return moves;
}
function listLegalActions(state) {
    if (state.status !== 'playing') return [];
    const occ = occupancy(state);
    if (state.toMove === 'wolf') {
        if (state.chain) {
            const wolf = state.pieces.find((p)=>p.id === state.chain.wolfId);
            if (!wolf || wolf.side !== 'wolf') return [];
            return listWolfJumps(state, wolf, occ);
        }
        const wolves = state.pieces.filter((p)=>p.side === 'wolf');
        const actions = [];
        for (const w of wolves){
            actions.push(...listWolfSteps(state, w, occ), ...listWolfJumps(state, w, occ));
        }
        return actions;
    }
    // sheep turn
    const sheep = state.pieces.filter((p)=>p.side === 'sheep');
    const actions = [];
    for (const s of sheep){
        actions.push(...listSheepSteps(state, s, occ));
    }
    return actions;
}
function listWolfActionsAsIfTurn(state) {
    const probe = {
        ...state,
        toMove: 'wolf',
        chain: null,
        status: 'playing'
    };
    return listLegalActions(probe);
}
function getWolfLegalSummary(state) {
    const probe = {
        ...state,
        toMove: 'wolf',
        chain: null,
        status: 'playing'
    };
    const occ = occupancy(probe);
    return probe.pieces.filter((p)=>p.side === 'wolf').map((w)=>({
            wolfId: w.id,
            steps: listWolfSteps(probe, w, occ).length,
            jumps: listWolfJumps(probe, w, occ).length
        }));
}
function evaluateTerminal(state) {
    if (state.eatenSheep >= state.targetEaten) return 'won';
    if (listWolfActionsAsIfTurn(state).length === 0) return 'lost';
    if (state.plyCount >= state.maxPlies) return 'draw';
    return 'playing';
}
function refreshStatus(state) {
    const status = evaluateTerminal(state);
    if (status === state.status) return state;
    return {
        ...state,
        status,
        chain: status === 'playing' ? state.chain : null
    };
}
function samePos(a, b) {
    return a.r === b.r && a.c === b.c;
}
function actionEquals(a, b) {
    if (a.type !== b.type || a.pieceId !== b.pieceId) return false;
    if (a.type === 'step' && b.type === 'step') return samePos(a.to, b.to);
    if (a.type === 'jump' && b.type === 'jump') {
        return samePos(a.to, b.to) && samePos(a.through, b.through);
    }
    return false;
}
function isLegal(state, action) {
    return listLegalActions(state).some((a)=>actionEquals(a, action));
}
function cloneState(state) {
    return {
        ...state,
        pieces: state.pieces.map((p)=>({
                ...p
            })),
        rocks: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneRocks"])(state.rocks),
        chain: state.chain ? {
            ...state.chain
        } : null,
        plyCount: state.plyCount,
        maxPlies: state.maxPlies
    };
}
function applyAction(state, action) {
    var _state_chain;
    if (state.status !== 'playing') {
        return {
            ok: false,
            error: 'Game already ended'
        };
    }
    if (!isLegal(state, action)) {
        return {
            ok: false,
            error: 'Illegal action'
        };
    }
    let next = cloneState(state);
    next.plyCount += 1;
    const piece = next.pieces.find((p)=>p.id === action.pieceId);
    if (!piece) return {
        ok: false,
        error: 'Piece not found'
    };
    if (action.type === 'step') {
        piece.r = action.to.r;
        piece.c = action.to.c;
        next.chain = null;
        if (next.toMove === 'wolf') {
            next.toMove = 'sheep';
        } else {
            // sheep one step then wolf
            next.toMove = 'wolf';
        }
        return {
            ok: true,
            state: refreshStatus(next)
        };
    }
    // jump / 隔空吃 (wolf only): remove sheep at `to`, wolf lands on `to`
    next.pieces = next.pieces.filter((p)=>!(p.side === 'sheep' && p.r === action.to.r && p.c === action.to.c));
    const wolf = next.pieces.find((p)=>p.id === action.pieceId);
    if (!wolf) return {
        ok: false,
        error: 'Wolf not found after jump'
    };
    wolf.r = action.to.r;
    wolf.c = action.to.c;
    next.eatenSheep += 1;
    if (next.eatenSheep >= next.targetEaten) {
        next.chain = null;
        next.status = 'won';
        return {
            ok: true,
            state: next
        };
    }
    var _state_chain_count;
    const newCount = ((_state_chain_count = (_state_chain = state.chain) === null || _state_chain === void 0 ? void 0 : _state_chain.count) !== null && _state_chain_count !== void 0 ? _state_chain_count : 0) + 1;
    if (newCount >= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAX_CHAIN"]) {
        next.chain = null;
        next.toMove = 'sheep';
        return {
            ok: true,
            state: refreshStatus(next)
        };
    }
    next.chain = {
        wolfId: action.pieceId,
        count: newCount
    };
    next.toMove = 'wolf';
    const remainingJumps = listLegalActions(next).filter((a)=>a.type === 'jump');
    if (remainingJumps.length === 0) {
        next.chain = null;
        next.toMove = 'sheep';
    }
    return {
        ok: true,
        state: refreshStatus(next)
    };
}
function endWolfTurn(state) {
    if (state.status !== 'playing') {
        return {
            ok: false,
            error: 'Game already ended'
        };
    }
    if (state.toMove !== 'wolf') {
        return {
            ok: false,
            error: 'Not wolf turn'
        };
    }
    const next = cloneState(state);
    next.chain = null;
    next.toMove = 'sheep';
    return {
        ok: true,
        state: refreshStatus(next)
    };
}
function assertInvariants(state) {
    const seen = new Set();
    let sheep = 0;
    let wolves = 0;
    for (const p of state.pieces){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inBounds"])(p.r, p.c)) throw new Error("Out of bounds ".concat(p.id));
        const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(p.r, p.c);
        if (seen.has(k)) throw new Error("Overlap at ".concat(k));
        seen.add(k);
        if (state.rocks.has(k)) throw new Error("Piece on rock ".concat(k));
        if (p.side === 'sheep') sheep++;
        else wolves++;
    }
    if (wolves > 3) throw new Error('Too many wolves');
    if (state.eatenSheep !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OPENING_SHEEP"] - sheep) {
        throw new Error("eatenSheep mismatch: ".concat(state.eatenSheep, " vs ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OPENING_SHEEP"] - sheep));
    }
    if (state.chain) {
        if (state.toMove !== 'wolf') throw new Error('chain while not wolf turn');
        if (state.chain.count < 1 || state.chain.count > __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAX_CHAIN"]) {
            throw new Error('invalid chain count');
        }
    }
    if (state.status !== 'playing' && state.chain !== null) {
        throw new Error('chain after terminal');
    }
}
function countSide(state, side) {
    return state.pieces.filter((p)=>p.side === side).length;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/serialize.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deserialize",
    ()=>deserialize,
    "makeState",
    ()=>makeState,
    "serialize",
    ()=>serialize
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-client] (ecmascript)");
;
function serialize(state) {
    return {
        pieces: state.pieces.map((p)=>({
                ...p
            })),
        rocks: [
            ...state.rocks
        ],
        eatenSheep: state.eatenSheep,
        toMove: state.toMove,
        chain: state.chain ? {
            ...state.chain
        } : null,
        status: state.status,
        levelId: state.levelId,
        targetEaten: state.targetEaten,
        plyCount: state.plyCount,
        maxPlies: state.maxPlies
    };
}
function deserialize(data) {
    var _data_targetEaten, _data_plyCount, _data_maxPlies;
    return {
        pieces: data.pieces.map((p)=>({
                ...p
            })),
        rocks: new Set(data.rocks),
        eatenSheep: data.eatenSheep,
        toMove: data.toMove,
        chain: data.chain ? {
            ...data.chain
        } : null,
        status: data.status,
        levelId: data.levelId,
        targetEaten: (_data_targetEaten = data.targetEaten) !== null && _data_targetEaten !== void 0 ? _data_targetEaten : 8,
        plyCount: (_data_plyCount = data.plyCount) !== null && _data_plyCount !== void 0 ? _data_plyCount : 0,
        maxPlies: (_data_maxPlies = data.maxPlies) !== null && _data_maxPlies !== void 0 ? _data_maxPlies : 300
    };
}
function makeState(partial) {
    var _partial_rocks, _partial_eatenSheep, _partial_toMove, _partial_chain, _partial_status, _partial_levelId, _partial_targetEaten, _partial_plyCount, _partial_maxPlies;
    return {
        pieces: partial.pieces.map((p)=>({
                ...p
            })),
        rocks: new Set(((_partial_rocks = partial.rocks) !== null && _partial_rocks !== void 0 ? _partial_rocks : []).map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyOf"])),
        eatenSheep: (_partial_eatenSheep = partial.eatenSheep) !== null && _partial_eatenSheep !== void 0 ? _partial_eatenSheep : 0,
        toMove: (_partial_toMove = partial.toMove) !== null && _partial_toMove !== void 0 ? _partial_toMove : 'wolf',
        chain: (_partial_chain = partial.chain) !== null && _partial_chain !== void 0 ? _partial_chain : null,
        status: (_partial_status = partial.status) !== null && _partial_status !== void 0 ? _partial_status : 'playing',
        levelId: (_partial_levelId = partial.levelId) !== null && _partial_levelId !== void 0 ? _partial_levelId : 'test',
        targetEaten: (_partial_targetEaten = partial.targetEaten) !== null && _partial_targetEaten !== void 0 ? _partial_targetEaten : 8,
        plyCount: (_partial_plyCount = partial.plyCount) !== null && _partial_plyCount !== void 0 ? _partial_plyCount : 0,
        maxPlies: (_partial_maxPlies = partial.maxPlies) !== null && _partial_maxPlies !== void 0 ? _partial_maxPlies : 300
    };
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/ai/evaluate.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "evaluate",
    ()=>evaluate,
    "evaluateScore",
    ()=>evaluateScore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-client] (ecmascript)");
;
;
const W = {
    material: 12,
    wolfMobility: -1.5,
    cluster: 0.8,
    advance: 0.4,
    surround: 2.5,
    safety: 5,
    sheepMobility: 0.6
};
function sheepPositions(state) {
    return state.pieces.filter((p)=>p.side === 'sheep');
}
function wolfPositions(state) {
    return state.pieces.filter((p)=>p.side === 'wolf');
}
/** Average pairwise Chebyshev proximity among sheep (higher = tighter). */ function clusterScore(state) {
    const sheep = sheepPositions(state);
    if (sheep.length < 2) return 0;
    let sum = 0;
    let n = 0;
    for(let i = 0; i < sheep.length; i++){
        for(let j = i + 1; j < sheep.length; j++){
            const a = sheep[i];
            const b = sheep[j];
            const dist = Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c));
            sum += Math.max(0, 5 - dist);
            n++;
        }
    }
    return n === 0 ? 0 : sum / n;
}
/** Prefer sheep not all stuck on row 1. */ function advanceScore(state) {
    const sheep = sheepPositions(state);
    if (sheep.length === 0) return 0;
    return sheep.reduce((s, p)=>s + p.r, 0) / sheep.length;
}
/** Empty ortho neighbors of wolves occupied by sheep or rocks count as pressing. */ function surroundScore(state) {
    const occ = new Set(state.pieces.map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(p.r, p.c)));
    let score = 0;
    for (const w of wolfPositions(state)){
        const dirs = [
            [
                0,
                1
            ],
            [
                0,
                -1
            ],
            [
                1,
                0
            ],
            [
                -1,
                0
            ]
        ];
        for (const [dr, dc] of dirs){
            const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["posKey"])(w.r + dr, w.c + dc);
            if (state.rocks.has(k) || occ.has(k)) score += 1;
        }
    }
    return score;
}
/** Penalize positions where wolves already have a direct jump capture. */ function safetyScore(wolfJumps) {
    return -wolfJumps;
}
/** Keep sheep from choosing moves that leave the flock with no useful exits. */ function sheepMobilityScore(state) {
    if (state.status !== 'playing') return 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLegalActions"])({
        ...state,
        toMove: 'sheep',
        chain: null
    }).length;
}
function evaluate(state) {
    const sheepCount = sheepPositions(state).length;
    const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWolfLegalSummary"])(state);
    const wolfMoves = summary.reduce((s, x)=>s + x.steps + x.jumps, 0);
    const wolfJumps = summary.reduce((s, x)=>s + x.jumps, 0);
    const material = sheepCount;
    const cluster = clusterScore(state);
    const advance = advanceScore(state);
    const surround = surroundScore(state);
    const safety = safetyScore(wolfJumps);
    const sheepMobility = sheepMobilityScore(state);
    const total = W.material * material + W.wolfMobility * wolfMoves + W.cluster * cluster + W.advance * advance + W.surround * surround + W.safety * safety + W.sheepMobility * sheepMobility;
    if (state.status === 'won') {
        return {
            total: -10_000,
            material,
            wolfMobility: wolfMoves,
            cluster,
            advance,
            surround,
            safety,
            sheepMobility
        };
    }
    if (state.status === 'lost' || wolfMoves === 0) {
        return {
            total: 10_000,
            material,
            wolfMobility: wolfMoves,
            cluster,
            advance,
            surround,
            safety,
            sheepMobility
        };
    }
    return {
        total,
        material,
        wolfMobility: wolfMoves,
        cluster,
        advance,
        surround,
        safety,
        sheepMobility
    };
}
function evaluateScore(state) {
    return evaluate(state).total;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/ai/rng.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSeededRng",
    ()=>createSeededRng,
    "pickIndex",
    ()=>pickIndex
]);
function createSeededRng(seed) {
    let t = seed >>> 0;
    return {
        nextFloat () {
            t += 0x6d2b79f5;
            let r = Math.imul(t ^ t >>> 15, 1 | t);
            r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
            return ((r ^ r >>> 14) >>> 0) / 4294967296;
        }
    };
}
function pickIndex(rng, length) {
    if (length <= 0) throw new Error('pickIndex: empty');
    return Math.min(length - 1, Math.floor(rng.nextFloat() * length));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/ai/easy.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickEasy",
    ()=>pickEasy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-client] (ecmascript)");
;
;
;
function pickEasy(state, rng) {
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLegalActions"])(state);
    if (actions.length === 0) throw new Error('easy: no legal sheep moves');
    const scored = actions.map((action)=>{
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) return {
            action,
            score: -Infinity
        };
        return {
            action,
            score: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(result.state)
        };
    });
    // Temperature-ish: weight = exp(score / T) with soft floor
    const T = 8;
    const max = Math.max(...scored.map((s)=>s.score));
    const weights = scored.map((s)=>Math.exp((s.score - max) / T) + 0.15);
    const sum = weights.reduce((a, b)=>a + b, 0);
    let r = rng.nextFloat() * sum;
    for(let i = 0; i < scored.length; i++){
        r -= weights[i];
        if (r <= 0) return scored[i].action;
    }
    return scored[(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickIndex"])(rng, scored.length)].action;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/ai/normal.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickNormal",
    ()=>pickNormal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-client] (ecmascript)");
;
;
;
function pickNormal(state, rng) {
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLegalActions"])(state);
    if (actions.length === 0) throw new Error('normal: no legal sheep moves');
    let best = -Infinity;
    const tops = [];
    for (const action of actions){
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) continue;
        const score = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(result.state);
        if (score > best) {
            best = score;
            tops.length = 0;
            tops.push(action);
        } else if (score === best) {
            tops.push(action);
        }
    }
    if (tops.length === 0) throw new Error('normal: no applicable moves');
    return tops[(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickIndex"])(rng, tops.length)];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/ai/hard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickHard",
    ()=>pickHard,
    "pickHardWithMeta",
    ()=>pickHardWithMeta
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$normal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/normal.ts [app-client] (ecmascript)");
;
;
;
;
const DEFAULT_BUDGETS = {
    maxNodes: 4000,
    maxMs: 12
};
function clockNow() {
    return Date.now();
}
/**
 * After a sheep move, approximate wolf reply by greedy-min (minimize sheep score).
 */ function wolfGreedyMin(state, nodes, budget, start) {
    if (state.status !== 'playing') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(state);
    const wolfState = {
        ...state,
        toMove: 'wolf',
        chain: null
    };
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLegalActions"])(wolfState);
    if (actions.length === 0) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(wolfState);
    let worst = Infinity;
    for (const action of actions){
        if (nodes.n >= budget.maxNodes || clockNow() - start >= budget.maxMs) break;
        nodes.n++;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyAction"])(wolfState, action);
        if (!result.ok) continue;
        let after = result.state;
        if (after.chain && after.status === 'playing') {
            const cont = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLegalActions"])(after);
            if (cont.length === 0 || cont[0].type !== 'jump') {
                after = {
                    ...after,
                    chain: null,
                    toMove: 'sheep'
                };
            }
        }
        const score = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(after);
        if (score < worst) worst = score;
    }
    return worst === Infinity ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(state) : worst;
}
function searchSheep(state, depth, nodes, start, budget) {
    if (depth <= 0 || state.status !== 'playing' || nodes.n >= budget.maxNodes || clockNow() - start >= budget.maxMs) {
        return {
            score: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(state),
            nodes: nodes.n
        };
    }
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLegalActions"])(state);
    if (actions.length === 0) return {
        score: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(state),
        nodes: nodes.n
    };
    let best = -Infinity;
    for (const action of actions){
        if (nodes.n >= budget.maxNodes || clockNow() - start >= budget.maxMs) break;
        nodes.n++;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) continue;
        const afterWolf = wolfGreedyMin(result.state, nodes, budget, start);
        if (afterWolf > best) best = afterWolf;
    }
    return {
        score: best === -Infinity ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluateScore"])(state) : best,
        nodes: nodes.n
    };
}
function pickHardWithMeta(state, rng) {
    let budgets = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : DEFAULT_BUDGETS;
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listLegalActions"])(state);
    if (actions.length === 0) throw new Error('hard: no legal sheep moves');
    const start = clockNow();
    const nodes = {
        n: 0
    };
    let bestScore = -Infinity;
    const tops = [];
    for (const action of actions){
        if (nodes.n >= budgets.maxNodes || clockNow() - start >= budgets.maxMs) break;
        nodes.n++;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) continue;
        const after = wolfGreedyMin(result.state, nodes, budgets, start);
        const deep = searchSheep({
            ...result.state,
            toMove: 'sheep',
            chain: null
        }, 0, nodes, start, budgets);
        const score = Math.max(after, deep.score * 0.01 + after);
        if (score > bestScore) {
            bestScore = score;
            tops.length = 0;
            tops.push(action);
        } else if (score === bestScore) {
            tops.push(action);
        }
    }
    const elapsedMs = clockNow() - start;
    if (tops.length === 0) {
        return {
            action: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$normal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickNormal"])(state, rng),
            meta: {
                degraded: true,
                nodes: nodes.n,
                elapsedMs
            }
        };
    }
    return {
        action: tops[(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickIndex"])(rng, tops.length)],
        meta: {
            degraded: false,
            nodes: nodes.n,
            elapsedMs
        }
    };
}
function pickHard(state, rng) {
    let budgets = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : DEFAULT_BUDGETS;
    return pickHardWithMeta(state, rng, budgets).action;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/ai/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickSheepAction",
    ()=>pickSheepAction,
    "tierForChapter",
    ()=>tierForChapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$easy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/easy.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$normal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/normal.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$hard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/hard.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-client] (ecmascript)");
;
;
;
;
function pickSheepAction(state, ctx) {
    if (state.status !== 'playing') {
        throw new Error('pickSheepAction: game not playing');
    }
    if (state.toMove !== 'sheep') {
        throw new Error('pickSheepAction: not sheep turn');
    }
    switch(ctx.difficulty){
        case 'easy':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$easy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickEasy"])(state, ctx.rng);
        case 'normal':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$normal$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickNormal"])(state, ctx.rng);
        case 'hard':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$hard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickHard"])(state, ctx.rng, ctx.budgets);
        default:
            {
                const _exhaustive = ctx.difficulty;
                return _exhaustive;
            }
    }
}
function tierForChapter(chapterId) {
    switch(chapterId){
        case 'spring':
            return 'easy';
        case 'summer':
        case 'autumn':
            return 'normal';
        case 'winter':
            return 'hard';
    }
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/game-core/src/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/save.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/quests.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$skins$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/skins.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/serialize.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "browserStorage",
    ()=>browserStorage,
    "loadSave",
    ()=>loadSave,
    "persistSave",
    ()=>persistSave
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/save.ts [app-client] (ecmascript)");
;
const browserStorage = {
    getItem (key) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            return window.localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    setItem (key, value) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            window.localStorage.setItem(key, value);
        } catch (e) {
            console.warn('storage set failed', e);
        }
    },
    removeItem (key) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            window.localStorage.removeItem(key);
        } catch (e) {
        /* ignore */ }
    }
};
function loadSave() {
    let storage = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : browserStorage;
    try {
        const raw = storage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAVE_KEY"]);
        if (!raw) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultSave"])();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["migrate"])(JSON.parse(raw));
    } catch (e) {
        console.warn('save load failed, using default', e);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultSave"])();
    }
}
function persistSave(save) {
    let storage = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : browserStorage;
    try {
        storage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAVE_KEY"], JSON.stringify(save));
    } catch (e) {
        console.warn('save persist failed', e);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/lib/save-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSaveStore",
    ()=>useSaveStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$17_react$40$19$2e$2$2e$7$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.17_react@19.2.7/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/save.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/storage.ts [app-client] (ecmascript)");
'use client';
;
;
;
const useSaveStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$17_react$40$19$2e$2$2e$7$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        save: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultSave"])(),
        hydrated: false,
        lastGrant: null,
        hydrate () {
            set({
                save: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadSave"])(),
                hydrated: true
            });
        },
        replace (save) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persistSave"])(save);
            set({
                save,
                hydrated: true
            });
        },
        setLastGrant (g) {
            set({
                lastGrant: g
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/config/locales.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Locale SSOT — aligned with Levelmere as-needed (en unprefixed, zh under /zh).
 */ __turbopack_context__.s([
    "LOCALE_COOKIE",
    ()=>LOCALE_COOKIE,
    "defaultLocale",
    ()=>defaultLocale,
    "getLocaleFromHeaders",
    ()=>getLocaleFromHeaders,
    "isSupportedLocale",
    ()=>isSupportedLocale,
    "localeLabels",
    ()=>localeLabels,
    "localeNavbarLabels",
    ()=>localeNavbarLabels,
    "setLocaleCookie",
    ()=>setLocaleCookie,
    "stripLocalePrefix",
    ()=>stripLocalePrefix,
    "supportedLocales",
    ()=>supportedLocales,
    "withLocalePath",
    ()=>withLocalePath
]);
const supportedLocales = [
    'en',
    'zh'
];
const defaultLocale = 'en';
const localeLabels = {
    en: 'English',
    zh: '简体中文'
};
const localeNavbarLabels = {
    en: 'English',
    zh: '中文'
};
const LOCALE_COOKIE = 'NEXT_LOCALE';
function isSupportedLocale(value) {
    return supportedLocales.includes(value);
}
function stripLocalePrefix(path) {
    const normalized = path.startsWith('/') ? path : "/".concat(path);
    const segments = normalized.split('/').filter(Boolean);
    if (segments[0] === 'zh') {
        const rest = segments.slice(1).join('/');
        return rest ? "/".concat(rest) : '/';
    }
    return normalized;
}
function withLocalePath(path) {
    let locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : defaultLocale;
    const stripped = stripLocalePrefix(path);
    const normalized = stripped.startsWith('/') ? stripped : "/".concat(stripped);
    if (locale === defaultLocale) return normalized;
    if (normalized === '/') return '/zh';
    return "/zh".concat(normalized);
}
function localePrefix2(tag) {
    var _tag_split_;
    var _tag_split__toLowerCase;
    return (_tag_split__toLowerCase = (_tag_split_ = tag.split('-')[0]) === null || _tag_split_ === void 0 ? void 0 : _tag_split_.toLowerCase()) !== null && _tag_split__toLowerCase !== void 0 ? _tag_split__toLowerCase : '';
}
function getLocaleFromHeaders(cookie, acceptLanguage) {
    if (cookie && isSupportedLocale(cookie.trim())) {
        return cookie.trim();
    }
    if (acceptLanguage) {
        const tags = acceptLanguage.split(',').map((t)=>{
            var _t_split_;
            var _t_split__trim;
            return (_t_split__trim = (_t_split_ = t.split(';')[0]) === null || _t_split_ === void 0 ? void 0 : _t_split_.trim()) !== null && _t_split__trim !== void 0 ? _t_split__trim : '';
        });
        for (const tag of tags){
            if (localePrefix2(tag) === 'zh') return 'zh';
        }
    }
    return defaultLocale;
}
function setLocaleCookie(locale) {
    if (typeof document === 'undefined') return;
    const maxAge = 60 * 60 * 24 * 365;
    if (locale === defaultLocale) {
        document.cookie = "".concat(LOCALE_COOKIE, "=en;path=/;max-age=").concat(maxAge, ";SameSite=Lax");
        return;
    }
    document.cookie = "".concat(LOCALE_COOKIE, "=").concat(locale, ";path=/;max-age=").concat(maxAge, ";SameSite=Lax");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/LocaleSwitcher.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocaleLink",
    ()=>LocaleLink,
    "LocaleSwitcher",
    ()=>LocaleSwitcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/config/locales.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function LocaleSwitcher(param) {
    let { locale, variant = 'navbar' } = param;
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])() || '/';
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LocaleSwitcher.useEffect": ()=>{
            const onDoc = {
                "LocaleSwitcher.useEffect.onDoc": (e)=>{
                    var _rootRef_current;
                    if (!((_rootRef_current = rootRef.current) === null || _rootRef_current === void 0 ? void 0 : _rootRef_current.contains(e.target))) setOpen(false);
                }
            }["LocaleSwitcher.useEffect.onDoc"];
            document.addEventListener('mousedown', onDoc);
            return ({
                "LocaleSwitcher.useEffect": ()=>document.removeEventListener('mousedown', onDoc)
            })["LocaleSwitcher.useEffect"];
        }
    }["LocaleSwitcher.useEffect"], []);
    const switchTo = (next)=>{
        if (next === locale) {
            setOpen(false);
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setLocaleCookie"])(next);
        const stripped = ("TURBOPACK compile-time truthy", 1) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripLocalePrefix"])(window.location.pathname) : "TURBOPACK unreachable";
        const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withLocalePath"])(stripped, next);
        const qs = ("TURBOPACK compile-time truthy", 1) ? window.location.search : "TURBOPACK unreachable";
        window.location.assign("".concat(target).concat(qs));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: rootRef,
        className: "relative inline-block text-left",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                "aria-haspopup": "menu",
                "aria-expanded": open,
                "aria-label": "Language",
                onClick: ()=>setOpen((v)=>!v),
                className: variant === 'navbar' ? 'inline-flex min-h-9 w-[6.5rem] items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[#2c3328] hover:bg-[#dfe8d8]/80 sm:w-[7rem]' : 'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#5c6b52] hover:bg-[#dfe8d8]/60',
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "text-sm",
                        children: "🌐"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "min-w-0 flex-1 truncate text-left",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localeNavbarLabels"][locale]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "text-[10px] text-[#5c6b52]",
                        children: "▾"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                role: "menu",
                className: "absolute right-0 z-50 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] py-1 shadow-md",
                children: [
                    'en',
                    'zh'
                ].map((loc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        role: "none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "menuitem",
                            className: "flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-sm text-[#2c3328] hover:bg-[#dfe8d8]",
                            onClick: ()=>switchTo(loc),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localeLabels"][loc]
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                                    lineNumber: 84,
                                    columnNumber: 17
                                }, this),
                                loc === locale ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[#3d4a3a]",
                                    children: "✓"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                                    lineNumber: 85,
                                    columnNumber: 35
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                            lineNumber: 78,
                            columnNumber: 15
                        }, this)
                    }, loc, false, {
                        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                        lineNumber: 77,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                lineNumber: 72,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s(LocaleSwitcher, "+8nLIuw9EilJZDpAnVsCyKGWsSE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = LocaleSwitcher;
function LocaleLink(param) {
    let { href, locale, className, children } = param;
    _s1();
    const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LocaleLink.useMemo[target]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withLocalePath"])(href, locale)
    }["LocaleLink.useMemo[target]"], [
        href,
        locale
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: target,
        className: className,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s1(LocaleLink, "/Y53zmcOwVOBObCXp70vfrJ991U=");
_c1 = LocaleLink;
var _c, _c1;
__turbopack_context__.k.register(_c, "LocaleSwitcher");
__turbopack_context__.k.register(_c1, "LocaleLink");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/components/SiteChrome.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteFooter",
    ()=>SiteFooter,
    "SiteHeader",
    ()=>SiteHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/LocaleSwitcher.tsx [app-client] (ecmascript)");
;
;
function SiteFooter(param) {
    let { locale, t } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        className: "mt-auto border-t border-[#5c6b52]/15 px-6 py-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto flex max-w-lg flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5c6b52]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleLink"], {
                    href: "/how-to-play",
                    locale: locale,
                    className: "hover:underline",
                    children: t.nav.howToPlay
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleLink"], {
                    href: "/chapters",
                    locale: locale,
                    className: "hover:underline",
                    children: t.nav.chapters
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleLink"], {
                    href: "/privacy",
                    locale: locale,
                    className: "hover:underline",
                    children: t.nav.privacy
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleLink"], {
                    href: "/settings",
                    locale: locale,
                    className: "hover:underline",
                    children: t.nav.settings
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleSwitcher"], {
                    locale: locale,
                    variant: "footer"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[#7a8574]",
                    children: "© Fangrush"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: "/admin",
                    className: "ml-auto text-[10px] tracking-wide text-[#7a8574]/70 hover:text-[#5c6b52]",
                    children: t.nav.admin
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = SiteFooter;
function SiteHeader(param) {
    let { locale, brand = 'Fangrush' } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "mx-auto flex max-w-lg items-center justify-between px-6 pt-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleLink"], {
                href: "/",
                locale: locale,
                className: "font-serif text-lg tracking-wide text-[#2c3328]",
                children: brand
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleSwitcher"], {
                locale: locale,
                variant: "navbar"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/SiteChrome.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_c1 = SiteHeader;
var _c, _c1;
__turbopack_context__.k.register(_c, "SiteFooter");
__turbopack_context__.k.register(_c1, "SiteHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/i18n/messages.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "en",
    ()=>en,
    "fmt",
    ()=>fmt,
    "getMessages",
    ()=>getMessages,
    "messages",
    ()=>messages,
    "zh",
    ()=>zh
]);
const en = {
    meta: {
        title: 'Fangrush — Combo board hunt with 3 wolves',
        description: 'Command 3 wolves. Gap-rush sheep on a 6×6 board, chain eats, crack lines with rocks across four seasons.',
        og: 'Fangrush: gap-rush the flock. Chain hunts. Seasonal boards.'
    },
    brand: {
        name: 'Fangrush',
        subtitle: '',
        tagline: 'Command 3 wolves. Gap-rush the flock in chains — break lines with rocks.',
        support: '6×6 point board · chain up to 5 · seasonal hunts'
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
        howToPlay: 'How to play'
    },
    home: {
        howTitle: 'How to play',
        how: [
            'Select a wolf and step to an empty adjacent point.',
            'Gap-eat: wolf — empty — sheep on a line; land on the sheep.',
            'Chain up to 5 eats per turn — or end the chain early.',
            'Eat 8 sheep to clear; lose if all three wolves have no moves.'
        ],
        howMore: 'Full rules',
        seasonsTitle: 'Seasons',
        seasons: {
            spring: 'Learn the hunt · gentle flock',
            summer: 'Real blocking · real pressure',
            autumn: 'Same AI tier · rocks crack the line',
            winter: 'Master surround · empty-board duel'
        },
        trust: 'Progress stays in this browser · no account',
        faqTitle: 'FAQ',
        faq: [
            {
                q: 'Download required?',
                a: 'No. Play in the browser.'
            },
            {
                q: 'Will I lose progress?',
                a: 'Saved locally. Clearing site data or switching devices resets it.'
            },
            {
                q: 'Mobile?',
                a: 'Yes. Portrait-first; the board stays square.'
            },
            {
                q: 'Account?',
                a: 'No accounts or cloud saves in this version.'
            }
        ],
        secondary: 'Quick links'
    },
    chapters: {
        title: 'Choose a hunt',
        locked: 'Locked',
        unlocked: 'Open',
        howLink: 'How to play Fangrush'
    },
    howTo: {
        title: 'How to play Fangrush',
        metaDescription: 'Learn Fangrush rules: gap-eat, chain captures up to 5, rocks, and seasonal hunts. Play free in the browser.',
        intro: 'Fangrush is an asymmetric board hunt: you command three wolves against fifteen sheep on a 6×6 point grid.',
        winTitle: 'Win and lose',
        winBody: 'Eat 8 sheep to clear the level. You lose if all three wolves have no legal moves.',
        moveTitle: 'Move and gap-eat',
        moveBody: 'Wolves step orthogonally to an empty adjacent point. Gap-eat when wolf — empty — sheep share a line: land on the sheep and remove it.',
        chainTitle: 'Chain captures',
        chainBody: 'After a gap-eat you may chain further eats up to 5 times in one turn, or end the chain early to keep position.',
        sheepTitle: 'Sheep AI',
        sheepBody: 'Sheep move by AI, never capture, and cannot retreat toward row 1. Wait for their turn before you move again.',
        rocksTitle: 'Rocks and seasons',
        rocksBody: 'Rocks block landing points. Spring teaches rules; summer adds pressure; autumn packs rocks; winter is an empty-board hard duel.',
        saveTitle: 'Local progress',
        saveBody: 'Clears, shards, and skins stay in this browser. No account. Clearing site data resets everything.',
        ctaSpring: 'Play Spring · Open Meadow',
        ctaChapters: 'Browse seasonal hunts',
        faqTitle: 'FAQ'
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
        guideLink: 'Guide'
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
        preparing: 'Preparing…',
        again: 'Play again',
        doubleAd: 'Watch ad · double shards 30 min',
        adFailed: 'The reward video is unavailable. Your clear is still safe.',
        levelList: 'Level list',
        tip: 'Green = step · Red ring on sheep = gap-eat',
        reset: 'Reset',
        resetConfirm: 'Tap again',
        mute: 'Mute',
        unmute: 'Unmute',
        exit: 'Exit',
        guideTitle: 'Spring lesson',
        guideStep1: 'Select a dark wolf, then tap a green empty point to step.',
        guideStep2: 'Gap-eat: on a line wolf — empty — sheep, tap the red-ringed sheep or the empty middle. Chain up to 5.',
        guideSkip: 'Skip',
        guideNext: 'Next',
        guideStart: 'Start hunt',
        noDrop: 'No shards this clear',
        firstClear: 'First clear',
        repeatClear: 'Repeat clear',
        doubled: '(doubled)',
        universal: 'Universal shards {n}'
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
            'Lose if all three wolves have no moves. Rocks are blocked.'
        ]
    },
    privacy: {
        title: 'Privacy',
        p1: 'Fangrush stores progress in your browser (localStorage). There is no account login in this version.',
        p2: 'We do not upload your game saves or move lists to our own servers.',
        p3: 'Ads (when enabled) follow the ad provider’s privacy policy. Analytics may use anonymous page views.',
        p4: 'Clearing site data resets progress. Contact: via the domain WHOIS / site operator email when published.'
    },
    skins: {
        title: 'Skins',
        equip: 'Equip',
        equipped: 'Equipped',
        cost: '{n} shards'
    },
    quests: {
        title: 'Quests',
        claim: 'Claim',
        claimed: 'Claimed',
        empty: 'No quests yet.'
    },
    common: {
        back: 'Back',
        loading: '…'
    },
    locale: {
        switchLabel: 'Language'
    }
};
const zh = {
    meta: {
        title: '三狼连猎 · Fangrush',
        description: '操控三狼，隔空连吃破阵，借岩石闯关四季猎场。网页免费玩。',
        og: '三狼连猎：隔空连吃，四季闯关。'
    },
    brand: {
        name: 'Fangrush',
        subtitle: '三狼连猎',
        tagline: '操控三狼，隔空连吃破阵，借岩石通关四季猎场。',
        support: '6×6 交点棋盘 · 连吃最多 5 次 · 四季闯关'
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
        howToPlay: '怎么玩'
    },
    home: {
        howTitle: '怎么玩',
        how: [
            '点选一只狼，走到相邻空点。',
            '隔空吃：同线「狼—空—羊」，狼冲到羊位。',
            '同回合可连吃最多 5 次；也可主动结束。',
            '吃满 8 只羊过关；三狼无着则败。'
        ],
        howMore: '完整规则',
        seasonsTitle: '四季猎场',
        seasons: {
            spring: '学规则 · 简易羊群',
            summer: '标准合围 · 开始吃力',
            autumn: '同档 AI · 岩石破阵爽感',
            winter: '大师合围 · 空板硬仗'
        },
        trust: '进度保存在本机浏览器 · 无需登录',
        faqTitle: '常见问题',
        faq: [
            {
                q: '要下载吗？',
                a: '不用。浏览器打开即可玩。'
            },
            {
                q: '进度会丢吗？',
                a: '存在本机。清站点数据或换设备会丢。'
            },
            {
                q: '手机能玩吗？',
                a: '可以。竖屏为主，棋盘等比缩放。'
            },
            {
                q: '有没有账号？',
                a: '一期无账号、无云存档。'
            }
        ],
        secondary: '快捷入口'
    },
    chapters: {
        title: '选择猎场',
        locked: '未解锁',
        unlocked: '可进入',
        howLink: 'Fangrush 怎么玩'
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
        faqTitle: '常见问题'
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
        guideLink: '说明'
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
        preparing: '准备中…',
        again: '再来一局',
        doubleAd: '看广告 · 碎片双倍 30 分钟',
        adFailed: '广告暂时不可用，本关进度和碎片不受影响。',
        levelList: '关卡列表',
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
        noDrop: '本次无碎片掉落',
        firstClear: '首次通关',
        repeatClear: '重复通关',
        doubled: '（双倍）',
        universal: '通用碎片 {n}'
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
            '三狼皆无合法步则失败。岩石不可落子。'
        ]
    },
    privacy: {
        title: '隐私说明',
        p1: '三狼连猎（Fangrush）将进度保存在本机浏览器（localStorage）。本期无账号登录。',
        p2: '我们不会把你的存档或棋谱上传到自建服务器。',
        p3: '启用广告时适用广告商隐私政策。统计可能使用匿名页面浏览。',
        p4: '清除站点数据会重置进度。联系方式见站点运营方公示邮箱。'
    },
    skins: {
        title: '图鉴',
        equip: '穿戴',
        equipped: '已穿戴',
        cost: '{n} 碎片'
    },
    quests: {
        title: '任务',
        claim: '领取',
        claimed: '已领',
        empty: '暂无任务'
    },
    common: {
        back: '返回',
        loading: '…'
    },
    locale: {
        switchLabel: '语言'
    }
};
const messages = {
    en,
    zh
};
function getMessages(locale) {
    var _messages_locale;
    return (_messages_locale = messages[locale]) !== null && _messages_locale !== void 0 ? _messages_locale : en;
}
function fmt(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key)=>{
        var _vars_key;
        return String((_vars_key = vars[key]) !== null && _vars_key !== void 0 ? _vars_key : '');
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/i18n/use-client-locale.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useClientLocale",
    ()=>useClientLocale,
    "useClientMessages",
    ()=>useClientMessages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/i18n/messages.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
function useClientLocale() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])() || '/';
    return pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en';
}
_s(useClientLocale, "wVXOWZKWdId76kQQO0KX6Oz3JDA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
function useClientMessages() {
    _s1();
    const locale = useClientLocale();
    return {
        locale,
        t: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMessages"])(locale)
    };
}
_s1(useClientMessages, "FMi+88uxQ/TyzQ7JaFajfeJc5TY=", false, function() {
    return [
        useClientLocale
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/app/chapters/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChaptersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/save-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/LocaleSwitcher.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$SiteChrome$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/SiteChrome.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$use$2d$client$2d$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/i18n/use-client-locale.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const CHAPTER_THEME = {
    spring: {
        unlocked: 'bg-gradient-to-br from-[#6a9a5a] to-[#3d4a3a]',
        locked: 'bg-[#e4ebe0]/70',
        accent: 'text-[#dfe8d8]'
    },
    summer: {
        unlocked: 'bg-gradient-to-br from-[#c4a035] to-[#6b5a28]',
        locked: 'bg-[#ebe6d8]/70',
        accent: 'text-[#f7f1dc]'
    },
    autumn: {
        unlocked: 'bg-gradient-to-br from-[#c47848] to-[#6b3f28]',
        locked: 'bg-[#ebe0d8]/70',
        accent: 'text-[#f5e6dc]'
    },
    winter: {
        unlocked: 'bg-gradient-to-br from-[#5a7a8a] to-[#2c3a42]',
        locked: 'bg-[#dfe4e8]/70',
        accent: 'text-[#e8eef2]'
    }
};
function ChaptersPage() {
    _s();
    const save = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSaveStore"])({
        "ChaptersPage.useSaveStore[save]": (s)=>s.save
    }["ChaptersPage.useSaveStore[save]"]);
    const hydrate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSaveStore"])({
        "ChaptersPage.useSaveStore[hydrate]": (s)=>s.hydrate
    }["ChaptersPage.useSaveStore[hydrate]"]);
    const { locale, t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$use$2d$client$2d$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useClientMessages"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChaptersPage.useEffect": ()=>{
            hydrate();
        }
    }["ChaptersPage.useEffect"], [
        hydrate
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-dvh flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "page-shell flex flex-1 flex-col gap-6 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleLink"], {
                                href: "/",
                                locale: locale,
                                className: "quiet-action text-sm",
                                children: t.nav.home
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "display-title text-3xl",
                                children: t.chapters.title
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-[#7a8574]",
                                children: save.fragments.universal
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                                lineNumber: 60,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleLink"], {
                        href: "/how-to-play",
                        locale: locale,
                        className: "status-chip text-sm text-[var(--muted)]",
                        children: t.chapters.howLink
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "flex flex-col gap-3",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"].map((id)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChapterCard, {
                                id: id,
                                unlocked: save.unlockedChapters.includes(id),
                                locale: locale,
                                blurb: locale === 'zh' ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_BLURB_ZH"][id] : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_BLURB_EN"][id],
                                lockedLabel: t.chapters.locked
                            }, id, false, {
                                fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                                lineNumber: 69,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$SiteChrome$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SiteFooter"], {
                locale: locale,
                t: t
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/chapters/page.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_s(ChaptersPage, "AKdLyyptUHPseW5oEI3MbHVm9aE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSaveStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSaveStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$use$2d$client$2d$locale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useClientMessages"]
    ];
});
_c = ChaptersPage;
function ChapterCard(param) {
    let { id, unlocked, locale, blurb, lockedLabel } = param;
    const label = locale === 'zh' ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_LABEL"][id] : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAPTER_LABEL_EN"][id];
    const theme = CHAPTER_THEME[id];
    if (!unlocked) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
            className: "rounded-xl border border-[#5c6b52]/15 ".concat(theme.locked, " px-4 py-4 text-[#7a8574]"),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-serif text-lg text-[#5c6b52]",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-1 text-sm",
                    children: lockedLabel
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-2 text-xs leading-relaxed opacity-80",
                    children: blurb
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/app/chapters/page.tsx",
            lineNumber: 102,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleLink"], {
            href: "/levels/".concat(id),
            locale: locale,
            className: "block rounded-xl ".concat(theme.unlocked, " px-4 py-4 ").concat(theme.accent, " shadow-sm transition hover:brightness-110"),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-serif text-lg",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-1 text-sm opacity-90",
                    children: blurb
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/chapters/page.tsx",
                    lineNumber: 117,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/app/chapters/page.tsx",
            lineNumber: 111,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/chapters/page.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
_c1 = ChapterCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "ChaptersPage");
__turbopack_context__.k.register(_c1, "ChapterCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_a08d6207._.js.map