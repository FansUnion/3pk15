module.exports = [
"[project]/packages/game-core/src/types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/packages/game-core/src/board.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-ssr] (ecmascript)");
;
function posKey(r, c) {
    return `${r},${c}`;
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
    return r >= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MIN"] && r <= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"] && c >= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MIN"] && c <= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"];
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
}),
"[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MAX_PLIES",
    ()=>DEFAULT_MAX_PLIES,
    "DEFAULT_SHEEP_OPENING",
    ()=>DEFAULT_SHEEP_OPENING,
    "DEFAULT_WOLF_OPENING",
    ()=>DEFAULT_WOLF_OPENING,
    "applyAction",
    ()=>applyAction,
    "assertInvariants",
    ()=>assertInvariants,
    "boardPositionKey",
    ()=>boardPositionKey,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-ssr] (ecmascript)");
;
;
const DEFAULT_SHEEP_OPENING = [
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
const DEFAULT_WOLF_OPENING = [
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
function createInitialState(levelId, rocks = [], targetEaten = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WIN_EATEN"], maxPlies = DEFAULT_MAX_PLIES, opening) {
    const rockSet = new Set(rocks.map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyOf"])(p)));
    const wolves = opening?.wolves ?? DEFAULT_WOLF_OPENING;
    const sheep = opening?.sheep ?? DEFAULT_SHEEP_OPENING;
    if (wolves.length !== 3) throw new Error('Opening must contain exactly 3 wolves');
    if (sheep.length !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OPENING_SHEEP"]) throw new Error(`Opening must contain exactly ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OPENING_SHEEP"]} sheep`);
    const occupied = new Set();
    for (const p of [
        ...wolves,
        ...sheep
    ]){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inBounds"])(p.r, p.c)) throw new Error(`Opening piece out of bounds at (${p.r},${p.c})`);
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyOf"])(p);
        if (occupied.has(key)) throw new Error(`Opening pieces overlap at (${p.r},${p.c})`);
        occupied.add(key);
        if (rockSet.has(key)) {
            throw new Error(`Rock overlaps opening piece at (${p.r},${p.c})`);
        }
    }
    const pieces = [
        ...wolves.map((p, i)=>({
                id: `wolf-${i + 1}`,
                side: 'wolf',
                r: p.r,
                c: p.c
            })),
        ...sheep.map((p, i)=>({
                id: `sheep-${i + 1}`,
                side: 'sheep',
                r: p.r,
                c: p.c
            }))
    ];
    const state = {
        pieces,
        rocks: rockSet,
        eatenSheep: 0,
        toMove: 'wolf',
        chain: null,
        status: 'playing',
        levelId,
        targetEaten,
        plyCount: 0,
        maxPlies,
        repetitionCounts: new Map()
    };
    return refreshStatus({
        ...state,
        repetitionCounts: new Map([
            [
                boardPositionKey(state),
                1
            ]
        ])
    });
}
function occupancy(state) {
    const map = new Map();
    for (const p of state.pieces){
        map.set((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(p.r, p.c), p);
    }
    return map;
}
function isBlocked(state, r, c, occ) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inBounds"])(r, c)) return true;
    const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(r, c);
    if (state.rocks.has(k)) return true;
    return occ.has(k);
}
function listWolfSteps(state, wolf, occ) {
    const moves = [];
    for (const d of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ORTHO"]){
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
    for (const d of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ORTHO"]){
        const tr = wolf.r + d.r;
        const tc = wolf.c + d.c;
        const lr = wolf.r + 2 * d.r;
        const lc = wolf.c + 2 * d.c;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inBounds"])(tr, tc) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inBounds"])(lr, lc)) continue;
        const midKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(tr, tc);
        if (state.rocks.has(midKey) || occ.has(midKey)) continue;
        const target = occ.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(lr, lc));
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
    for (const d of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ORTHO"]){
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
function boardPositionKey(state) {
    const pieces = [
        ...state.pieces
    ].sort((a, b)=>a.id.localeCompare(b.id)).map((piece)=>`${piece.id}:${piece.r},${piece.c}`).join('|');
    const chain = state.chain ? `${state.chain.wolfId}:${state.chain.count}` : '-';
    return `${pieces}::${[
        ...state.rocks
    ].sort().join(',')}::${state.toMove}::${chain}`;
}
function recordPosition(state) {
    if (state.status !== 'playing') return state;
    const repetitionCounts = new Map(state.repetitionCounts);
    const key = boardPositionKey(state);
    const count = (repetitionCounts.get(key) ?? 0) + 1;
    repetitionCounts.set(key, count);
    if (count >= 3) {
        return {
            ...state,
            repetitionCounts,
            status: 'draw',
            chain: null
        };
    }
    return {
        ...state,
        repetitionCounts
    };
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
        rocks: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneRocks"])(state.rocks),
        chain: state.chain ? {
            ...state.chain
        } : null,
        plyCount: state.plyCount,
        maxPlies: state.maxPlies,
        repetitionCounts: new Map(state.repetitionCounts)
    };
}
function applyAction(state, action) {
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
            state: recordPosition(refreshStatus(next))
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
    const newCount = (state.chain?.count ?? 0) + 1;
    if (newCount >= __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MAX_CHAIN"]) {
        next.chain = null;
        next.toMove = 'sheep';
        return {
            ok: true,
            state: recordPosition(refreshStatus(next))
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
        state: recordPosition(refreshStatus(next))
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
        state: recordPosition(refreshStatus(next))
    };
}
function assertInvariants(state) {
    const seen = new Set();
    let sheep = 0;
    let wolves = 0;
    for (const p of state.pieces){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inBounds"])(p.r, p.c)) throw new Error(`Out of bounds ${p.id}`);
        const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(p.r, p.c);
        if (seen.has(k)) throw new Error(`Overlap at ${k}`);
        seen.add(k);
        if (state.rocks.has(k)) throw new Error(`Piece on rock ${k}`);
        if (p.side === 'sheep') sheep++;
        else wolves++;
    }
    if (wolves > 3) throw new Error('Too many wolves');
    if (state.eatenSheep !== __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OPENING_SHEEP"] - sheep) {
        throw new Error(`eatenSheep mismatch: ${state.eatenSheep} vs ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OPENING_SHEEP"] - sheep}`);
    }
    if (state.chain) {
        if (state.toMove !== 'wolf') throw new Error('chain while not wolf turn');
        if (state.chain.count < 1 || state.chain.count > __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MAX_CHAIN"]) {
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
}),
"[project]/packages/game-core/src/content/levels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    "createLevelInitialState",
    ()=>createLevelInitialState,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
;
;
;
const LEVEL_PRODUCT_META = {
    'spring-01': meta('空野代表干扰最少的基础猎场。', '用一枚边石保留地形概念，集中教学移动和首次跳吃。', '看懂目标并完成第一次有效捕食。', '先移动中狼接近羊群，再寻找清晰跳吃。', '羊群压力较低，主要通过基础占位阻挡。', [
        '教学'
    ]),
    'spring-02': meta('一石强调唯一岩石会阻挡落点。', '在开阔盘面加入单点绕行，建立岩石意识。', '绕开岩石完成短跳吃。', '从岩石另一侧换线，不急于连续跳吃。', '羊群利用边石压缩单侧落点。', [
        '教学'
    ]),
    'spring-03': meta('双石表示两枚中场石共同切出路线。', '用双石形成通道，首次引入短连吃选择。', '找到短连吃并在被困前停止。', '比较左右入口，优先保留退出位置。', '羊群填补通道并封锁后续落点。', [
        '连吃'
    ]),
    'spring-04': meta('回旋表示先换位再回到捕食线路。', '边石改变直线路径，训练安全调整。', '接受准备回合并建立吃口。', '先稳住三狼间距，再从侧面回切。', '羊群通过换线诱导狼无效追逐。', [
        '走位'
    ]),
    'spring-05': meta('双线表示左右都有接近羊群的路线。', '提供两个入口，训练主攻方向选择。', '选择主攻侧并保留另一狼支援。', '一侧施压，另一侧狼控制出口。', '羊群在两线间转移以分散狼群。', [
        '双路线'
    ]),
    'spring-06': meta('收束既是春季终关，也指把优势转成胜势。', '综合短连吃、路线选择和安全退出。', '独立完成基础狩猎并解释停止时机。', '三狼分工后用短链稳定累计捕食。', '羊群综合使用占位、换线和拖延。', [
        '季末'
    ]),
    'summer-01': meta('裂隙指封锁之间留下的突破缝隙。', '从教学盘进入真实防守压力，要求集中突破。', '识别封锁并制造首个吃口。', '选择一条压力线，不同时追逐两侧。', '羊群主动挡线并填补跳吃落点。', [
        '封锁'
    ]),
    'summer-02': meta('横切指岩石横向分割中场路线。', '三石配合 Hard AI，训练耐心布置和接应。', '在高压下保持退路并打开中场。', '保留第二只狼，从侧面横切进入。', 'Hard 羊群会抱团、避吃并把狼推向死角。', [
        'Hard AI',
        '死角'
    ]),
    'summer-03': meta('拉扯表示双方围绕漏斗反复争夺。', '四石漏斗要求诱开、封口和收割三狼分工。', '执行右侧首吃、左侧封口、中路支援。', '一狼诱开，两狼控制出口与后续吃线。', '羊群利用漏斗封口并诱导狼进入窄区。', [
        '漏斗',
        '困狼'
    ]),
    'summer-04': meta('分流指羊群沿主线与侧翼分开。', '三石形成两条防守流向，训练压力分配。', '保持两线压力而不失去机动。', '主线逼退、侧翼截断，避免三狼挤在一侧。', '羊群分散换线，迫使狼错误调动。', [
        '分流'
    ]),
    'summer-05': meta('反推表示羊群会反向压缩狼的空间。', 'Hard AI 与底线地形强化反制和退路管理。', '识别陷阱并保留第二出口。', '捕食前先确认另一条退路仍开放。', '羊群通过站位把狼推向边角。', [
        'Hard AI',
        '退路'
    ]),
    'summer-06': meta('压线指三狼共同压迫中场路线。', '四石与偏右狼位检验夏季协作能力。', '完成协作站位后进入决定性吃线。', '两狼压线，一狼保留换线和收割位置。', '羊群集中封锁中场并拖延突破。', [
        '季末',
        '策略敏感'
    ]),
    'autumn-01': meta('碎盘表示五石把棋盘切成多个窄道。', '让岩石成为路线边界，训练复杂地形识别。', '快速找到有效窄道并避免困狼。', '两狼控口，一狼沿可退出通道推进。', '羊群填满狭窄落点并制造快速困狼。', [
        '密岩',
        '困狼'
    ]),
    'autumn-02': meta('通道指胜负围绕唯一主路线展开。', '把复杂地形压力集中到通道两端争夺。', '理解两狼控口、一狼兑现。', '控制两端后把一次跳吃扩展为连续收割。', '羊群争夺通道口并切断狼的接应。', [
        '主通道'
    ]),
    'autumn-03': meta('丰收表示打开路线后可连续捕食。', '高收益窗口同时要求判断何时停止。', '体验长连吃并及时保住机动。', '边线建立首吃，确认出口后再延长链。', '羊群改变落点，引诱狼为贪吃失去退路。', [
        '连吃',
        '偏狼风险'
    ]),
    'autumn-04': meta('断桥指连吃路线被切成多个断点。', '入口清晰但后续方向变化，训练提前计算。', '进线前检查落点和出口。', '中狼进入断点，边狼维持两端控制。', '羊群在断点两侧切断后续接触。', [
        '断桥',
        '困狼'
    ]),
    'autumn-05': meta('窄门表示进攻窗口狭窄且需要双端开放。', '通过双端通道考验三狼协作。', '保持两端通行并兑现短暂窗口。', '两狼守门，一狼等待强制跳吃。', '羊群封住任一端即可破坏连吃窗口。', [
        '窄门'
    ]),
    'autumn-06': meta('丰收终局是在高压力下完成秋季体系。', '综合密岩、连吃收益和三狼机动。', '完成干净可控的长连吃。', '先占稳定入口，再由第二狼接管出口。', '羊群分散到多个岩隙，迫使狼跨区。', [
        '季末',
        '密岩'
    ]),
    'winter-01': meta('空寂表示没有岩石，空间关系完全暴露。', '移除地形支点，只考验三狼间距与覆盖。', '从地形解题过渡到纯站位对抗。', '保持三狼横向覆盖，等待羊群出现破口。', 'Hard 羊群在空盘抱团并主动合围。', [
        '空盘',
        'Hard AI'
    ]),
    'winter-02': meta('合围表示高阶羊群主动压缩狼的空间。', '用 Hard AI 形成真实封锁压力。', '在高压下找到可解释的边线突破。', '先保三狼通路，再从边线制造首吃。', '羊群协同封锁、抱团并反复换线。', [
        '空盘',
        '高压'
    ]),
    'winter-03': meta('绝境表示容错极低，需要连续精确计算。', '不靠岩石变化，以空盘站位精度构成挑战。', '识别一次可连续兑现的决定性机会。', '耐心扩大覆盖，避免无支援的单狼突入。', '羊群最大化合围和拖延，等待狼失位。', [
        '空盘',
        '高难'
    ]),
    'winter-04': meta('回环指羊群反复换线诱导狼追逐。', '前置羊阵扩大横向流动，考验整体覆盖。', '不追单羊，维持三狼控制区域。', '用宽覆盖限制羊群回环路线。', '羊群横向循环并制造重复局面。', [
        '空盘',
        '重复'
    ]),
    'winter-05': meta('合围线指先包围再撕出捕食路线。', '不对称狼位训练从边缘建立首吃。', '建立合围后再投入进攻。', '边狼制造破口，中狼保持接应。', '羊群压缩边线并封锁孤立狼。', [
        '空盘',
        '策略敏感'
    ]),
    'winter-06': meta('终极狩猎是四季能力的综合考验。', '用空盘检验计算、协作、连吃控制和耐心。', '综合全部能力完成最终狩猎。', '维持机动与覆盖，等待干净连续吃线。', 'Hard 羊群综合合围、避吃、拖延和反重复。', [
        '终局',
        '高难'
    ])
};
function meta(nameMeaningZh, designConceptZh, playerGoalZh, wolfStrategyZh, sheepDefenseZh, riskTags) {
    return {
        nameMeaningZh,
        designConceptZh,
        playerGoalZh,
        wolfStrategyZh,
        sheepDefenseZh,
        riskTags,
        productionStatus: 'approved'
    };
}
function openingPositions(level) {
    return {
        wolves: level.opening?.wolves ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_WOLF_OPENING"],
        sheep: level.opening?.sheep ?? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_SHEEP_OPENING"]
    };
}
function createLevelInitialState(level) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createInitialState"])(level.id, level.rocks, level.targetEaten, level.maxPlies, level.opening);
}
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
        errors.push(`ai ${level.ai} is not allowed for ${level.chapterId}`);
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
        errors.push(`rocks count ${level.rocks.length} out of range [${range.min},${range.max}] for ${level.chapterId}`);
    }
    const opening = openingPositions(level);
    if (opening.wolves.length !== 3) errors.push('opening wolves must contain exactly 3 positions');
    if (opening.sheep.length !== 15) errors.push('opening sheep must contain exactly 15 positions');
    const openingKeys = new Set();
    for (const p of [
        ...opening.wolves,
        ...opening.sheep
    ]){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inBounds"])(p.r, p.c)) {
            errors.push(`opening piece out of bounds (${p.r},${p.c})`);
            continue;
        }
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyOf"])(p);
        if (openingKeys.has(key)) errors.push(`opening pieces overlap at ${key}`);
        openingKeys.add(key);
    }
    const seen = new Set();
    for (const p of level.rocks){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inBounds"])(p.r, p.c)) {
            errors.push(`rock out of bounds (${p.r},${p.c})`);
            continue;
        }
        const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyOf"])(p);
        if (seen.has(k)) errors.push(`duplicate rock ${k}`);
        seen.add(k);
        if (openingKeys.has(k)) errors.push(`rock on opening piece ${k}`);
    }
    const adj = new Set();
    for (const a of level.rocks){
        for (const d of __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ORTHO"]){
            const nr = a.r + d.r;
            const nc = a.c + d.c;
            if (nr < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MIN"] || nr > __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"] || nc < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MIN"] || nc > __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"]) continue;
            if (seen.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(nr, nc))) {
                const pair = [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyOf"])(a),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(nr, nc)
                ].sort().join('|');
                adj.add(`adjacent rocks ${pair}`);
            }
        }
    }
    errors.push(...adj);
    if (errors.length === 0) {
        try {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(createLevelInitialState(level)).length === 0) {
                errors.push('opening must provide at least one wolf legal action');
            }
        } catch (error) {
            errors.push(error instanceof Error ? error.message : 'invalid opening');
        }
    }
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
    return {
        ...partial,
        ...LEVEL_PRODUCT_META[partial.id],
        name: partial.nameZh,
        ai: partial.ai ?? CHAPTER_AI[partial.chapterId],
        targetEaten: partial.targetEaten ?? 8,
        maxPlies: partial.maxPlies ?? 300,
        openingTemplate: partial.openingTemplate ?? `${partial.chapterId}-standard-${partial.indexInChapter}`,
        teachingPoint: partial.teachingPoint ?? seasonTeaching[partial.chapterId],
        expectedPlies: partial.expectedPlies ?? baseExpected[partial.chapterId],
        difficulty: partial.difficulty ?? Math.min(5, seasonDifficulty[partial.chapterId] + Math.max(0, partial.indexInChapter - 1)),
        firstClearReward: partial.firstClearReward ?? {
            universal: 10,
            season: {
                [partial.chapterId]: 2
            }
        },
        repeatDrop: partial.repeatDrop ?? {
            chance: 0.3,
            universal: 2
        }
    };
}
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
        teachingPoint: '先点选一只狼走到空位，再寻找第一次隔空跳吃。',
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
                c: 4
            }
        ],
        openingTemplate: 'spring-single-edge-rock',
        teachingPoint: '把岩石视为不可落脚的位置，绕开它建立跳吃路线。',
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
        teachingPoint: '选择一条短连吃路线，并在狼被困前主动结束。',
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
        teachingPoint: '先安全换位稳住阵形，再投入吃子路线。',
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
        teachingPoint: '移动第二只狼前，先比较左右两条吃子路线。',
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
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 3
                },
                {
                    r: 6,
                    c: 5
                }
            ]
        },
        openingTemplate: 'spring-finale',
        teachingPoint: '综合短连吃与路线选择，在不困狼的前提下完成春季狩猎。',
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
        teachingPoint: '观察羊群封锁，选择一条压力线集中突破。',
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
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 3
                },
                {
                    r: 6,
                    c: 5
                }
            ]
        },
        openingTemplate: 'summer-crosscut-rocks',
        teachingPoint: '不要急冲，保留第二只狼用于中场横切。',
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
                c: 1
            }
        ],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 4
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        openingTemplate: 'summer-tug-of-war',
        teachingPoint: '让三狼分工，避免过早进入无法退出的死角。',
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
                r: 4,
                c: 5
            }
        ],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 3
                },
                {
                    r: 6,
                    c: 5
                }
            ]
        },
        openingTemplate: 'summer-split-flow',
        teachingPoint: '分配狼压制两条羊群路线，同时保持彼此机动。',
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
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 2
                },
                {
                    r: 6,
                    c: 4
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        openingTemplate: 'summer-counterpush',
        teachingPoint: '开始连续跳吃前，先为狼保留一条退路。',
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
                c: 1
            }
        ],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 2
                },
                {
                    r: 6,
                    c: 5
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        openingTemplate: 'summer-pressure-line',
        teachingPoint: '先让三狼形成协作位置，再进入决定性的吃子线。',
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
        blurbZh: '五枚岩石把盘面切成窄道。找准通道连吃，岩石就是你的跳板。',
        blurbEn: 'Five rocks cut the board into narrow lanes. Hunt the corridor — the stones become your springboards.',
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
            }
        ],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 2
                },
                {
                    r: 6,
                    c: 4
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        teachingPoint: '识别被岩石切开的窄道，用两狼控口、一狼寻找连吃。'
    }),
    L({
        id: 'autumn-02',
        chapterId: 'autumn',
        indexInChapter: 2,
        ai: 'normal',
        nameZh: '秋日 · 通道',
        nameEn: 'Autumn · Corridor',
        blurbZh: '六石挤出一条主通道。控制通道两端，连吃会像潮水一样涌出。',
        blurbEn: 'Six rocks squeeze one main corridor. Own both ends and chains will surge like a tide.',
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
            }
        ],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 2
                },
                {
                    r: 6,
                    c: 5
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        teachingPoint: '控制主通道两端，再把一次跳吃扩展成连续收割。'
    }),
    L({
        id: 'autumn-03',
        chapterId: 'autumn',
        indexInChapter: 3,
        ai: 'normal',
        nameZh: '秋日 · 丰收',
        nameEn: 'Autumn · Harvest',
        blurbZh: '五石密布的丰收盘。敢冲敢停：连吃满档前记得主动结束，保住胜势。',
        blurbEn: 'A five-rock harvest board. Rush hard, stop clean — end the chain before you strand a wolf.',
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
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 4
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        teachingPoint: '连吃时同时计算收益与退路，必要时主动收手。'
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
                c: 6
            }
        ],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 3
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        openingTemplate: 'autumn-broken-bridge',
        teachingPoint: '把岩石间的断点当作连吃入口，提前判断跳吃方向。',
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
            }
        ],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 3
                },
                {
                    r: 6,
                    c: 5
                }
            ]
        },
        openingTemplate: 'autumn-narrow-gate',
        teachingPoint: '规划强制跳吃时，始终保持窄门两端可通行。',
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
                c: 3
            }
        ],
        openingTemplate: 'autumn-harvest-finale',
        teachingPoint: '在追求长连吃与保持三狼机动之间做出取舍。',
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
        rocks: [],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 3
                },
                {
                    r: 6,
                    c: 5
                }
            ],
            sheep: [
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
                },
                {
                    r: 3,
                    c: 6
                }
            ]
        },
        openingTemplate: 'winter-silence-edge',
        teachingPoint: '没有岩石可借力时，用三狼间距撕开羊群合围。'
    }),
    L({
        id: 'winter-02',
        chapterId: 'winter',
        indexInChapter: 2,
        nameZh: '冬日 · 合围',
        nameEn: 'Winter · Encirclement',
        blurbZh: '高阶羊群合力围狼。先保三狼通路，再找隔空破口。',
        blurbEn: 'A hard flock closes the ring. Keep all three wolves mobile, then punch a gap-eat hole.',
        rocks: [],
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 2
                },
                {
                    r: 6,
                    c: 4
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        teachingPoint: '先保证三狼都有通路，再从边线制造第一个破口。'
    }),
    L({
        id: 'winter-03',
        chapterId: 'winter',
        indexInChapter: 3,
        nameZh: '冬日 · 绝境',
        nameEn: 'Winter · Last Stand',
        blurbZh: '四季终章。在绝境里打出干净的隔空连吃，证明你真正掌控猎场。',
        blurbEn: 'Season finale. Land clean gap-chains under pressure — prove you own the hunt.',
        rocks: [],
        opening: {
            sheep: [
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
                    r: 1,
                    c: 6
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
                    r: 2,
                    c: 6
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
                },
                {
                    r: 3,
                    c: 6
                }
            ]
        },
        openingTemplate: 'winter-last-stand-right',
        teachingPoint: '在空盘高压下保持覆盖，等待可连续兑现的隔空跳吃。'
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
        opening: {
            sheep: [
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
                },
                {
                    r: 3,
                    c: 6
                }
            ]
        },
        openingTemplate: 'winter-open-loop',
        teachingPoint: '不要追逐单只羊，要维持三狼对整盘的覆盖。',
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
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 3
                },
                {
                    r: 6,
                    c: 6
                }
            ],
            sheep: [
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
                    r: 1,
                    c: 6
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
                    r: 2,
                    c: 6
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
                },
                {
                    r: 3,
                    c: 6
                }
            ]
        },
        openingTemplate: 'winter-ring-line',
        teachingPoint: '先建立合围位置，再投入第一条隔空跳吃路线。',
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
        opening: {
            wolves: [
                {
                    r: 6,
                    c: 1
                },
                {
                    r: 6,
                    c: 4
                },
                {
                    r: 6,
                    c: 6
                }
            ]
        },
        teachingPoint: '在空盘完成合围与连续狩猎，同时不牺牲狼的机动性。',
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
    return LEVELS.flatMap((l)=>validateLevel(l).map((e)=>`${l.id}: ${e}`));
}
function adjacentLevels(id) {
    const idx = LEVELS.findIndex((l)=>l.id === id);
    if (idx < 0) return {};
    return {
        prev: idx > 0 ? LEVELS[idx - 1] : undefined,
        next: idx < LEVELS.length - 1 ? LEVELS[idx + 1] : undefined
    };
}
}),
"[project]/packages/game-core/src/content/quests.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
function dailyKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function weeklyKey(d = new Date()) {
    const tmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayNum = (tmp.getDay() + 6) % 7;
    tmp.setDate(tmp.getDate() - dayNum + 3);
    const firstThursday = new Date(tmp.getFullYear(), 0, 4);
    const week = 1 + Math.round(((tmp.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
    return `${tmp.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
function emptyQuestState(now = new Date()) {
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
function refreshQuestPeriod(state, now = new Date()) {
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
function recordQuestMetric(quests, period, metric, amount, now = new Date()) {
    let q = refreshQuestPeriod(quests, now);
    const apply = (bucket, p)=>{
        const progress = {
            ...bucket.progress
        };
        for (const def of QUEST_DEFS){
            if (def.period !== p || def.metric !== metric) continue;
            progress[def.id] = Math.min(def.target, (progress[def.id] ?? 0) + amount);
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
function claimQuest(save, questId, now = new Date()) {
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
    const progress = bucket.progress[questId] ?? 0;
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
}),
"[project]/packages/game-core/src/content/save.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/quests.ts [app-ssr] (ecmascript)");
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
        quests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emptyQuestState"])()
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
function safeAmount(value, fallback = 0) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}
function parseQuests(raw) {
    if (!raw || typeof raw !== 'object') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emptyQuestState"])();
    const o = raw;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["refreshQuestPeriod"])({
        daily: {
            key: typeof o.daily?.key === 'string' ? o.daily.key : '',
            progress: o.daily?.progress && typeof o.daily.progress === 'object' ? o.daily.progress : {},
            claimed: Array.isArray(o.daily?.claimed) ? o.daily.claimed.filter((x)=>typeof x === 'string') : []
        },
        weekly: {
            key: typeof o.weekly?.key === 'string' ? o.weekly.key : '',
            progress: o.weekly?.progress && typeof o.weekly.progress === 'object' ? o.weekly.progress : {},
            claimed: Array.isArray(o.weekly?.claimed) ? o.weekly.claimed.filter((x)=>typeof x === 'string') : []
        }
    });
}
function migrate(raw) {
    if (!raw || typeof raw !== 'object') return defaultSave();
    const o = raw;
    if (o.schemaVersion !== 1) return defaultSave();
    const base = defaultSave();
    const fragments = o.fragments && typeof o.fragments === 'object' ? o.fragments : {};
    const rawSeason = fragments.season && typeof fragments.season === 'object' ? fragments.season : {};
    const unlockedChapters = Array.isArray(o.unlockedChapters) ? o.unlockedChapters.filter((x)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"].includes(x)) : [];
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
            wolfSetId: typeof o.equipped?.wolfSetId === 'string' ? o.equipped.wolfSetId : base.equipped.wolfSetId,
            boardId: typeof o.equipped?.boardId === 'string' ? o.equipped.boardId : base.equipped.boardId
        },
        guide: {
            spring1Done: Boolean(o.guide?.spring1Done)
        },
        settings: {
            muted: Boolean(o.settings?.muted)
        },
        buffs: {
            doubleDropUntil: typeof o.buffs?.doubleDropUntil === 'number' ? o.buffs.doubleDropUntil : null
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
    for(let i = 0; i < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"].length - 1; i++){
        const chapter = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"][i];
        const next = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHAPTER_ORDER"][i + 1];
        const levels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["levelsForChapter"])(chapter);
        const allClear = levels.every((l)=>save.clearedLevels.includes(l.id));
        if (allClear) unlocked.push(next);
        else break;
    }
    return unlocked;
}
function isDoubleDropActive(save, now = Date.now()) {
    return save.buffs.doubleDropUntil != null && save.buffs.doubleDropUntil > now;
}
function rollClearReward(level, save, rng, now = Date.now()) {
    const firstClear = !save.clearedLevels.includes(level.id);
    const doubled = isDoubleDropActive(save, now);
    const mult = doubled ? 2 : 1;
    if (firstClear) {
        const season = {};
        for (const [k, v] of Object.entries(level.firstClearReward.season ?? {})){
            season[k] = (v ?? 0) * mult;
        }
        return {
            universal: (level.firstClearReward.universal ?? 0) * mult,
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
    for (const [k, v] of Object.entries(drop.season ?? {})){
        season[k] = (v ?? 0) * mult;
    }
    return {
        universal: (drop.universal ?? 0) * mult,
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
        season[id] = (season[id] ?? 0) + (v ?? 0);
    }
    let quests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordQuestMetric"])(save.quests, 'both', 'clears', 1);
    if (grant.universal > 0) {
        quests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordQuestMetric"])(quests, 'both', 'fragments_earned', grant.universal);
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
        skins.add(`board-${ch}`);
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
        quests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordQuestMetric"])(save.quests, 'both', 'plays', 1)
    };
}
function activateDoubleDrop(save, durationMs = 30 * 60 * 1000, now = Date.now()) {
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
        quests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordQuestMetric"])(quests, 'both', 'fragments_earned', amount);
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
}),
"[project]/packages/game-core/src/content/skins.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    return s?.kind === 'wolf_set' ? s : undefined;
}
function getBoardSkin(id) {
    const s = getSkin(id);
    return s?.kind === 'board' ? s : undefined;
}
function resolveSkin(save) {
    const wolf = getWolfSet(save.equipped.wolfSetId) ?? getWolfSet('wolf-default');
    const board = getBoardSkin(save.equipped.boardId) ?? getBoardSkin('board-default');
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
        if ((save.fragments.season[season] ?? 0) < amount) {
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
        if (ids.has(s.id)) errors.push(`duplicate id ${s.id}`);
        ids.add(s.id);
        if (s.kind === 'wolf_set') {
            if (!s.assets.wolf || !s.assets.sheep) errors.push(`${s.id} missing wolf/sheep asset`);
            if (s.unlock.type === 'default') defaultWolf++;
            if (s.unlock.type === 'cost' && s.unlock.universal < 0) errors.push(`${s.id} bad cost`);
        } else {
            if (!s.assets.boardBg) errors.push(`${s.id} missing boardBg`);
            if (s.unlock.type === 'default') defaultBoard++;
            if (s.unlock.type === 'cost' && s.unlock.amount < 0) errors.push(`${s.id} bad cost`);
        }
    }
    if (defaultWolf < 1) errors.push('need default wolf_set');
    if (defaultBoard < 1) errors.push('need default board');
    return errors;
}
}),
"[project]/packages/game-core/src/serialize.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deserialize",
    ()=>deserialize,
    "makeState",
    ()=>makeState,
    "serialize",
    ()=>serialize
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
;
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
        maxPlies: state.maxPlies,
        repetitionCounts: [
            ...state.repetitionCounts
        ]
    };
}
function deserialize(data) {
    const state = {
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
        targetEaten: data.targetEaten ?? 8,
        plyCount: data.plyCount ?? 0,
        maxPlies: data.maxPlies ?? 300,
        repetitionCounts: new Map(data.repetitionCounts)
    };
    if (data.repetitionCounts) return state;
    return {
        ...state,
        repetitionCounts: new Map([
            [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["boardPositionKey"])(state),
                1
            ]
        ])
    };
}
function makeState(partial) {
    const state = {
        pieces: partial.pieces.map((p)=>({
                ...p
            })),
        rocks: new Set((partial.rocks ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyOf"])),
        eatenSheep: partial.eatenSheep ?? 0,
        toMove: partial.toMove ?? 'wolf',
        chain: partial.chain ?? null,
        status: partial.status ?? 'playing',
        levelId: partial.levelId ?? 'test',
        targetEaten: partial.targetEaten ?? 8,
        plyCount: partial.plyCount ?? 0,
        maxPlies: partial.maxPlies ?? 300,
        repetitionCounts: partial.repetitionCounts ?? new Map()
    };
    if (partial.repetitionCounts) return state;
    return {
        ...state,
        repetitionCounts: new Map([
            [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["boardPositionKey"])(state),
                1
            ]
        ])
    };
}
;
}),
"[project]/packages/game-core/src/ai/evaluate.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "evaluate",
    ()=>evaluate,
    "evaluateScore",
    ()=>evaluateScore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-ssr] (ecmascript)");
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
    const occ = new Set(state.pieces.map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(p.r, p.c)));
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
            const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(w.r + dr, w.c + dc);
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])({
        ...state,
        toMove: 'sheep',
        chain: null
    }).length;
}
function evaluate(state) {
    const sheepCount = sheepPositions(state).length;
    const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWolfLegalSummary"])(state);
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
}),
"[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/packages/game-core/src/ai/easy.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickEasy",
    ()=>pickEasy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)");
;
;
;
function pickEasy(state, rng) {
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(state);
    if (actions.length === 0) throw new Error('easy: no legal sheep moves');
    const scored = actions.map((action)=>{
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) return {
            action,
            score: -Infinity
        };
        return {
            action,
            score: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(result.state)
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
    return scored[(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickIndex"])(rng, scored.length)].action;
}
}),
"[project]/packages/game-core/src/ai/normal.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickNormal",
    ()=>pickNormal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)");
;
;
;
function pickNormal(state, rng) {
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(state);
    if (actions.length === 0) throw new Error('normal: no legal sheep moves');
    let best = -Infinity;
    const tops = [];
    for (const action of actions){
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) continue;
        const score = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(result.state);
        if (score > best) {
            best = score;
            tops.length = 0;
            tops.push(action);
        } else if (score === best) {
            tops.push(action);
        }
    }
    if (tops.length === 0) throw new Error('normal: no applicable moves');
    return tops[(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickIndex"])(rng, tops.length)];
}
}),
"[project]/packages/game-core/src/ai/hard.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickHard",
    ()=>pickHard,
    "pickHardWithMeta",
    ()=>pickHardWithMeta
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$normal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/normal.ts [app-ssr] (ecmascript)");
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
function exhausted(nodes, budget, start) {
    return nodes.n >= budget.maxNodes || budget.maxMs !== undefined && clockNow() - start >= budget.maxMs;
}
/**
 * Resolve the most damaging legal wolf turn, including any continuation of a
 * capture chain. The result is always a completed wolf turn or a terminal state.
 */ function worstWolfTurn(state, nodes, budget, start) {
    if (state.status !== 'playing' || exhausted(nodes, budget, start)) return state;
    // A wolf step ends the turn. Only a jump with an active chain can recurse.
    if (state.toMove !== 'wolf') return state;
    const wolfState = state;
    if (wolfState.chain) {
        const ended = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["endWolfTurn"])(wolfState);
        let worst = ended.ok ? ended.state : wolfState;
        let worstScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(worst);
        for (const action of (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(wolfState)){
            if (exhausted(nodes, budget, start)) break;
            nodes.n++;
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(wolfState, action);
            if (!result.ok) continue;
            const candidate = worstWolfTurn(result.state, nodes, budget, start);
            const score = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(candidate);
            if (score < worstScore) {
                worst = candidate;
                worstScore = score;
            }
        }
        return worst;
    }
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(wolfState);
    if (actions.length === 0) return wolfState;
    let worst = wolfState;
    let worstScore = Infinity;
    for (const action of actions){
        if (exhausted(nodes, budget, start)) break;
        nodes.n++;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(wolfState, action);
        if (!result.ok) continue;
        const candidate = worstWolfTurn(result.state, nodes, budget, start);
        const score = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(candidate);
        if (score < worstScore) {
            worst = candidate;
            worstScore = score;
        }
    }
    return worstScore === Infinity ? wolfState : worst;
}
/** Evaluate one additional sheep decision after the worst complete wolf turn. */ function bestNextSheepResponse(state, nodes, budget, start) {
    if (state.status !== 'playing' || state.toMove !== 'sheep' || exhausted(nodes, budget, start)) {
        return {
            score: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(state),
            completed: false
        };
    }
    let best = -Infinity;
    let completed = false;
    for (const action of (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(state)){
        if (exhausted(nodes, budget, start)) break;
        nodes.n++;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) continue;
        const afterWolf = worstWolfTurn(result.state, nodes, budget, start);
        best = Math.max(best, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(afterWolf));
        completed = true;
    }
    return {
        score: best === -Infinity ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(state) : best,
        completed
    };
}
function pickHardWithMeta(state, rng, budgets = DEFAULT_BUDGETS) {
    const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(state);
    if (actions.length === 0) throw new Error('hard: no legal sheep moves');
    const start = clockNow();
    const nodes = {
        n: 0
    };
    let bestScore = -Infinity;
    let lookaheadCompleted = false;
    const tops = [];
    const applicable = actions.flatMap((action)=>{
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        return result.ok ? [
            {
                action,
                result,
                immediateSheepScore: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(result.state)
            }
        ] : [];
    });
    const normalBest = Math.max(...applicable.map((item)=>item.immediateSheepScore));
    for (const { action, result, immediateSheepScore } of applicable){
        // Hard refines Normal's safest immediate choices; bounded lookahead must not
        // justify an immediately inferior move through a horizon artifact.
        if (immediateSheepScore < normalBest) continue;
        if (exhausted(nodes, budgets, start)) break;
        nodes.n++;
        const afterWolf = worstWolfTurn(result.state, nodes, budgets, start);
        const immediate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(afterWolf);
        const next = bestNextSheepResponse(afterWolf, nodes, budgets, start);
        const score = immediate * 0.35 + next.score * 0.65;
        lookaheadCompleted ||= next.completed;
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
            action: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$normal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickNormal"])(state, rng),
            meta: {
                degraded: true,
                nodes: nodes.n,
                elapsedMs,
                lookaheadCompleted: false
            }
        };
    }
    return {
        action: tops[(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickIndex"])(rng, tops.length)],
        meta: {
            degraded: false,
            nodes: nodes.n,
            elapsedMs,
            lookaheadCompleted
        }
    };
}
function pickHard(state, rng, budgets = DEFAULT_BUDGETS) {
    return pickHardWithMeta(state, rng, budgets).action;
}
}),
"[project]/packages/game-core/src/ai/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickSheepAction",
    ()=>pickSheepAction,
    "tierForChapter",
    ()=>tierForChapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$easy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/easy.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$normal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/normal.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$hard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/hard.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)");
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
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$easy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickEasy"])(state, ctx.rng);
        case 'normal':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$normal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickNormal"])(state, ctx.rng);
        case 'hard':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$hard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickHard"])(state, ctx.rng, ctx.budgets);
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
}),
"[project]/packages/game-core/src/analysis/diagnosticWolf.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chooseDiagnosticWolfAction",
    ()=>chooseDiagnosticWolfAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
;
;
function entersRepeatedPosition(state) {
    return (state.repetitionCounts.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["boardPositionKey"])(state)) ?? 0) >= 2;
}
function chooseDiagnosticWolfAction(state, actions, random, strategy) {
    if (strategy === 'random') return actions[Math.floor(random.nextFloat() * actions.length)];
    const evaluated = actions.map((action)=>{
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        return {
            action,
            score: result.ok ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScore"])(result.state) : Infinity,
            repeats: result.ok && entersRepeatedPosition(result.state)
        };
    });
    const nonRepeating = evaluated.filter((item)=>!item.repeats);
    const pool = nonRepeating.length > 0 ? nonRepeating : evaluated;
    if (random.nextFloat() < 0.35) return pool[Math.floor(random.nextFloat() * pool.length)].action;
    const best = Math.min(...pool.map((item)=>item.score));
    const candidates = pool.filter((item)=>item.score === best);
    return candidates[Math.floor(random.nextFloat() * candidates.length)].action;
}
}),
"[project]/packages/game-core/src/analysis/candidateAcceptance.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assessLevelCandidate",
    ()=>assessLevelCandidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$analysis$2f$diagnosticWolf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/analysis/diagnosticWolf.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
;
;
;
;
const DEFAULT_SEEDS = Array.from({
    length: 10
}, (_, index)=>20260717 + index);
function percentile(values, ratio) {
    const sorted = [
        ...values
    ].sort((left, right)=>left - right);
    return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)] ?? 0;
}
function actionLabel(action) {
    const through = action.type === 'jump' ? ` via ${action.through.r},${action.through.c}` : '';
    return `${action.type}:${action.pieceId}>${action.to.r},${action.to.c}${through}`;
}
function terminalReason(state) {
    if (state.eatenSheep >= state.targetEaten) return 'targetEaten';
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listWolfActionsAsIfTurn"])(state).length === 0) return 'wolvesTrapped';
    if (state.plyCount >= state.maxPlies) return 'maxPlies';
    if ((state.repetitionCounts.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["boardPositionKey"])(state)) ?? 0) >= 3) return 'repetition';
    return 'unexpected';
}
function runCandidateGame(level, strategy, seed, hardMaxNodes) {
    let state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createLevelInitialState"])(level);
    const wolfRandom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(seed);
    const sheepRandom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(seed ^ 0x5f3759df);
    const trace = [];
    const seenPositions = new Map();
    let firstCapturePly = null;
    let repetitionCycle;
    const observePosition = ()=>{
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["boardPositionKey"])(state);
        const occurrences = seenPositions.get(key) ?? [];
        occurrences.push({
            ply: state.plyCount,
            traceIndex: trace.length
        });
        seenPositions.set(key, occurrences);
        if (occurrences.length >= 3 && !repetitionCycle) {
            repetitionCycle = {
                firstSeenPly: occurrences[0].ply,
                secondSeenPly: occurrences[1].ply,
                terminalPly: state.plyCount,
                actions: trace.slice(occurrences[1].traceIndex)
            };
        }
    };
    observePosition();
    while(state.status === 'playing'){
        const actions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(state);
        if (actions.length === 0) break;
        const action = state.toMove === 'wolf' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$analysis$2f$diagnosticWolf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chooseDiagnosticWolfAction"])(state, actions, wolfRandom, strategy) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["pickSheepAction"])(state, {
            difficulty: level.ai,
            rng: sheepRandom,
            budgets: level.ai === 'hard' ? {
                maxNodes: hardMaxNodes
            } : undefined
        });
        const eatenBefore = state.eatenSheep;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) throw new Error(result.error);
        state = result.state;
        trace.push(`${state.plyCount}:${actionLabel(action)}`);
        observePosition();
        if (firstCapturePly === null && state.eatenSheep > eatenBefore) firstCapturePly = state.plyCount;
        if (state.status === 'playing' && state.chain) {
            const ended = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["endWolfTurn"])(state);
            if (!ended.ok) throw new Error(ended.error);
            state = ended.state;
            trace.push(`${state.plyCount}:end-chain`);
            observePosition();
        }
    }
    return {
        seed,
        strategy,
        winner: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
        reason: terminalReason(state),
        plies: state.plyCount,
        eaten: state.eatenSheep,
        firstCapturePly,
        trace,
        repetitionCycle
    };
}
function assessLevelCandidate(level, options = {}) {
    const structuralErrors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateLevel"])(level);
    const seeds = options.seeds ?? DEFAULT_SEEDS;
    const hardMaxNodes = options.hardMaxNodes ?? 80;
    const games = structuralErrors.length === 0 ? [
        'random',
        'mixed'
    ].flatMap((strategy)=>seeds.map((seed)=>runCandidateGame(level, strategy, seed, hardMaxNodes))) : [];
    const byStrategy = (strategy)=>games.filter((game)=>game.strategy === strategy);
    const summarize = (strategy)=>{
        const selected = byStrategy(strategy);
        return {
            wolfWins: selected.filter((game)=>game.winner === 'wolf').length,
            sheepWins: selected.filter((game)=>game.winner === 'sheep').length,
            draws: selected.filter((game)=>game.winner === 'draw').length,
            averagePlies: selected.reduce((sum, game)=>sum + game.plies, 0) / Math.max(1, selected.length),
            p95Plies: percentile(selected.map((game)=>game.plies), 0.95),
            averageEaten: selected.reduce((sum, game)=>sum + game.eaten, 0) / Math.max(1, selected.length),
            firstCaptureCoverage: selected.filter((game)=>game.firstCapturePly !== null).length / Math.max(1, selected.length)
        };
    };
    const summaries = {
        random: summarize('random'),
        mixed: summarize('mixed')
    };
    const findings = [];
    const mixed = byStrategy('mixed');
    const evidence = (predicate)=>mixed.filter(predicate).map((game)=>game.seed);
    const rate = (count)=>count / Math.max(1, seeds.length);
    if (structuralErrors.length > 0) {
        findings.push({
            severity: 'reject',
            code: 'STRUCTURE_INVALID',
            message: structuralErrors.join('; '),
            evidenceSeeds: []
        });
    } else {
        if (rate(summaries.mixed.wolfWins) >= 0.9 && summaries.mixed.sheepWins === 0) {
            findings.push({
                severity: 'reject',
                code: 'WOLF_FORCED_WIN_RISK',
                message: 'mixed wolf strategy wins at least 90% with no sheep wins',
                evidenceSeeds: evidence((game)=>game.winner === 'wolf')
            });
        }
        if (summaries.mixed.firstCaptureCoverage < 0.8) {
            findings.push({
                severity: 'reject',
                code: 'FIRST_CAPTURE_BLOCKED',
                message: 'mixed strategy fails to capture in more than 20% of games',
                evidenceSeeds: evidence((game)=>game.firstCapturePly === null)
            });
        }
        if (rate(summaries.mixed.draws) >= 0.4) {
            findings.push({
                severity: 'review',
                code: 'DRAW_RATE_HIGH',
                message: 'mixed strategy draw rate is at least 40%',
                evidenceSeeds: evidence((game)=>game.winner === 'draw')
            });
        }
        if (summaries.mixed.p95Plies >= (level.maxPlies ?? 300) * 0.75) {
            findings.push({
                severity: 'review',
                code: 'LONG_TAIL',
                message: 'mixed strategy P95 reaches at least 75% of maxPlies',
                evidenceSeeds: evidence((game)=>game.plies >= (level.maxPlies ?? 300) * 0.75)
            });
        }
        if (summaries.mixed.wolfWins - summaries.random.wolfWins >= seeds.length * 0.6) {
            findings.push({
                severity: 'review',
                code: 'STRATEGY_SENSITIVE',
                message: 'mixed strategy gains at least 60 percentage points over random',
                evidenceSeeds: evidence((game)=>game.winner === 'wolf')
            });
        }
        const unexpected = games.filter((game)=>game.reason === 'unexpected');
        if (unexpected.length > 0) {
            findings.push({
                severity: 'reject',
                code: 'UNEXPECTED_TERMINAL',
                message: 'simulation reached an unclassified terminal state',
                evidenceSeeds: unexpected.map((game)=>game.seed)
            });
        }
    }
    const verdict = findings.some((finding)=>finding.severity === 'reject') ? 'reject' : findings.some((finding)=>finding.severity === 'review') ? 'review' : 'pass';
    return {
        levelId: level.id,
        verdict,
        structuralErrors,
        findings,
        games,
        summaries
    };
}
}),
"[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/save.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$quests$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/quests.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$skins$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/skins.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/serialize.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$analysis$2f$candidateAcceptance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/analysis/candidateAcceptance.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$analysis$2f$diagnosticWolf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/analysis/diagnosticWolf.ts [app-ssr] (ecmascript)");
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
;
;
}),
"[project]/apps/web/src/components/BoardSvg.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BoardSvg",
    ()=>BoardSvg
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-ssr] (ecmascript)");
'use client';
;
;
const PAD = 28;
const CELL = 56;
const SIZE = PAD * 2 + CELL * (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"] - 1);
const PIECE = 46;
function xy(r, c) {
    return {
        x: PAD + (c - 1) * CELL,
        y: PAD + (r - 1) * CELL
    };
}
function hasPos(list, r, c) {
    return list.some((p)=>p.r === r && p.c === c);
}
function RockShape({ x, y, variant, warm = 0 }) {
    const shapes = [
        `${x - 13},${y + 2} ${x - 8},${y - 12} ${x + 4},${y - 14} ${x + 13},${y - 4} ${x + 10},${y + 10} ${x - 4},${y + 13}`,
        `${x - 12},${y - 4} ${x - 2},${y - 14} ${x + 11},${y - 10} ${x + 14},${y + 2} ${x + 6},${y + 12} ${x - 10},${y + 10}`,
        `${x - 14},${y + 4} ${x - 10},${y - 10} ${x + 2},${y - 13} ${x + 12},${y - 6} ${x + 12},${y + 8} ${x - 2},${y + 13}`
    ];
    const pts = shapes[variant % shapes.length];
    const base = warm > 0.3 ? '#7a6a58' : warm < -0.2 ? '#5a6270' : '#6e665c';
    const lite = warm > 0.3 ? '#a09078' : warm < -0.2 ? '#8a949e' : '#8a8278';
    const dark = warm > 0.3 ? '#4a3a28' : warm < -0.2 ? '#2a3440' : '#3f3a34';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                cx: x + 1,
                cy: y + 12,
                rx: 12,
                ry: 3.5,
                fill: "#1a1f18",
                opacity: 0.28
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: pts,
                fill: base,
                stroke: dark,
                strokeWidth: 1.4,
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: pts.split(' ').slice(0, 3).join(' '),
                fill: lite,
                opacity: 0.65
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: `M${x - 5} ${y - 1} L${x + 1} ${y + 5} M${x + 1} ${y - 7} L${x + 7} ${y - 1}`,
                stroke: dark,
                strokeWidth: 1.1,
                opacity: 0.5,
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
function BoardSvg({ state, selectedWolfId, stepHighlights, jumpHighlights, jumpThroughs, juice, interactive, onSelectWolf, onClickCell, theme = {
    boardFill: '#e8f0e4',
    lineStroke: '#5c6b52',
    wolfFill: '#3d4a3a',
    sheepFill: '#f4f1ea'
} }) {
    const rocks = [
        ...state.rocks
    ].map((k)=>{
        const [r, c] = k.split(',').map(Number);
        return {
            r: r,
            c: c
        };
    });
    const selectedWolf = selectedWolfId ? state.pieces.find((p)=>p.id === selectedWolfId && p.side === 'wolf') : undefined;
    const fromXy = juice ? xy(juice.from.r, juice.from.c) : null;
    const toXy = juice ? xy(juice.to.r, juice.to.c) : null;
    const dx = fromXy && toXy ? fromXy.x - toXy.x : 0;
    const dy = fromXy && toXy ? fromXy.y - toXy.y : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "game-board-frame w-full max-w-[min(92vw,420px)]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: `0 0 ${SIZE} ${SIZE}`,
            className: "h-auto w-full touch-manipulation",
            role: "img",
            "aria-label": "Fangrush board",
            children: [
                theme.boardBgSrc ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("image", {
                    href: theme.boardBgSrc,
                    x: 0,
                    y: 0,
                    width: SIZE,
                    height: SIZE,
                    preserveAspectRatio: "none"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: 0,
                    y: 0,
                    width: SIZE,
                    height: SIZE,
                    fill: theme.boardFill,
                    rx: 12
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                    lineNumber: 124,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                    x: 0,
                    y: 0,
                    width: SIZE,
                    height: SIZE,
                    fill: theme.boardBgSrc ? 'rgba(255,255,255,0.08)' : 'transparent',
                    rx: 12
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                    lineNumber: 127,
                    columnNumber: 7
                }, this),
                Array.from({
                    length: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"]
                }, (_, i)=>{
                    const v = PAD + i * CELL;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: PAD,
                                y1: v,
                                x2: PAD + CELL * (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"] - 1),
                                y2: v,
                                stroke: theme.lineStroke,
                                strokeWidth: 2.25,
                                opacity: 0.9
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                                lineNumber: 140,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: v,
                                y1: PAD,
                                x2: v,
                                y2: PAD + CELL * (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"] - 1),
                                stroke: theme.lineStroke,
                                strokeWidth: 2.25,
                                opacity: 0.9
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `line-${i}`, true, {
                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this);
                }),
                Array.from({
                    length: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"]
                }, (_, ri)=>Array.from({
                        length: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"]
                    }, (_, ci)=>{
                        const { x, y } = xy(ri + 1, ci + 1);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: x,
                            cy: y,
                            r: 3.6,
                            fill: theme.lineStroke,
                            opacity: 0.7
                        }, `dot-${ri}-${ci}`, false, {
                            fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                            lineNumber: 166,
                            columnNumber: 13
                        }, this);
                    })),
                selectedWolf && jumpThroughs.map((mid, i)=>{
                    const to = jumpHighlights[i];
                    if (!to) return null;
                    const a = xy(selectedWolf.r, selectedWolf.c);
                    const b = xy(mid.r, mid.c);
                    const c = xy(to.r, to.c);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                        points: `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`,
                        fill: "none",
                        stroke: "rgba(196, 72, 54, 0.55)",
                        strokeWidth: 3,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        pointerEvents: "none"
                    }, `path-${mid.r}-${mid.c}-${to.r}-${to.c}`, false, {
                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                        lineNumber: 186,
                        columnNumber: 13
                    }, this);
                }),
                Array.from({
                    length: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"]
                }, (_, ri)=>Array.from({
                        length: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"]
                    }, (_, ci)=>{
                        const r = ri + 1;
                        const c = ci + 1;
                        const { x, y } = xy(r, c);
                        const isStep = hasPos(stepHighlights, r, c);
                        const isThrough = hasPos(jumpThroughs, r, c);
                        if (!isStep && !isThrough) return null;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: x,
                            cy: y,
                            r: 14,
                            className: "juice-pulse",
                            fill: isThrough ? 'rgba(196, 72, 54, 0.28)' : 'rgba(70, 130, 90, 0.4)'
                        }, `hl-${r}-${c}`, false, {
                            fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                            lineNumber: 208,
                            columnNumber: 13
                        }, this);
                    })),
                rocks.map((p, i)=>{
                    const { x, y } = xy(p.r, p.c);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RockShape, {
                        x: x,
                        y: y,
                        variant: i + p.r + p.c,
                        warm: theme.rockWarm ?? 0
                    }, `rock-${p.r}-${p.c}`, false, {
                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                        lineNumber: 223,
                        columnNumber: 11
                    }, this);
                }),
                juice?.kind === 'jump' && toXy && theme.sheepSrc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("image", {
                    href: theme.sheepSrc,
                    x: toXy.x - PIECE / 2,
                    y: toXy.y - PIECE / 2,
                    width: PIECE,
                    height: PIECE,
                    className: "piece-capture-fade",
                    style: {
                        pointerEvents: 'none'
                    }
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                    lineNumber: 235,
                    columnNumber: 9
                }, this),
                state.pieces.map((p)=>{
                    const { x, y } = xy(p.r, p.c);
                    const selected = p.side === 'wolf' && p.id === selectedWolfId;
                    const src = p.side === 'sheep' ? theme.sheepSrc : theme.wolfSrc;
                    const isMover = Boolean(juice) && juice.to.r === p.r && juice.to.c === p.c;
                    const scale = selected ? 1.1 : 1;
                    const body = src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("image", {
                        href: src,
                        x: x - PIECE * scale / 2,
                        y: y - PIECE * scale / 2 - (selected ? 2 : 0),
                        width: PIECE * scale,
                        height: PIECE * scale,
                        style: {
                            pointerEvents: 'none',
                            filter: selected ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' : undefined
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                        lineNumber: 255,
                        columnNumber: 11
                    }, this) : p.side === 'sheep' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: x,
                        cy: y,
                        r: 13,
                        fill: theme.sheepFill,
                        stroke: "#8a8478",
                        strokeWidth: 1.5
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                        lineNumber: 267,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: x,
                        cy: y,
                        r: 15,
                        fill: theme.wolfFill,
                        stroke: selected ? '#c9a227' : '#1e261c',
                        strokeWidth: selected ? 3 : 1.5
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                        lineNumber: 269,
                        columnNumber: 11
                    }, this);
                    const moveStyle = isMover ? {
                        cursor: interactive && p.side === 'wolf' ? 'pointer' : 'default',
                        ['--slide-x']: `${dx}px`,
                        ['--slide-y']: `${dy}px`
                    } : {
                        cursor: interactive && p.side === 'wolf' ? 'pointer' : 'default'
                    };
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        onClick: (e)=>{
                            e.stopPropagation();
                            if (interactive && p.side === 'wolf') onSelectWolf(p.id);
                        },
                        style: moveStyle,
                        className: isMover ? 'piece-slide' : 'piece-idle',
                        children: [
                            p.side === 'sheep' && !selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                                children: "Sheep"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                                lineNumber: 299,
                                columnNumber: 49
                            }, this),
                            p.side === 'wolf' && !selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                                children: "Wolf"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                                lineNumber: 300,
                                columnNumber: 48
                            }, this),
                            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: x,
                                        cy: y + 2,
                                        r: PIECE / 2 + 4,
                                        fill: "#c9a227",
                                        opacity: 0.2,
                                        className: "juice-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                                        lineNumber: 303,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: x,
                                        cy: y,
                                        r: PIECE / 2 + 3,
                                        fill: "none",
                                        stroke: "#c9a227",
                                        strokeWidth: 3,
                                        pointerEvents: "none"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                                        lineNumber: 311,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true),
                            body
                        ]
                    }, p.id, true, {
                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                        lineNumber: 290,
                        columnNumber: 11
                    }, this);
                }),
                jumpHighlights.map((p)=>{
                    const { x, y } = xy(p.r, p.c);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: x,
                        cy: y,
                        r: 18,
                        fill: "none",
                        stroke: "#c44836",
                        strokeWidth: 3,
                        className: "juice-pulse danger-ring",
                        pointerEvents: "none"
                    }, `sheep-hl-${p.r}-${p.c}`, false, {
                        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                        lineNumber: 330,
                        columnNumber: 11
                    }, this);
                }),
                juice && toXy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    pointerEvents: "none",
                    className: "juice-flash",
                    children: [
                        juice.kind === 'jump' && juice.through && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: xy(juice.through.r, juice.through.c).x,
                            cy: xy(juice.through.r, juice.through.c).y,
                            r: 16,
                            fill: "rgba(196,72,54,0.3)"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                            lineNumber: 347,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: toXy.x,
                            cy: toXy.y,
                            r: juice.kind === 'jump' ? 22 : 18,
                            fill: juice.kind === 'jump' ? 'none' : 'rgba(70,130,90,0.35)',
                            stroke: juice.kind === 'jump' ? '#c44836' : undefined,
                            strokeWidth: juice.kind === 'jump' ? 4 : undefined
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                            lineNumber: 354,
                            columnNumber: 11
                        }, this),
                        juice.kind === 'jump' && [
                            0,
                            1,
                            2,
                            3,
                            4,
                            5
                        ].map((i)=>{
                            const angle = i * 60;
                            const radius = 26;
                            const x = toXy.x + Math.cos(angle * Math.PI / 180) * radius;
                            const y = toXy.y + Math.sin(angle * Math.PI / 180) * radius;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: x,
                                cy: y,
                                r: 2.5,
                                fill: "#f4d37b",
                                className: "impact-spark"
                            }, `spark-${i}`, false, {
                                fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                                lineNumber: 367,
                                columnNumber: 20
                            }, this);
                        })
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                    lineNumber: 345,
                    columnNumber: 9
                }, this),
                Array.from({
                    length: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"]
                }, (_, ri)=>Array.from({
                        length: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BOARD_MAX"]
                    }, (_, ci)=>{
                        const r = ri + 1;
                        const c = ci + 1;
                        const { x, y } = xy(r, c);
                        const piece = state.pieces.find((item)=>item.r === r && item.c === c);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: x,
                            cy: y,
                            r: 18,
                            fill: "transparent",
                            style: {
                                cursor: interactive ? 'pointer' : 'default'
                            },
                            role: "button",
                            tabIndex: interactive && (piece?.side === 'wolf' || isBoardTarget(stepHighlights, jumpHighlights, r, c)) ? 0 : -1,
                            "aria-label": piece?.side === 'wolf' ? `Wolf at row ${r}, column ${c}` : `Board position row ${r}, column ${c}`,
                            onClick: ()=>{
                                if (!interactive) return;
                                const piece = state.pieces.find((p)=>p.r === r && p.c === c);
                                if (piece?.side === 'wolf') {
                                    onSelectWolf(piece.id);
                                    return;
                                }
                                onClickCell({
                                    r,
                                    c
                                });
                            },
                            onKeyDown: (event)=>{
                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                event.preventDefault();
                                const currentPiece = state.pieces.find((piece)=>piece.r === r && piece.c === c);
                                if (currentPiece?.side === 'wolf') onSelectWolf(currentPiece.id);
                                else onClickCell({
                                    r,
                                    c
                                });
                            }
                        }, `hit-${r}-${c}`, false, {
                            fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
                            lineNumber: 379,
                            columnNumber: 13
                        }, this);
                    }))
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
            lineNumber: 115,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/BoardSvg.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
function isBoardTarget(steps, jumps, r, c) {
    return hasPos(steps, r, c) || hasPos(jumps, r, c);
}
}),
"[project]/apps/web/src/components/admin/adminBoardTheme.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "themeForChapter",
    ()=>themeForChapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$skins$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/skins.ts [app-ssr] (ecmascript)");
;
const CHAPTER_BOARD = {
    spring: 'board-spring',
    summer: 'board-summer',
    autumn: 'board-autumn',
    winter: 'board-winter'
};
const DEFAULT_WOLF = 'wolf-default';
const DEFAULT_BOARD = 'board-default';
function themeForChapter(chapterId) {
    const board = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$skins$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBoardSkin"])(CHAPTER_BOARD[chapterId]) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$skins$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBoardSkin"])(DEFAULT_BOARD);
    const wolf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$skins$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWolfSet"])(DEFAULT_WOLF);
    const rockWarm = board.id === 'board-autumn' ? 0.55 : board.id === 'board-winter' ? -0.45 : board.id === 'board-summer' ? 0.25 : 0;
    return {
        boardFill: board.boardFill,
        lineStroke: board.lineStroke,
        wolfFill: wolf.wolfFill,
        sheepFill: wolf.sheepFill,
        wolfSrc: wolf.assets.wolf,
        sheepSrc: wolf.assets.sheep,
        boardBgSrc: board.assets.boardBg,
        rockWarm
    };
}
}),
"[project]/apps/web/src/components/admin/aiFixtures.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AI_FIXTURES",
    ()=>AI_FIXTURES
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/serialize.ts [app-ssr] (ecmascript) <locals>");
;
const AI_FIXTURES = [
    {
        id: 'block-eat',
        label: '唯一挡吃',
        expect: 'normal/hard 应挡狼下一跳吃（勿走开）',
        suggestedDiff: 'normal',
        build: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["makeState"])({
                levelId: 'fixture-block-eat',
                toMove: 'sheep',
                eatenSheep: 0,
                pieces: [
                    {
                        id: 'w1',
                        side: 'wolf',
                        r: 4,
                        c: 3
                    },
                    {
                        id: 'w2',
                        side: 'wolf',
                        r: 6,
                        c: 1
                    },
                    {
                        id: 'w3',
                        side: 'wolf',
                        r: 6,
                        c: 6
                    },
                    {
                        id: 's1',
                        side: 'sheep',
                        r: 4,
                        c: 5
                    },
                    {
                        id: 's2',
                        side: 'sheep',
                        r: 3,
                        c: 4
                    },
                    {
                        id: 's3',
                        side: 'sheep',
                        r: 2,
                        c: 2
                    }
                ],
                rocks: []
            })
    },
    {
        id: 'no-feed',
        label: '送吃诱惑',
        expect: 'normal/hard 不应走进狼可隔空吃的点',
        suggestedDiff: 'normal',
        build: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["makeState"])({
                levelId: 'fixture-no-feed',
                toMove: 'sheep',
                eatenSheep: 2,
                pieces: [
                    {
                        id: 'w1',
                        side: 'wolf',
                        r: 5,
                        c: 3
                    },
                    {
                        id: 'w2',
                        side: 'wolf',
                        r: 6,
                        c: 2
                    },
                    {
                        id: 'w3',
                        side: 'wolf',
                        r: 6,
                        c: 5
                    },
                    {
                        id: 's1',
                        side: 'sheep',
                        r: 3,
                        c: 3
                    },
                    {
                        id: 's2',
                        side: 'sheep',
                        r: 2,
                        c: 4
                    },
                    {
                        id: 's3',
                        side: 'sheep',
                        r: 2,
                        c: 2
                    },
                    {
                        id: 's4',
                        side: 'sheep',
                        r: 1,
                        c: 5
                    }
                ],
                rocks: [
                    {
                        r: 4,
                        c: 1
                    },
                    {
                        r: 4,
                        c: 6
                    }
                ]
            })
    },
    {
        id: 'surround',
        label: '冬日合围样',
        expect: 'hard 优先减狼机动 / 抬 surround 分',
        suggestedDiff: 'hard',
        build: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["makeState"])({
                levelId: 'fixture-surround',
                toMove: 'sheep',
                eatenSheep: 4,
                pieces: [
                    {
                        id: 'w1',
                        side: 'wolf',
                        r: 4,
                        c: 3
                    },
                    {
                        id: 'w2',
                        side: 'wolf',
                        r: 4,
                        c: 4
                    },
                    {
                        id: 'w3',
                        side: 'wolf',
                        r: 5,
                        c: 3
                    },
                    {
                        id: 's1',
                        side: 'sheep',
                        r: 3,
                        c: 2
                    },
                    {
                        id: 's2',
                        side: 'sheep',
                        r: 3,
                        c: 3
                    },
                    {
                        id: 's3',
                        side: 'sheep',
                        r: 3,
                        c: 5
                    },
                    {
                        id: 's4',
                        side: 'sheep',
                        r: 2,
                        c: 4
                    },
                    {
                        id: 's5',
                        side: 'sheep',
                        r: 5,
                        c: 5
                    },
                    {
                        id: 's6',
                        side: 'sheep',
                        r: 2,
                        c: 2
                    }
                ],
                rocks: []
            })
    },
    {
        id: 'budget-starve',
        label: '极紧预算（逼降级）',
        expect: 'maxNodes=1 / maxMs=1 时 hard 应 degraded→normal',
        suggestedDiff: 'hard',
        build: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["makeState"])({
                levelId: 'fixture-budget',
                toMove: 'sheep',
                eatenSheep: 0,
                pieces: [
                    {
                        id: 'w1',
                        side: 'wolf',
                        r: 6,
                        c: 2
                    },
                    {
                        id: 'w2',
                        side: 'wolf',
                        r: 6,
                        c: 4
                    },
                    {
                        id: 'w3',
                        side: 'wolf',
                        r: 6,
                        c: 6
                    },
                    {
                        id: 's1',
                        side: 'sheep',
                        r: 3,
                        c: 3
                    },
                    {
                        id: 's2',
                        side: 'sheep',
                        r: 2,
                        c: 2
                    },
                    {
                        id: 's3',
                        side: 'sheep',
                        r: 2,
                        c: 4
                    },
                    {
                        id: 's4',
                        side: 'sheep',
                        r: 1,
                        c: 3
                    },
                    {
                        id: 's5',
                        side: 'sheep',
                        r: 3,
                        c: 5
                    }
                ],
                rocks: []
            })
    }
];
}),
"[project]/apps/web/src/components/admin/AiSimConsole.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AiSimConsole",
    ()=>AiSimConsole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/serialize.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/evaluate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$hard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/hard.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/board.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$BoardSvg$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/BoardSvg.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$admin$2f$adminBoardTheme$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/admin/adminBoardTheme.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$admin$2f$aiFixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/admin/aiFixtures.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const CYCLE = [
    'empty',
    'wolf',
    'sheep',
    'rock'
];
function AiSimConsole({ initialLevel, initialDiff, initialSeed }) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        const level = initialLevel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(initialLevel) : undefined;
        if (level) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createLevelInitialState"])(level);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createInitialState"])('spring-01');
    });
    const [difficulty, setDifficulty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if (initialDiff === 'easy' || initialDiff === 'normal' || initialDiff === 'hard') {
            return initialDiff;
        }
        const level = initialLevel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(initialLevel) : undefined;
        return level?.ai ?? 'easy';
    });
    const [seed, setSeed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        const parsed = Number(initialSeed);
        return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 42;
    });
    const [placeMode, setPlaceMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('cycle');
    const [strict, setStrict] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [importText, setImportText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [batchN, setBatchN] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(50);
    const [batchLevelId, setBatchLevelId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialLevel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(initialLevel) ? initialLevel : 'spring-01');
    const [batchDiff, setBatchDiff] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(difficulty);
    const [batchResult, setBatchResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [batchProgress, setBatchProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [reasonFilter, setReasonFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [replay, setReplay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [replayIndex, setReplayIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [takeover, setTakeover] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedWolfId, setSelectedWolfId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [maxNodes, setMaxNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(4000);
    const [maxMs, setMaxMs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(12);
    const [lastHardMeta, setLastHardMeta] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const stopRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const appliedUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const hardBudgets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            maxNodes: Math.max(1, maxNodes),
            maxMs: Math.max(1, maxMs)
        }), [
        maxNodes,
        maxMs
    ]);
    const breakdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluate"])(state), [
        state
    ]);
    const takeoverActions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>takeover && selectedWolfId && state.toMove === 'wolf' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(state).filter((action)=>action.pieceId === selectedWolfId) : [], [
        selectedWolfId,
        state,
        takeover
    ]);
    const pushLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((line)=>{
        setLogs((prev)=>[
                `[${new Date().toLocaleTimeString()}] ${line}`,
                ...prev
            ].slice(0, 80));
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (appliedUrl.current) return;
        if (!initialLevel) return;
        const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(initialLevel);
        if (!level) return;
        appliedUrl.current = true;
        setState((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createLevelInitialState"])(level));
        setBatchLevelId(level.id);
        const d = initialDiff === 'easy' || initialDiff === 'normal' || initialDiff === 'hard' ? initialDiff : level.ai;
        setDifficulty(d);
        setBatchDiff(d);
        pushLog(`deep-link level=${level.id} diff=${d}`);
    }, [
        initialLevel,
        initialDiff,
        pushLog
    ]);
    function loadLevel(id) {
        const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(id);
        if (!level) return;
        setState((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createLevelInitialState"])(level));
        pushLog(`loaded level ${id} ai=${level.ai}`);
        setDifficulty(level.ai);
        setBatchLevelId(id);
        setBatchDiff(level.ai);
    }
    function setTurn(toMove, clearChain = true) {
        setState((s)=>({
                ...s,
                toMove,
                chain: clearChain ? null : s.chain,
                status: 'playing'
            }));
    }
    function clickCell(pos) {
        if (takeover) {
            wolfTakeoverClick(pos);
            return;
        }
        setState((prev)=>editCell(prev, pos, placeMode, strict));
    }
    function wolfTakeoverClick(pos) {
        if (state.status !== 'playing' || state.toMove !== 'wolf') return;
        const wolf = state.pieces.find((piece)=>piece.side === 'wolf' && piece.r === pos.r && piece.c === pos.c);
        if (wolf && !state.chain) {
            setSelectedWolfId(wolf.id);
            return;
        }
        if (!selectedWolfId) return;
        const action = takeoverActions.find((candidate)=>candidate.to.r === pos.r && candidate.to.c === pos.c) ?? takeoverActions.find((candidate)=>candidate.type === 'jump' && candidate.through.r === pos.r && candidate.through.c === pos.c);
        if (!action) return;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) return;
        setState(result.state);
        setSelectedWolfId(result.state.chain?.wolfId ?? null);
        pushLog(`[human wolf] ${JSON.stringify(action)}`);
    }
    function loadReplayForTakeover() {
        if (!replay) return;
        setState((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deserialize"])(JSON.parse(replay.states[replayIndex])));
        setTakeover(true);
        setSelectedWolfId(null);
        pushLog(`human takeover replay game=${replay.record.index} step=${replayIndex}`);
    }
    function sheepStep() {
        setBusy(true);
        try {
            let s = state;
            if (s.toMove !== 'sheep') {
                s = {
                    ...s,
                    toMove: 'sheep',
                    chain: null,
                    status: 'playing'
                };
            }
            if (s.status !== 'playing') {
                pushLog('game not playing');
                return;
            }
            const rng = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(seed);
            let action;
            if (difficulty === 'hard') {
                const { action: a, meta } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$hard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickHardWithMeta"])(s, rng, hardBudgets);
                action = a;
                setLastHardMeta(meta);
                pushLog(`[hard] degraded=${meta.degraded} lookahead=${meta.lookaheadCompleted} nodes=${meta.nodes} ms=${meta.elapsedMs.toFixed(1)} budgets=${JSON.stringify(hardBudgets)}`);
            } else {
                setLastHardMeta(null);
                action = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["pickSheepAction"])(s, {
                    difficulty,
                    rng,
                    budgets: hardBudgets
                });
            }
            const res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(s, action);
            if (!res.ok) {
                pushLog(`apply failed: ${res.error}`);
                return;
            }
            setState(res.state);
            setSeed((x)=>x + 1);
            const ev = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$evaluate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluate"])(res.state);
            pushLog(`[sheep ${difficulty}] ${JSON.stringify(action)} score=${ev.total.toFixed(1)}`);
        } catch (e) {
            pushLog(`AI error: ${e instanceof Error ? e.message : String(e)}`);
        } finally{
            setBusy(false);
        }
    }
    function loadFixture(id) {
        const fx = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$admin$2f$aiFixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AI_FIXTURES"].find((f)=>f.id === id);
        if (!fx) return;
        const next = fx.build();
        setState(next);
        setDifficulty(fx.suggestedDiff);
        setBatchDiff(fx.suggestedDiff);
        if (fx.id === 'budget-starve') {
            setMaxNodes(1);
            setMaxMs(1);
        }
        pushLog(`fixture ${fx.id}: ${fx.expect}`);
    }
    async function autoRun(maxSteps) {
        stopRef.current = false;
        setBusy(true);
        let s = state;
        let localSeed = seed;
        for(let i = 0; i < maxSteps; i++){
            if (stopRef.current) {
                pushLog('auto-run stopped');
                break;
            }
            if (s.status !== 'playing') {
                pushLog(`terminal: ${s.status}`);
                break;
            }
            if (s.toMove === 'wolf') {
                const legal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(s);
                if (legal.length === 0) {
                    pushLog('wolves have no moves');
                    break;
                }
                const rng = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(localSeed++);
                const pick = legal[Math.floor(rng.nextFloat() * legal.length)];
                const res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(s, pick);
                if (!res.ok) break;
                s = res.state;
                if (s.chain) {
                    const end = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["endWolfTurn"])(s);
                    if (end.ok) s = end.state;
                }
                pushLog(`[wolf random] ${JSON.stringify(pick)}`);
            } else {
                try {
                    const rng = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(localSeed++);
                    let action;
                    if (difficulty === 'hard') {
                        const { action: a, meta } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$hard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickHardWithMeta"])(s, rng, hardBudgets);
                        action = a;
                        if (meta.degraded) {
                            pushLog(`[hard degraded] nodes=${meta.nodes} ms=${meta.elapsedMs.toFixed(1)}`);
                        }
                    } else {
                        action = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["pickSheepAction"])(s, {
                            difficulty,
                            rng,
                            budgets: hardBudgets
                        });
                    }
                    const res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(s, action);
                    if (!res.ok) break;
                    s = res.state;
                    pushLog(`[sheep ${difficulty}] ${JSON.stringify(action)}`);
                } catch (e) {
                    pushLog(`AI error: ${e instanceof Error ? e.message : String(e)}`);
                    break;
                }
            }
            setState(s);
            setSeed(localSeed);
            await new Promise((r)=>setTimeout(r, 30));
        }
        setBusy(false);
    }
    async function runBatch() {
        const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(batchLevelId);
        if (!level) {
            pushLog(`batch: unknown level ${batchLevelId}`);
            return;
        }
        const n = Math.min(200, Math.max(1, batchN));
        stopRef.current = false;
        setBusy(true);
        setBatchProgress(0);
        setBatchResult(null);
        pushLog(`batch start n=${n} level=${level.id} sheep=${batchDiff} wolf=random-legal (非狼AI粗校准)`);
        const t0 = performance.now();
        let wolfWins = 0;
        let sheepWins = 0;
        let timeout = 0;
        let pliesSum = 0;
        let lastSerialize = null;
        let localSeed = seed;
        const records = [];
        for(let g = 0; g < n; g++){
            if (stopRef.current) {
                pushLog(`batch stopped at ${g}/${n}`);
                break;
            }
            const gameSeed = localSeed;
            const sim = simulateOneGame(level, batchDiff, gameSeed, 400, hardBudgets);
            localSeed += 10007;
            pliesSum += sim.plies;
            if (sim.outcome === 'wolf_win') wolfWins++;
            else if (sim.outcome === 'sheep_win') sheepWins++;
            else timeout++;
            lastSerialize = sim.serialized;
            records.push({
                index: g + 1,
                seed: gameSeed,
                outcome: sim.outcome,
                reason: sim.reason,
                plies: sim.plies,
                eatenSheep: sim.eatenSheep,
                firstCapturePly: sim.firstCapturePly
            });
            if (g % 5 === 0 || g === n - 1) {
                setBatchProgress(g + 1);
                await new Promise((r)=>setTimeout(r, 0));
            }
        }
        const games = wolfWins + sheepWins + timeout;
        const elapsedMs = Math.round(performance.now() - t0);
        const avgPlies = games > 0 ? pliesSum / games : 0;
        const csv = [
            level.id,
            batchDiff,
            games,
            wolfWins,
            sheepWins,
            timeout,
            (gameRate(wolfWins, games) * 100).toFixed(1),
            avgPlies.toFixed(1),
            elapsedMs,
            seed
        ].join(',');
        const result = {
            wolfWins,
            sheepWins,
            timeout,
            games,
            avgPlies,
            elapsedMs,
            lastSerialize,
            csv: `level,diff,games,wolfWins,sheepWins,timeout,wolfWinPct,avgPlies,ms,seedBase\n${csv}`,
            records
        };
        setBatchResult(result);
        setSeed(localSeed);
        pushLog(`batch done wolf=${wolfWins} sheep=${sheepWins} timeout=${timeout} avgPlies=${avgPlies.toFixed(1)} ${elapsedMs}ms`);
        setBusy(false);
    }
    function openReplay(record) {
        const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(batchLevelId);
        if (!level) return;
        const sim = simulateOneGame(level, batchDiff, record.seed, 400, hardBudgets, true);
        setReplay({
            record,
            states: sim.states,
            actions: sim.actions
        });
        setReplayIndex(0);
        pushLog(`replay game=${record.index} seed=${record.seed} reason=${record.reason}`);
    }
    function exportReproduction(record) {
        const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(batchLevelId);
        if (!level) return;
        const payload = {
            schemaVersion: 1,
            levelId: level.id,
            level,
            sheepDifficulty: batchDiff,
            wolfStrategy: 'random-legal',
            seed: record.seed,
            hardBudgets,
            result: record,
            command: `level=${level.id} diff=${batchDiff} seed=${record.seed} maxNodes=${hardBudgets.maxNodes} maxMs=${hardBudgets.maxMs}`
        };
        downloadJson(payload, `repro-${level.id}-${record.seed}.json`);
    }
    function exportJson() {
        const json = JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["serialize"])(state), null, 2);
        void navigator.clipboard.writeText(json);
        pushLog('copied board JSON to clipboard');
        const blob = new Blob([
            json
        ], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `board-${state.levelId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    function importJson() {
        try {
            const data = JSON.parse(importText);
            const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deserialize"])(data);
            setState(next);
            pushLog('imported board JSON');
        } catch (e) {
            pushLog(`import fail: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto flex max-w-6xl flex-col gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 lg:grid-cols-[240px_1fr_280px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "flex flex-col gap-3 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex flex-col gap-1",
                                children: [
                                    "AI 档位",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: difficulty,
                                        onChange: (e)=>setDifficulty(e.target.value),
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "easy",
                                                children: "easy"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 464,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "normal",
                                                children: "normal"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 465,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "hard",
                                                children: "hard"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 466,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 459,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 457,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex flex-col gap-1",
                                children: [
                                    "Seed",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        value: seed,
                                        onChange: (e)=>setSeed(Number(e.target.value)),
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 471,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 469,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex flex-col gap-1",
                                children: [
                                    "Fixture 一键载入",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        defaultValue: "",
                                        onChange: (e)=>{
                                            if (e.target.value) {
                                                loadFixture(e.target.value);
                                                e.target.value = '';
                                            }
                                        },
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "选择坏局…"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 490,
                                                columnNumber: 15
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$admin$2f$aiFixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AI_FIXTURES"].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: f.id,
                                                    children: f.label
                                                }, f.id, false, {
                                                    fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                    lineNumber: 492,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 480,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 478,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded border border-[#5c6b52]/25 bg-[#f7f5ef] p-2 text-xs text-[#5c6b52]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-[#2c3328]",
                                        children: "HardBudgets"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 499,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "mt-1 flex items-center gap-2",
                                        children: [
                                            "maxNodes",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                min: 1,
                                                value: maxNodes,
                                                onChange: (e)=>setMaxNodes(Number(e.target.value) || 1),
                                                className: "w-20 rounded border border-[#5c6b52]/40 bg-white px-1 py-0.5"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 502,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 500,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "mt-1 flex items-center gap-2",
                                        children: [
                                            "maxMs",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                min: 1,
                                                value: maxMs,
                                                onChange: (e)=>setMaxMs(Number(e.target.value) || 1),
                                                className: "w-20 rounded border border-[#5c6b52]/40 bg-white px-1 py-0.5"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 512,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 510,
                                        columnNumber: 13
                                    }, this),
                                    lastHardMeta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `mt-1 ${lastHardMeta.degraded ? 'text-amber-800' : 'text-green-800'}`,
                                        children: [
                                            "上次 hard：degraded=",
                                            String(lastHardMeta.degraded),
                                            " · nodes=",
                                            lastHardMeta.nodes,
                                            " · ",
                                            lastHardMeta.elapsedMs.toFixed(1),
                                            "ms"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 521,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 opacity-70",
                                        children: "跑 hard 单步后显示降级观测"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 528,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 498,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex flex-col gap-1",
                                children: [
                                    "加载关卡",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LEVELS"].some((l)=>l.id === state.levelId) ? state.levelId : '',
                                        onChange: (e)=>{
                                            if (e.target.value) loadLevel(e.target.value);
                                        },
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "（fixture / 自定义）"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 540,
                                                columnNumber: 15
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LEVELS"].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: l.id,
                                                    children: l.id
                                                }, l.id, false, {
                                                    fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                    lineNumber: 542,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 533,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 531,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex flex-col gap-1",
                                children: [
                                    "摆子模式",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: placeMode,
                                        onChange: (e)=>setPlaceMode(e.target.value),
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "cycle",
                                                children: "循环 空→狼→羊→岩"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 555,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "empty",
                                                children: "清空点"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 556,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "wolf",
                                                children: "放狼"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 557,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "sheep",
                                                children: "放羊"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 558,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "rock",
                                                children: "放岩"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 559,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 550,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 548,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: strict,
                                        onChange: (e)=>setStrict(e.target.checked)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 563,
                                        columnNumber: 13
                                    }, this),
                                    "严格模式（禁重叠）"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 562,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center gap-2 border border-[#5c6b52]/25 bg-[#f7f5ef] p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: takeover,
                                        onChange: (event)=>{
                                            setTakeover(event.target.checked);
                                            setSelectedWolfId(null);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 567,
                                        columnNumber: 13
                                    }, this),
                                    "人工接管狼方"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 566,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs",
                                        onClick: ()=>setTurn('wolf'),
                                        children: "轮到狼"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 571,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs",
                                        onClick: ()=>setTurn('sheep'),
                                        children: "轮到羊"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 578,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs",
                                        onClick: ()=>setState((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createInitialState"])('sim')),
                                        children: "标准开局"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 585,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 570,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: busy,
                                className: "rounded-lg bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea] disabled:opacity-50",
                                onClick: sheepStep,
                                children: busy ? '计算中…' : '羊单步 AI'
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 593,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: busy,
                                        className: "flex-1 rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs disabled:opacity-50",
                                        onClick: ()=>void autoRun(50),
                                        children: "自动跑 50"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 602,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs",
                                        onClick: ()=>{
                                            stopRef.current = true;
                                        },
                                        children: "停止"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 610,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 601,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs",
                                onClick: exportJson,
                                children: "导出 JSON"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 620,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: importText,
                                onChange: (e)=>setImportText(e.target.value),
                                placeholder: "粘贴局面 JSON",
                                className: "h-24 rounded border border-[#5c6b52]/40 bg-[#f7f5ef] p-2 font-mono text-xs"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 627,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs",
                                onClick: importJson,
                                children: "导入 JSON"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 633,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 456,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "flex flex-col items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-[#5c6b52]",
                                children: [
                                    state.toMove,
                                    " · ",
                                    state.status,
                                    " · eaten ",
                                    state.eatenSheep,
                                    state.chain ? ` · chain ${state.chain.count}` : ''
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 643,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$BoardSvg$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoardSvg"], {
                                state: state,
                                selectedWolfId: takeover ? selectedWolfId : null,
                                stepHighlights: takeoverActions.filter((action)=>action.type === 'step').map((action)=>action.to),
                                jumpHighlights: takeoverActions.filter((action)=>action.type === 'jump').map((action)=>action.to),
                                jumpThroughs: takeoverActions.filter((action)=>action.type === 'jump').map((action)=>action.through),
                                interactive: true,
                                theme: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$admin$2f$adminBoardTheme$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["themeForChapter"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(state.levelId)?.chapterId ?? 'spring'),
                                onSelectWolf: (id)=>{
                                    if (takeover) {
                                        setSelectedWolfId(id);
                                        return;
                                    }
                                    const piece = state.pieces.find((p)=>p.id === id);
                                    if (piece) clickCell({
                                        r: piece.r,
                                        c: piece.c
                                    });
                                },
                                onClickCell: clickCell
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 647,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 642,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "flex flex-col gap-3 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium",
                                        children: "evaluate"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 669,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 font-mono text-xs",
                                        children: [
                                            "total ",
                                            breakdown.total.toFixed(2)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 670,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "mt-2 space-y-0.5 font-mono text-xs text-[#5c6b52]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    "material ",
                                                    breakdown.material.toFixed(2)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 672,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    "wolfMobility ",
                                                    breakdown.wolfMobility.toFixed(2)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 673,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    "cluster ",
                                                    breakdown.cluster.toFixed(2)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 674,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    "advance ",
                                                    breakdown.advance.toFixed(2)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 675,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    "surround ",
                                                    breakdown.surround.toFixed(2)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 676,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 671,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 668,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-h-[420px] overflow-auto rounded-lg border border-[#5c6b52]/25 bg-[#1e261c] p-3 font-mono text-xs text-[#dfe8d8]",
                                children: logs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "opacity-60",
                                    children: "日志空"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                    lineNumber: 680,
                                    columnNumber: 34
                                }, this) : logs.map((l, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: l
                                    }, i, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 680,
                                        columnNumber: 89
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 679,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 667,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                lineNumber: 455,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-medium text-[#2c3328]",
                        children: "批量校准"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 686,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-[#5c6b52]",
                        children: [
                            "狼方：合法着法均匀随机（非狼 AI）。羊方：线上同档 pickSheepAction。用于粗校准，非玩家真实胜率。 N≤200。深链：",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "ml-1 rounded bg-[#dfe8d8] px-1",
                                children: "/admin/ai?level=spring-01&diff=hard"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 690,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 687,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 flex flex-wrap items-end gap-3 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex flex-col gap-1",
                                children: [
                                    "关卡",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: batchLevelId,
                                        onChange: (e)=>setBatchLevelId(e.target.value),
                                        className: "rounded border border-[#5c6b52]/40 bg-white px-2 py-1",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LEVELS"].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: l.id,
                                                children: l.id
                                            }, l.id, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 701,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 695,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 693,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex flex-col gap-1",
                                children: [
                                    "羊 AI",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: batchDiff,
                                        onChange: (e)=>setBatchDiff(e.target.value),
                                        className: "rounded border border-[#5c6b52]/40 bg-white px-2 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "easy",
                                                children: "easy"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 714,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "normal",
                                                children: "normal"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 715,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "hard",
                                                children: "hard"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 716,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 709,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 707,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex flex-col gap-1",
                                children: [
                                    "N",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: batchN,
                                        onChange: (e)=>setBatchN(Number(e.target.value)),
                                        className: "rounded border border-[#5c6b52]/40 bg-white px-2 py-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 10,
                                                children: "10"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 726,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 50,
                                                children: "50"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 727,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 100,
                                                children: "100"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 728,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 200,
                                                children: "200"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 729,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 721,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 719,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: busy,
                                className: "rounded-lg bg-[#3d4a3a] px-4 py-2 text-[#f4f1ea] disabled:opacity-50",
                                onClick: ()=>void runBatch(),
                                children: busy ? `跑批中 ${batchProgress}/${batchN}` : '开始批量'
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 732,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-[#5c6b52]/40 px-3 py-2 text-xs",
                                onClick: ()=>{
                                    stopRef.current = true;
                                },
                                children: "停止"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 740,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 692,
                        columnNumber: 9
                    }, this),
                    batchResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 space-y-2 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#2c3328]",
                                children: [
                                    "局数 ",
                                    batchResult.games,
                                    " · 狼胜 ",
                                    batchResult.wolfWins,
                                    "（",
                                    (gameRate(batchResult.wolfWins, batchResult.games) * 100).toFixed(1),
                                    "%）· 羊胜",
                                    ' ',
                                    batchResult.sheepWins,
                                    " · 超步 ",
                                    batchResult.timeout,
                                    " · 平均步数",
                                    ' ',
                                    batchResult.avgPlies.toFixed(1),
                                    " · ",
                                    batchResult.elapsedMs,
                                    "ms"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 752,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-[#5c6b52]/40 bg-white px-2 py-1 text-xs",
                                        onClick: ()=>{
                                            void navigator.clipboard.writeText(batchResult.csv);
                                            pushLog('batch CSV copied');
                                        },
                                        children: "复制 CSV"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 759,
                                        columnNumber: 15
                                    }, this),
                                    batchResult.lastSerialize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-[#5c6b52]/40 bg-white px-2 py-1 text-xs",
                                        onClick: ()=>{
                                            const blob = new Blob([
                                                batchResult.lastSerialize
                                            ], {
                                                type: 'application/json'
                                            });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `batch-last-${batchLevelId}.json`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        },
                                        children: "下载最后一局 serialize"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 770,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 758,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                className: "overflow-x-auto rounded bg-[#1e261c] p-2 font-mono text-xs text-[#dfe8d8]",
                                children: batchResult.csv
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 789,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-end gap-3 border-t border-[#5c6b52]/20 pt-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "grid gap-1 text-xs text-[#5c6b52]",
                                        children: [
                                            "终局筛选",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: reasonFilter,
                                                onChange: (event)=>setReasonFilter(event.target.value),
                                                className: "border border-[#5c6b52]/30 bg-white px-2 py-1 text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "all",
                                                        children: "全部"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 795,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "targetEaten",
                                                        children: "狼达成目标"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 795,
                                                        columnNumber: 50
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "wolvesTrapped",
                                                        children: "狼无行动"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 795,
                                                        columnNumber: 92
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "repetition",
                                                        children: "重复局面"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 795,
                                                        columnNumber: 135
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "maxPlies",
                                                        children: "回合耗尽"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 795,
                                                        columnNumber: 175
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "stepLimit",
                                                        children: "模拟步数上限"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 795,
                                                        columnNumber: 213
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "unexpected",
                                                        children: "异常"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 795,
                                                        columnNumber: 254
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 794,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 793,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-[#5c6b52]",
                                        children: [
                                            "显示 ",
                                            batchResult.records.filter((record)=>reasonFilter === 'all' || record.reason === reasonFilter).length,
                                            "/",
                                            batchResult.records.length
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 798,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 792,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-h-72 overflow-auto border border-[#5c6b52]/20 bg-white",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "w-full text-left text-xs",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            className: "sticky top-0 bg-[#eef2ea]",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "p-2",
                                                        children: "局"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 802,
                                                        columnNumber: 66
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "seed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 802,
                                                        columnNumber: 92
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "终局"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 802,
                                                        columnNumber: 105
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "plies"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 802,
                                                        columnNumber: 116
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "首吃"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 802,
                                                        columnNumber: 130
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        children: "操作"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                        lineNumber: 802,
                                                        columnNumber: 141
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 802,
                                                columnNumber: 62
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                            lineNumber: 802,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: batchResult.records.filter((record)=>reasonFilter === 'all' || record.reason === reasonFilter).map((record)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "border-t border-[#5c6b52]/10",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-2",
                                                            children: record.index
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                            lineNumber: 804,
                                                            columnNumber: 83
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: record.seed
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                            lineNumber: 804,
                                                            columnNumber: 122
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: record.reason
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                            lineNumber: 804,
                                                            columnNumber: 144
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: record.plies
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                            lineNumber: 804,
                                                            columnNumber: 168
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            children: record.firstCapturePly ?? '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                            lineNumber: 804,
                                                            columnNumber: 191
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "space-x-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>openReplay(record),
                                                                    className: "underline",
                                                                    children: "回放"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                                    lineNumber: 804,
                                                                    columnNumber: 257
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>exportReproduction(record),
                                                                    className: "underline",
                                                                    children: "复现包"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                                    lineNumber: 804,
                                                                    columnNumber: 347
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                            lineNumber: 804,
                                                            columnNumber: 231
                                                        }, this)
                                                    ]
                                                }, record.index, true, {
                                                    fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                    lineNumber: 804,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                            lineNumber: 803,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                    lineNumber: 801,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 800,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 751,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                lineNumber: 685,
                columnNumber: 7
            }, this),
            replay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "border border-[#5c6b52]/25 bg-[#f7f5ef] p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-medium text-[#2c3328]",
                                        children: [
                                            "棋谱回放 · 第 ",
                                            replay.record.index,
                                            " 局"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 814,
                                        columnNumber: 83
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#5c6b52]",
                                        children: [
                                            "seed ",
                                            replay.record.seed,
                                            " · ",
                                            replay.record.reason,
                                            " · 步骤 ",
                                            replayIndex,
                                            "/",
                                            replay.states.length - 1
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 814,
                                        columnNumber: 163
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 814,
                                columnNumber: 78
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setReplay(null),
                                className: "text-sm underline",
                                children: "关闭回放"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 814,
                                columnNumber: 307
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 814,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 grid items-start gap-4 md:grid-cols-[minmax(0,480px)_1fr]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$BoardSvg$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoardSvg"], {
                                state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deserialize"])(JSON.parse(replay.states[replayIndex])),
                                selectedWolfId: null,
                                stepHighlights: [],
                                jumpHighlights: [],
                                jumpThroughs: [],
                                interactive: false,
                                theme: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$admin$2f$adminBoardTheme$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["themeForChapter"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLevel"])(batchLevelId)?.chapterId ?? 'spring'),
                                onSelectWolf: ()=>undefined,
                                onClickCell: ()=>undefined
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 816,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        "aria-label": "回放步骤",
                                        type: "range",
                                        min: 0,
                                        max: replay.states.length - 1,
                                        value: replayIndex,
                                        onChange: (event)=>setReplayIndex(Number(event.target.value)),
                                        className: "w-full"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 818,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2 flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                disabled: replayIndex === 0,
                                                onClick: ()=>setReplayIndex((value)=>Math.max(0, value - 1)),
                                                className: "border px-3 py-2 disabled:opacity-40",
                                                children: "上一步"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 819,
                                                columnNumber: 48
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                disabled: replayIndex >= replay.states.length - 1,
                                                onClick: ()=>setReplayIndex((value)=>Math.min(replay.states.length - 1, value + 1)),
                                                className: "border px-3 py-2 disabled:opacity-40",
                                                children: "下一步"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                                lineNumber: 819,
                                                columnNumber: 226
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 819,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: loadReplayForTakeover,
                                        className: "mt-2 bg-[#3d4a3a] px-3 py-2 text-sm text-[#f4f1ea]",
                                        children: "从此步人工接管"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 820,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-3 break-all font-mono text-xs text-[#5c6b52]",
                                        children: replayIndex === 0 ? '初始局面' : replay.actions[replayIndex - 1]
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                        lineNumber: 821,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                                lineNumber: 817,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                        lineNumber: 815,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
                lineNumber: 813,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/admin/AiSimConsole.tsx",
        lineNumber: 454,
        columnNumber: 5
    }, this);
}
function gameRate(n, total) {
    return total > 0 ? n / total : 0;
}
function simulateOneGame(level, difficulty, seed, maxSteps = 400, budgets, captureReplay = false) {
    let s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createLevelInitialState"])(level);
    let localSeed = seed;
    let plies = 0;
    let firstCapturePly = null;
    const states = captureReplay ? [
        JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["serialize"])(s))
    ] : [];
    const actions = [];
    while(s.status === 'playing' && plies < maxSteps){
        plies++;
        const beforeEaten = s.eatenSheep;
        if (s.toMove === 'wolf') {
            const legal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(s);
            if (legal.length === 0) break;
            const rng = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(localSeed++);
            const pick = legal[Math.floor(rng.nextFloat() * legal.length)];
            const res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(s, pick);
            if (!res.ok) break;
            s = res.state;
            actions.push(`wolf:${JSON.stringify(pick)}`);
            if (s.chain) {
                const end = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["endWolfTurn"])(s);
                if (end.ok) s = end.state;
            }
        } else {
            const action = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["pickSheepAction"])(s, {
                difficulty,
                rng: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(localSeed++),
                budgets
            });
            const res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(s, action);
            if (!res.ok) break;
            s = res.state;
            actions.push(`sheep:${JSON.stringify(action)}`);
        }
        if (firstCapturePly === null && s.eatenSheep > beforeEaten) firstCapturePly = s.plyCount;
        if (captureReplay) states.push(JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["serialize"])(s)));
    }
    let outcome = 'timeout';
    if (s.status === 'won') outcome = 'wolf_win';
    else if (s.status === 'lost') outcome = 'sheep_win';
    return {
        outcome,
        reason: terminalReason(s, plies >= maxSteps),
        plies,
        eatenSheep: s.eatenSheep,
        firstCapturePly,
        serialized: JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["serialize"])(s), null, 2),
        states,
        actions
    };
}
function terminalReason(state, hitStepLimit) {
    if (state.eatenSheep >= state.targetEaten) return 'targetEaten';
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listWolfActionsAsIfTurn"])(state).length === 0) return 'wolvesTrapped';
    if (state.plyCount >= state.maxPlies) return 'maxPlies';
    if ((state.repetitionCounts.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["boardPositionKey"])(state)) ?? 0) >= 3) return 'repetition';
    if (hitStepLimit) return 'stepLimit';
    return 'unexpected';
}
function downloadJson(value, filename) {
    const blob = new Blob([
        JSON.stringify(value, null, 2)
    ], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}
function editCell(state, pos, mode, strict) {
    const k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$board$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["posKey"])(pos.r, pos.c);
    const piece = state.pieces.find((p)=>p.r === pos.r && p.c === pos.c);
    const hasRock = state.rocks.has(k);
    let kind;
    if (mode === 'cycle') {
        const cur = hasRock ? 'rock' : piece ? piece.side : 'empty';
        const idx = CYCLE.indexOf(cur);
        kind = CYCLE[(idx + 1) % CYCLE.length];
    } else {
        kind = mode;
    }
    let pieces = state.pieces.filter((p)=>!(p.r === pos.r && p.c === pos.c));
    const rocks = new Set(state.rocks);
    rocks.delete(k);
    if (kind === 'rock') {
        if (strict && piece) return state;
        rocks.add(k);
    } else if (kind === 'wolf' || kind === 'sheep') {
        if (strict && rocks.has(k)) return state;
        const wolves = pieces.filter((p)=>p.side === 'wolf');
        if (kind === 'wolf' && wolves.length >= 3 && !piece) {
            pieces = pieces.filter((p)=>p.id !== wolves[0].id);
        }
        const id = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const np = {
            id,
            side: kind,
            r: pos.r,
            c: pos.c
        };
        pieces = [
            ...pieces,
            np
        ];
    }
    const sheep = pieces.filter((p)=>p.side === 'sheep').length;
    const eatenSheep = Math.max(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OPENING_SHEEP"] - sheep);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$serialize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["makeState"])({
        pieces,
        rocks: [
            ...rocks
        ].map((key)=>{
            const [r, c] = key.split(',').map(Number);
            return {
                r: r,
                c: c
            };
        }),
        eatenSheep,
        toMove: state.toMove,
        chain: null,
        status: 'playing',
        levelId: state.levelId
    });
}
}),
];

//# sourceMappingURL=_9f9dfc31._.js.map