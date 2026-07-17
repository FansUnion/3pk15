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
                c: 6
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
                c: 3
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
            ]
        },
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
    for (const action of actions){
        if (exhausted(nodes, budgets, start)) break;
        nodes.n++;
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) continue;
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
"[project]/apps/web/src/config/locales.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const segments = normalized.split('/').filter(Boolean);
    if (segments[0] === 'zh') {
        const rest = segments.slice(1).join('/');
        return rest ? `/${rest}` : '/';
    }
    return normalized;
}
function withLocalePath(path, locale = defaultLocale) {
    const stripped = stripLocalePrefix(path);
    const normalized = stripped.startsWith('/') ? stripped : `/${stripped}`;
    if (locale === defaultLocale) return normalized;
    if (normalized === '/') return '/zh';
    return `/zh${normalized}`;
}
function localePrefix2(tag) {
    return tag.split('-')[0]?.toLowerCase() ?? '';
}
function getLocaleFromHeaders(cookie, acceptLanguage) {
    if (cookie && isSupportedLocale(cookie.trim())) {
        return cookie.trim();
    }
    if (acceptLanguage) {
        const tags = acceptLanguage.split(',').map((t)=>t.split(';')[0]?.trim() ?? '');
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
        document.cookie = `${LOCALE_COOKIE}=en;path=/;max-age=${maxAge};SameSite=Lax`;
        return;
    }
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${maxAge};SameSite=Lax`;
}
}),
"[project]/apps/web/src/components/LocaleSwitcher.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocaleLink",
    ()=>LocaleLink,
    "LocaleSwitcher",
    ()=>LocaleSwitcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/config/locales.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function LocaleSwitcher({ locale, variant = 'navbar' }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])() || '/';
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onDoc = (e)=>{
            if (!rootRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return ()=>document.removeEventListener('mousedown', onDoc);
    }, []);
    const switchTo = (next)=>{
        if (next === locale) {
            setOpen(false);
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setLocaleCookie"])(next);
        const stripped = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stripLocalePrefix"])(pathname);
        const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["withLocalePath"])(stripped, next);
        const qs = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : '';
        window.location.assign(`${target}${qs}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: rootRef,
        className: "relative inline-block text-left",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                "aria-haspopup": "menu",
                "aria-expanded": open,
                "aria-label": "Language",
                onClick: ()=>setOpen((v)=>!v),
                className: variant === 'navbar' ? 'inline-flex min-h-9 w-[6.5rem] items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[#2c3328] hover:bg-[#dfe8d8]/80 sm:w-[7rem]' : 'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#5c6b52] hover:bg-[#dfe8d8]/60',
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "text-sm",
                        children: "🌐"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "min-w-0 flex-1 truncate text-left",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localeNavbarLabels"][locale]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                role: "menu",
                className: "absolute right-0 z-50 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] py-1 shadow-md",
                children: [
                    'en',
                    'zh'
                ].map((loc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        role: "none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "menuitem",
                            className: "flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-sm text-[#2c3328] hover:bg-[#dfe8d8]",
                            onClick: ()=>switchTo(loc),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localeLabels"][loc]
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
                                    lineNumber: 84,
                                    columnNumber: 17
                                }, this),
                                loc === locale ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
function LocaleLink({ href, locale, className, children }) {
    const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["withLocalePath"])(href, locale), [
        href,
        locale
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        href: target,
        className: className,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/LocaleSwitcher.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/lib/ads.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdsenseAds",
    ()=>AdsenseAds,
    "MockAds",
    ()=>MockAds,
    "PortalAds",
    ()=>PortalAds,
    "getAds",
    ()=>getAds
]);
function failEnv() {
    return typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FAIL_ADS === '1';
}
function delay(ms) {
    return new Promise((r)=>setTimeout(r, ms));
}
class MockAds {
    async showInterstitial() {
        if (failEnv()) return {
            ok: false,
            reason: 'failed'
        };
        await delay(200);
        return {
            ok: true
        };
    }
    async showRewarded(placement) {
        void placement;
        if (failEnv()) return {
            ok: false,
            reason: 'failed'
        };
        await delay(300);
        return {
            ok: true
        };
    }
}
class PortalAds {
    async showInterstitial() {
        // TODO: call portal SDK interstitial
        return new MockAds().showInterstitial();
    }
    async showRewarded(placement) {
        void placement;
        // TODO: call portal SDK rewarded
        return new MockAds().showRewarded(placement);
    }
}
class AdsenseAds {
    async showInterstitial() {
        // TODO: integrate real web interstitial when account ready
        return {
            ok: false,
            reason: 'unavailable'
        };
    }
    async showRewarded(placement) {
        void placement;
        return {
            ok: false,
            reason: 'unavailable'
        };
    }
}
let adsSingleton = null;
function getAds() {
    if (adsSingleton) return adsSingleton;
    const provider = ("TURBOPACK compile-time value", "mock") ?? 'mock';
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else adsSingleton = new MockAds();
    return adsSingleton;
}
}),
"[project]/apps/web/src/lib/play-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FEEDBACK_MS",
    ()=>FEEDBACK_MS,
    "THINK_MS",
    ()=>THINK_MS,
    "usePlayStore",
    ()=>usePlayStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$17_react$40$19$2e$2$2e$7$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.17_react@19.2.7/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/index.ts [app-ssr] (ecmascript) <locals>");
;
;
const FEEDBACK_MS = 200;
const THINK_MS = 600;
const EMPTY_HIGHLIGHTS = {
    steps: [],
    jumps: [],
    throughs: []
};
function highlightsFor(state, wolfId) {
    if (!wolfId || state.toMove !== 'wolf' || state.status !== 'playing') {
        return EMPTY_HIGHLIGHTS;
    }
    const legal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(state).filter((a)=>a.pieceId === wolfId);
    return {
        steps: legal.filter((a)=>a.type === 'step').map((a)=>a.to),
        jumps: legal.filter((a)=>a.type === 'jump').map((a)=>a.to),
        throughs: legal.filter((a)=>a.type === 'jump').map((a)=>a.through)
    };
}
function findAction(state, wolfId, pos) {
    const legal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLegalActions"])(state).filter((a)=>a.pieceId === wolfId);
    for (const a of legal){
        if (a.type === 'jump') {
            if (a.to.r === pos.r && a.to.c === pos.c) return a;
            if (a.through.r === pos.r && a.through.c === pos.c) return a;
        }
    }
    for (const a of legal){
        if (a.type === 'step' && a.to.r === pos.r && a.to.c === pos.c) return a;
    }
    return null;
}
function delay(ms) {
    return new Promise((resolve)=>{
        setTimeout(resolve, ms);
    });
}
function juiceFromAction(state, action) {
    const piece = state.pieces.find((p)=>p.id === action.pieceId);
    if (!piece) return null;
    if (action.type === 'jump') {
        return {
            kind: 'jump',
            from: {
                r: piece.r,
                c: piece.c
            },
            through: action.through,
            to: action.to
        };
    }
    return {
        kind: 'step',
        from: {
            r: piece.r,
            c: piece.c
        },
        to: action.to
    };
}
let levelMeta = {
    levelId: 'spring-01',
    rocks: [],
    difficulty: 'easy',
    targetEaten: undefined,
    maxPlies: undefined,
    opening: undefined
};
let turnSeq = 0;
const usePlayStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$17_react$40$19$2e$2$2e$7$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        state: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createInitialState"])('spring-01'),
        selectedWolfId: null,
        highlights: EMPTY_HIGHLIGHTS,
        uiPhase: 'playing',
        juice: null,
        difficulty: 'easy',
        seed: 1,
        init (levelId, rocks, difficulty, targetEaten, maxPlies, opening) {
            levelMeta = {
                levelId,
                rocks,
                difficulty,
                targetEaten,
                maxPlies,
                opening
            };
            turnSeq += 1;
            const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createInitialState"])(levelId, rocks, targetEaten, maxPlies, opening);
            set({
                state,
                selectedWolfId: null,
                highlights: EMPTY_HIGHLIGHTS,
                uiPhase: state.status === 'playing' ? 'playing' : 'terminal',
                juice: null,
                difficulty,
                seed: Date.now() % 1_000_000
            });
        },
        selectWolf (wolfId) {
            const { state, uiPhase } = get();
            if (uiPhase !== 'playing' || state.toMove !== 'wolf') return;
            if (state.chain && wolfId && wolfId !== state.chain.wolfId) return;
            set({
                selectedWolfId: wolfId,
                highlights: highlightsFor(state, wolfId)
            });
        },
        clickCell (pos) {
            const { state, selectedWolfId, uiPhase } = get();
            if (uiPhase !== 'playing' || state.toMove !== 'wolf' || !selectedWolfId) return;
            const action = findAction(state, selectedWolfId, pos);
            if (!action) {
                const piece = state.pieces.find((p)=>p.r === pos.r && p.c === pos.c && p.side === 'wolf');
                if (piece && !state.chain) {
                    get().selectWolf(piece.id);
                }
                return;
            }
            const juice = juiceFromAction(state, action);
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
            if (!result.ok) return;
            const next = result.state;
            const seq = ++turnSeq;
            void (async ()=>{
                set({
                    state: next,
                    selectedWolfId: next.chain ? next.chain.wolfId : null,
                    highlights: EMPTY_HIGHLIGHTS,
                    uiPhase: 'animating',
                    juice
                });
                await delay(FEEDBACK_MS);
                if (seq !== turnSeq) return;
                if (next.status !== 'playing') {
                    set({
                        selectedWolfId: null,
                        highlights: EMPTY_HIGHLIGHTS,
                        uiPhase: 'terminal',
                        juice: null
                    });
                    return;
                }
                if (next.toMove === 'sheep') {
                    set({
                        selectedWolfId: null,
                        highlights: EMPTY_HIGHLIGHTS,
                        uiPhase: 'aiThinking',
                        juice: null
                    });
                    await delay(THINK_MS);
                    if (seq !== turnSeq) return;
                    await runAiTurn(get, set, seq);
                    return;
                }
                const selected = next.chain ? next.chain.wolfId : null;
                set({
                    selectedWolfId: selected,
                    highlights: highlightsFor(next, selected),
                    uiPhase: 'playing',
                    juice: null
                });
            })();
        },
        endChain () {
            const { state, uiPhase } = get();
            if (uiPhase !== 'playing' || state.toMove !== 'wolf') return;
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["endWolfTurn"])(state);
            if (!result.ok) return;
            const next = result.state;
            const seq = ++turnSeq;
            void (async ()=>{
                if (next.status !== 'playing') {
                    set({
                        state: next,
                        selectedWolfId: null,
                        highlights: EMPTY_HIGHLIGHTS,
                        uiPhase: 'terminal',
                        juice: null
                    });
                    return;
                }
                set({
                    state: next,
                    selectedWolfId: null,
                    highlights: EMPTY_HIGHLIGHTS,
                    uiPhase: 'aiThinking',
                    juice: null
                });
                await delay(THINK_MS);
                if (seq !== turnSeq) return;
                await runAiTurn(get, set, seq);
            })();
        },
        reset () {
            turnSeq += 1;
            get().init(levelMeta.levelId, levelMeta.rocks, levelMeta.difficulty, levelMeta.targetEaten, levelMeta.maxPlies, levelMeta.opening);
        }
    }));
async function runAiTurn(get, set, seq) {
    const { state, difficulty, seed } = get();
    if (seq !== turnSeq) return;
    if (state.status !== 'playing' || state.toMove !== 'sheep') {
        set({
            uiPhase: state.status === 'playing' ? 'playing' : 'terminal',
            juice: null
        });
        return;
    }
    try {
        const action = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["pickSheepAction"])(state, {
            difficulty,
            rng: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(seed + state.eatenSheep * 17 + state.pieces.length)
        });
        const juice = juiceFromAction(state, action);
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAction"])(state, action);
        if (!result.ok) {
            set({
                uiPhase: 'playing',
                juice: null
            });
            return;
        }
        const next = result.state;
        set({
            state: next,
            selectedWolfId: null,
            highlights: EMPTY_HIGHLIGHTS,
            uiPhase: 'animating',
            juice,
            seed: seed + 1
        });
        await delay(FEEDBACK_MS);
        if (seq !== turnSeq) return;
        set({
            uiPhase: next.status === 'playing' ? 'playing' : 'terminal',
            juice: null
        });
    } catch  {
        if (seq === turnSeq) set({
            uiPhase: 'playing',
            juice: null
        });
    }
}
}),
"[project]/apps/web/src/lib/storage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "browserStorage",
    ()=>browserStorage,
    "loadSave",
    ()=>loadSave,
    "persistSave",
    ()=>persistSave
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/save.ts [app-ssr] (ecmascript)");
;
const browserStorage = {
    getItem (key) {
        if ("TURBOPACK compile-time truthy", 1) return null;
        //TURBOPACK unreachable
        ;
    },
    setItem (key, value) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    },
    removeItem (key) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
};
function loadSave(storage = browserStorage) {
    try {
        const raw = storage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAVE_KEY"]);
        if (!raw) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultSave"])();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["migrate"])(JSON.parse(raw));
    } catch (e) {
        console.warn('save load failed, using default', e);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultSave"])();
    }
}
function persistSave(save, storage = browserStorage) {
    try {
        storage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAVE_KEY"], JSON.stringify(save));
    } catch (e) {
        console.warn('save persist failed', e);
    }
}
}),
"[project]/apps/web/src/lib/save-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSaveStore",
    ()=>useSaveStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$17_react$40$19$2e$2$2e$7$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.17_react@19.2.7/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/save.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/storage.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const useSaveStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$17_react$40$19$2e$2$2e$7$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        save: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultSave"])(),
        hydrated: false,
        lastGrant: null,
        hydrate () {
            set({
                save: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadSave"])(),
                hydrated: true
            });
        },
        replace (save) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persistSave"])(save);
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
}),
"[project]/apps/web/src/lib/sfx.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Prefer short sample buffers; fall back to richer procedural tones. */ __turbopack_context__.s([
    "playSfx",
    ()=>playSfx
]);
let ctx = null;
const bufferCache = new Map();
function getCtx() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
async function loadBuffer(kind) {
    const audio = getCtx();
    if (!audio) return null;
    if (bufferCache.has(kind)) return bufferCache.get(kind);
    const map = {
        step: '/sfx/step.wav',
        jump: '/sfx/capture.wav',
        chain: '/sfx/chain.wav',
        win: '/sfx/win.wav',
        lose: '/sfx/lose.wav',
        select: null,
        invalid: null,
        ai: null
    };
    const source = map[kind];
    if (!source) return null;
    try {
        const res = await fetch(source);
        if (!res.ok) return null;
        const arr = await res.arrayBuffer();
        const buf = await audio.decodeAudioData(arr.slice(0));
        bufferCache.set(kind, buf);
        return buf;
    } catch  {
        return null;
    }
}
function beep(frequency, durationMs, type = 'sine', gain = 0.08, when = 0) {
    const audio = getCtx();
    if (!audio) return;
    void audio.resume();
    const t0 = audio.currentTime + when;
    const osc = audio.createOscillator();
    const g = audio.createGain();
    const filter = audio.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;
    osc.type = type;
    osc.frequency.value = frequency;
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + durationMs / 1000);
    osc.connect(filter);
    filter.connect(g);
    g.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + durationMs / 1000 + 0.02);
}
function playFallback(kind) {
    switch(kind){
        case 'step':
            beep(380, 55, 'triangle', 0.05);
            beep(220, 40, 'sine', 0.03, 0.02);
            break;
        case 'jump':
            beep(480, 70, 'square', 0.04);
            beep(720, 110, 'sine', 0.06, 0.04);
            break;
        case 'chain':
            beep(560, 50, 'square', 0.04);
            beep(700, 60, 'sine', 0.05, 0.04);
            beep(880, 90, 'sine', 0.05, 0.09);
            break;
        case 'win':
            beep(523, 100, 'sine', 0.06);
            beep(659, 120, 'sine', 0.06, 0.1);
            beep(784, 160, 'sine', 0.07, 0.22);
            break;
        case 'lose':
            beep(280, 140, 'triangle', 0.05);
            beep(200, 200, 'triangle', 0.045, 0.12);
            break;
        case 'select':
            beep(460, 45, 'sine', 0.035);
            break;
        case 'invalid':
            beep(170, 65, 'triangle', 0.025);
            break;
        case 'ai':
            beep(190, 90, 'sine', 0.018);
            beep(260, 120, 'sine', 0.014, 0.08);
            break;
    }
}
function playBuffer(buf) {
    const audio = getCtx();
    if (!audio) return;
    void audio.resume();
    const src = audio.createBufferSource();
    const g = audio.createGain();
    g.gain.value = 0.7;
    src.buffer = buf;
    src.connect(g);
    g.connect(audio.destination);
    src.start();
}
function playSfx(kind) {
    void (async ()=>{
        const buf = await loadBuffer(kind);
        if (buf) playBuffer(buf);
        else playFallback(kind);
    })();
}
}),
"[project]/apps/web/src/i18n/messages.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    return messages[locale] ?? en;
}
function fmt(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key)=>String(vars[key] ?? ''));
}
}),
"[project]/apps/web/src/i18n/use-client-locale.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useClientLocale",
    ()=>useClientLocale,
    "useClientMessages",
    ()=>useClientMessages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/i18n/messages.ts [app-ssr] (ecmascript)");
'use client';
;
;
function useClientLocale() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])() || '/';
    return pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en';
}
function useClientMessages() {
    const locale = useClientLocale();
    return {
        locale,
        t: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(locale)
    };
}
}),
"[project]/apps/web/src/components/PlayScreen.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlayScreen",
    ()=>PlayScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/save.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/ai/rng.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$skins$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/skins.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$BoardSvg$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/BoardSvg.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/LocaleSwitcher.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$ads$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/ads.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/play-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/save-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$sfx$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/sfx.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/i18n/messages.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$use$2d$client$2d$locale$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/i18n/use-client-locale.ts [app-ssr] (ecmascript)");
'use client';
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
function PlayScreen({ level, adminMode = false, onAdminAttempt, onAdminTerminal, localeOverride }) {
    const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.state);
    const selectedWolfId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.selectedWolfId);
    const highlights = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.highlights);
    const uiPhase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.uiPhase);
    const juice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.juice);
    const init = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.init);
    const selectWolf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.selectWolf);
    const clickCell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.clickCell);
    const endChain = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.endChain);
    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$play$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlayStore"])((s)=>s.reset);
    const save = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"])((s)=>s.save);
    const replace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"])((s)=>s.replace);
    const hydrate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"])((s)=>s.hydrate);
    const lastGrant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"])((s)=>s.lastGrant);
    const setLastGrant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"])((s)=>s.setLastGrant);
    const rewardedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const playCountedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [adBusy, setAdBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [adError, setAdError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [guideOpen, setGuideOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [guideStep, setGuideStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [resetArmed, setResetArmed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const resetArmTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const prevEaten = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const terminalSfxDone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const terminalReportedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [adminMuted, setAdminMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const muted = adminMode ? adminMuted : save.settings?.muted ?? false;
    const clientMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$use$2d$client$2d$locale$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useClientMessages"])();
    const locale = localeOverride ?? clientMessages.locale;
    const t = localeOverride ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(localeOverride) : clientMessages.t;
    const p = t.play;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        hydrate();
    }, [
        hydrate
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (muted || !juice) return;
        if (juice.kind === 'jump') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$sfx$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSfx"])(state.chain && state.chain.count >= 2 ? 'chain' : 'jump');
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$sfx$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSfx"])('step');
        }
    }, [
        juice,
        muted,
        state.chain
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!muted && uiPhase === 'aiThinking') (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$sfx$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSfx"])('ai');
    }, [
        muted,
        uiPhase
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (uiPhase !== 'terminal' || muted || terminalSfxDone.current) return;
        terminalSfxDone.current = true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$sfx$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSfx"])(state.status === 'won' ? 'win' : 'lose');
    }, [
        uiPhase,
        state.status,
        muted
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        rewardedRef.current = false;
        playCountedRef.current = false;
        terminalReportedRef.current = false;
        terminalSfxDone.current = false;
        setLastGrant(null);
        init(level.id, level.rocks, level.ai, level.targetEaten, level.maxPlies, level.opening);
    }, [
        level.id,
        level.ai,
        level.rocks,
        level.targetEaten,
        level.maxPlies,
        level.opening,
        init,
        setLastGrant
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (adminMode) {
            onAdminAttempt?.();
            return;
        }
        if (playCountedRef.current) return;
        playCountedRef.current = true;
        const current = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"].getState().save;
        replace((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordPlayStarted"])(current, level.id));
    }, [
        adminMode,
        level.id,
        onAdminAttempt,
        replace
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (resetArmTimer.current) clearTimeout(resetArmTimer.current);
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (adminMode || level.id !== 'spring-01') return;
        if (save.guide.spring1Done) return;
        setGuideOpen(true);
        setGuideStep(0);
    }, [
        adminMode,
        level.id,
        save.guide.spring1Done
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!guideOpen || save.guide.spring1Done) return;
        if (state.eatenSheep > prevEaten.current) {
            finishGuide();
        }
        prevEaten.current = state.eatenSheep;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        state.eatenSheep,
        guideOpen,
        save.guide.spring1Done
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!guideOpen) return;
        function onKeyDown(event) {
            if (event.key === 'Escape') finishGuide();
        }
        window.addEventListener('keydown', onKeyDown);
        return ()=>window.removeEventListener('keydown', onKeyDown);
    // finishGuide is stable for this mounted screen; the listener only tracks the modal state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        guideOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (adminMode) return;
        if (uiPhase !== 'terminal' || rewardedRef.current) return;
        rewardedRef.current = true;
        if (state.status === 'won') {
            const current = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"].getState().save;
            const grant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rollClearReward"])(level, current, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$ai$2f$rng$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSeededRng"])(Date.now()));
            const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyClearToSave"])(current, level, grant);
            replace(next);
            setLastGrant(grant);
        }
    }, [
        adminMode,
        uiPhase,
        state.status,
        level,
        replace,
        setLastGrant
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!adminMode || uiPhase !== 'terminal' || terminalReportedRef.current) return;
        terminalReportedRef.current = true;
        onAdminTerminal?.(state);
    }, [
        adminMode,
        onAdminTerminal,
        state,
        uiPhase
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDoubleDropActive"])(save)) return;
        const id = setInterval(()=>setTick((n)=>n + 1), 1000);
        return ()=>clearInterval(id);
    }, [
        save
    ]);
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const { wolfSet, board } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$skins$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveSkin"])(save);
        const rockWarm = board.id === 'board-autumn' ? 0.55 : board.id === 'board-winter' ? -0.45 : board.id === 'board-summer' ? 0.25 : 0;
        return {
            boardFill: board.boardFill,
            lineStroke: board.lineStroke,
            wolfFill: wolfSet.wolfFill,
            sheepFill: wolfSet.sheepFill,
            wolfSrc: wolfSet.assets.wolf,
            sheepSrc: wolfSet.assets.sheep,
            boardBgSrc: board.assets.boardBg,
            rockWarm
        };
    }, [
        save
    ]);
    const sheepLeft = state.pieces.filter((piece)=>piece.side === 'sheep').length;
    const interactive = uiPhase === 'playing' && state.toMove === 'wolf';
    const backHref = adminMode ? '/admin/levels' : `/levels/${level.chapterId}`;
    const doubleLeft = doubleDropLabel(save.buffs.doubleDropUntil);
    const thinking = uiPhase === 'aiThinking';
    const chainFlash = Boolean(state.chain && uiPhase === 'playing');
    const title = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["levelDisplayName"])(level, locale);
    function finishGuide() {
        setGuideOpen(false);
        if (adminMode) return;
        const current = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"].getState().save;
        if (!current.guide.spring1Done) {
            replace({
                ...current,
                guide: {
                    ...current.guide,
                    spring1Done: true
                }
            });
        }
    }
    async function watchDouble() {
        setAdError(false);
        setAdBusy(true);
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$ads$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAds"])().showRewarded('double_drop');
        setAdBusy(false);
        if (!res.ok) {
            setAdError(true);
            return;
        }
        replace((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activateDoubleDrop"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"].getState().save));
    }
    function confirmReset() {
        if (!resetArmed) {
            setResetArmed(true);
            if (resetArmTimer.current) clearTimeout(resetArmTimer.current);
            resetArmTimer.current = setTimeout(()=>setResetArmed(false), 2000);
            return;
        }
        if (resetArmTimer.current) clearTimeout(resetArmTimer.current);
        setResetArmed(false);
        rewardedRef.current = false;
        playCountedRef.current = false;
        terminalReportedRef.current = false;
        setLastGrant(null);
        reset();
        if (adminMode) onAdminAttempt?.();
        else replace((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordPlayStarted"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"].getState().save, level.id));
        playCountedRef.current = true;
    }
    function toggleMute() {
        if (adminMode) {
            setAdminMuted((value)=>!value);
            return;
        }
        const current = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"].getState().save;
        replace({
            ...current,
            settings: {
                ...current.settings,
                muted: !(current.settings?.muted ?? false)
            }
        });
    }
    function handleSelectWolf(wolfId) {
        if (interactive && wolfId !== selectedWolfId) (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$sfx$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSfx"])('select');
        selectWolf(wolfId);
    }
    function handleClickCell(pos) {
        if (!interactive) return;
        if (!selectedWolfId) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$sfx$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["playSfx"])('invalid');
            return;
        }
        clickCell(pos);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto flex min-h-dvh max-w-lg flex-col gap-3 px-4 pb-4 pt-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LocaleLink"], {
                        href: backHref,
                        locale: locale,
                        className: "text-sm text-[var(--muted)] underline-offset-2 hover:underline",
                        children: [
                            "← ",
                            p.back
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "font-serif text-lg tracking-wide text-[var(--ink)]",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 273,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-10"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 274,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                lineNumber: 265,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `game-panel flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm tabular-nums ${chainFlash ? 'bg-[#e8c4b8] font-semibold text-[#8b2e22] ring-2 ring-[var(--danger)]/40' : 'text-[var(--ink)]'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "game-stat",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmt"])(p.eaten, {
                                n: state.eatenSheep
                            })
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                            lineNumber: 284,
                            columnNumber: 37
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 284,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "game-stat",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmt"])(p.sheepLeft, {
                                n: sheepLeft
                            })
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                            lineNumber: 285,
                            columnNumber: 37
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `inline-flex items-center gap-1.5 ${thinking ? 'font-medium text-[var(--muted)]' : ''}`,
                        "aria-live": "polite",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `inline-block h-2 w-2 rounded-full ${thinking || state.toMove === 'sheep' ? 'bg-[var(--muted)]' : 'bg-[var(--accent)]'}`
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                                lineNumber: 290,
                                columnNumber: 11
                            }, this),
                            turnLabel(uiPhase, state, p)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 286,
                        columnNumber: 9
                    }, this),
                    !adminMode && doubleLeft && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-full text-xs text-[var(--muted)]",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmt"])(p.doubleLeft, {
                            t: doubleLeft
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 298,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                lineNumber: 277,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex flex-1 flex-col items-center justify-center py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$BoardSvg$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoardSvg"], {
                        state: state,
                        selectedWolfId: selectedWolfId,
                        stepHighlights: highlights.steps,
                        jumpHighlights: highlights.jumps,
                        jumpThroughs: highlights.throughs,
                        juice: juice,
                        interactive: interactive,
                        onSelectWolf: handleSelectWolf,
                        onClickCell: handleClickCell,
                        theme: theme
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 303,
                        columnNumber: 9
                    }, this),
                    thinking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 z-10 cursor-default rounded-xl bg-black/[0.03]",
                        "aria-hidden": true
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 316,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this),
            state.chain && uiPhase === 'playing' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: endChain,
                className: "rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-[#f4f1ea] active:scale-[0.97]",
                children: p.endChain
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                lineNumber: 321,
                columnNumber: 9
            }, this),
            uiPhase === 'terminal' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-panel victory-pop p-5 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: state.status === 'won' ? p.win : state.status === 'draw' ? p.draw : p.lose
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 332,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-serif text-2xl text-[var(--ink)]",
                        children: state.status === 'won' ? p.win : state.status === 'draw' ? p.draw : p.lose
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 333,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm text-[var(--muted)]",
                        children: state.status === 'won' ? p.winSub : state.status === 'draw' ? p.drawSub : p.loseSub
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 336,
                        columnNumber: 11
                    }, this),
                    adBusy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-[#7a8574]",
                        children: p.preparing
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 339,
                        columnNumber: 22
                    }, this),
                    adError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "status",
                        className: "mt-1 text-xs text-[#8b2e22]",
                        children: p.adFailed
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 340,
                        columnNumber: 23
                    }, this),
                    !adminMode && state.status === 'won' && lastGrant && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GrantLine, {
                        grant: lastGrant,
                        labels: p,
                        locale: locale
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 342,
                        columnNumber: 13
                    }, this),
                    !adminMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-xs text-[#7a8574]",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmt"])(p.universal, {
                            n: save.fragments.universal
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 344,
                        columnNumber: 26
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex flex-col items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: adBusy,
                                onClick: ()=>{
                                    rewardedRef.current = false;
                                    playCountedRef.current = false;
                                    terminalReportedRef.current = false;
                                    setLastGrant(null);
                                    reset();
                                    if (adminMode) onAdminAttempt?.();
                                    else replace((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordPlayStarted"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$save$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSaveStore"].getState().save, level.id));
                                    playCountedRef.current = true;
                                },
                                className: "primary-action w-full max-w-xs disabled:opacity-50",
                                children: p.again
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                                lineNumber: 346,
                                columnNumber: 13
                            }, this),
                            !adminMode && state.status === 'won' && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$save$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDoubleDropActive"])(save) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: adBusy,
                                onClick: ()=>void watchDouble(),
                                className: "text-sm text-[var(--muted)] underline-offset-2 hover:underline disabled:opacity-50",
                                children: p.doubleAd
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                                lineNumber: 364,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LocaleLink"], {
                                href: backHref,
                                locale: locale,
                                className: "px-4 py-2 text-sm text-[var(--ink)] underline-offset-2 hover:underline",
                                children: p.levelList
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                                lineNumber: 373,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 345,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                lineNumber: 331,
                columnNumber: 9
            }, this),
            uiPhase !== 'terminal' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "status-chip justify-center text-center text-xs text-[var(--muted)]",
                "aria-live": "polite",
                children: p.tip
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                lineNumber: 385,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "mt-auto flex items-center justify-around rounded-2xl border border-[var(--line)] bg-[var(--paper)]/75 pt-1 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: confirmReset,
                        className: `min-h-11 min-w-[4.5rem] rounded-lg px-3 py-2 text-sm active:scale-[0.97] ${resetArmed ? 'bg-[#e8c4b8]/50 font-medium text-[#8b2e22]' : 'text-[var(--ink)]'}`,
                        children: resetArmed ? p.resetConfirm : p.reset
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 389,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: toggleMute,
                        className: "min-h-11 min-w-[4.5rem] rounded-lg px-3 py-2 text-sm text-[var(--ink)] active:scale-[0.97]",
                        "aria-pressed": muted,
                        children: muted ? p.unmute : p.mute
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 398,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$LocaleSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LocaleLink"], {
                        href: adminMode ? '/admin/levels' : '/',
                        locale: locale,
                        className: "inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-lg px-3 py-2 text-sm text-[var(--ink)]",
                        children: p.exit
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                        lineNumber: 406,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                lineNumber: 388,
                columnNumber: 7
            }, this),
            guideOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-end justify-center bg-[#2c3328]/45 p-4 sm:items-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": "guide-title",
                    className: "w-full max-w-sm rounded-xl bg-[var(--panel)] p-5 shadow-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "guide-title",
                            className: "font-serif text-lg text-[var(--ink)]",
                            children: p.guideTitle
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                            lineNumber: 418,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-sm leading-relaxed text-[var(--muted)]",
                            children: guideStep === 0 ? p.guideStep1 : p.guideStep2
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                            lineNumber: 419,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 flex justify-between gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "text-sm text-[#7a8574] underline-offset-2 hover:underline",
                                    onClick: finishGuide,
                                    children: p.guideSkip
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                                    lineNumber: 423,
                                    columnNumber: 15
                                }, this),
                                guideStep === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[#f4f1ea]",
                                    onClick: ()=>setGuideStep(1),
                                    children: p.guideNext
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                                    lineNumber: 431,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[#f4f1ea]",
                                    onClick: finishGuide,
                                    children: p.guideStart
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                                    lineNumber: 439,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                            lineNumber: 422,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                    lineNumber: 417,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
                lineNumber: 416,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
        lineNumber: 264,
        columnNumber: 5
    }, this);
}
function turnLabel(uiPhase, state, p) {
    if (uiPhase === 'aiThinking') return p.turnSheep;
    if (state.toMove === 'wolf') {
        return state.chain ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$i18n$2f$messages$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fmt"])(p.chain, {
            n: state.chain.count
        }) : p.turnWolf;
    }
    return p.turnSheep;
}
function GrantLine({ grant, labels, locale }) {
    const seasonName = {
        spring: {
            en: 'Spring',
            zh: '春'
        },
        summer: {
            en: 'Summer',
            zh: '夏'
        },
        autumn: {
            en: 'Autumn',
            zh: '秋'
        },
        winter: {
            en: 'Winter',
            zh: '冬'
        }
    };
    const seasonBits = Object.entries(grant.season).filter(([, v])=>(v ?? 0) > 0).map(([k, v])=>`${seasonName[k]?.[locale] ?? k}+${v}`).join(' ');
    if (grant.universal === 0 && !seasonBits) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "mt-2 text-sm text-[var(--muted)]",
            children: labels.noDrop
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
            lineNumber: 487,
            columnNumber: 12
        }, this);
    }
    const sep = locale === 'zh' ? '：' : ': ';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "mt-2 text-sm text-[var(--ink)]",
        children: [
            grant.firstClear ? labels.firstClear : labels.repeatClear,
            grant.doubled ? labels.doubled : '',
            sep,
            "+",
            grant.universal,
            seasonBits ? ` · ${seasonBits}` : ''
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/PlayScreen.tsx",
        lineNumber: 491,
        columnNumber: 5
    }, this);
}
function doubleDropLabel(until) {
    if (until == null || until <= Date.now()) return null;
    const sec = Math.ceil((until - Date.now()) / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}
}),
"[project]/apps/web/src/lib/admin-level-reviews.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_LEVEL_REVIEWS_KEY",
    ()=>ADMIN_LEVEL_REVIEWS_KEY,
    "levelVersion",
    ()=>levelVersion,
    "loadLevelReviews",
    ()=>loadLevelReviews,
    "parseLevelReviewsJson",
    ()=>parseLevelReviewsJson,
    "saveLevelReviews",
    ()=>saveLevelReviews
]);
const ADMIN_LEVEL_REVIEWS_KEY = 'wolf-sheep:admin-level-reviews:v1';
function loadLevelReviews() {
    if ("TURBOPACK compile-time truthy", 1) return {};
    //TURBOPACK unreachable
    ;
}
function saveLevelReviews(reviews) {
    window.localStorage.setItem(ADMIN_LEVEL_REVIEWS_KEY, JSON.stringify(reviews));
}
function parseLevelReviewsJson(text) {
    try {
        const parsed = JSON.parse(text);
        return isReviewMap(parsed) ? parsed : null;
    } catch  {
        return null;
    }
}
function levelVersion(level) {
    const source = JSON.stringify([
        level.id,
        level.rocks,
        level.opening,
        level.ai,
        level.targetEaten,
        level.maxPlies
    ]);
    let hash = 2166136261;
    for(let index = 0; index < source.length; index += 1){
        hash ^= source.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}
function isReviewMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    return Object.entries(value).every(([levelId, review])=>{
        if (!review || typeof review !== 'object' || Array.isArray(review)) return false;
        const item = review;
        return item.levelId === levelId && [
            'unreviewed',
            'passed',
            'needs_changes'
        ].includes(item.status ?? '') && typeof item.attempts === 'number' && typeof item.notes === 'string' && typeof item.reviewedAt === 'string';
    });
}
}),
"[project]/apps/web/src/components/admin/AdminPlayScreen.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminPlayScreen",
    ()=>AdminPlayScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/game-core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/content/levels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/src/rules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$PlayScreen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/PlayScreen.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$admin$2d$level$2d$reviews$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/admin-level-reviews.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function AdminPlayScreen({ level }) {
    const version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$admin$2d$level$2d$reviews$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["levelVersion"])(level), [
        level
    ]);
    const [reviews, setReviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [reviewsLoaded, setReviewsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [importText, setImportText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [importError, setImportError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const current = reviews[level.id] ?? emptyReview(level.id, version);
    const stale = current.levelVersion !== version;
    const { prev, next } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$content$2f$levels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adjacentLevels"])(level.id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setReviews((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$admin$2d$level$2d$reviews$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadLevelReviews"])());
        setReviewsLoaded(true);
    }, []);
    const updateReview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((patch)=>{
        setReviews((existing)=>{
            const base = existing[level.id] ?? emptyReview(level.id, version);
            const updated = {
                ...base,
                ...patch,
                levelId: level.id,
                levelVersion: version,
                reviewedAt: new Date().toISOString()
            };
            const nextReviews = {
                ...existing,
                [level.id]: updated
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$admin$2d$level$2d$reviews$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveLevelReviews"])(nextReviews);
            return nextReviews;
        });
    }, [
        level.id,
        version
    ]);
    const recordAttempt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setReviews((existing)=>{
            const base = existing[level.id] ?? emptyReview(level.id, version);
            const updated = {
                ...base,
                levelVersion: version,
                attempts: base.attempts + 1,
                reviewedAt: new Date().toISOString()
            };
            const nextReviews = {
                ...existing,
                [level.id]: updated
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$admin$2d$level$2d$reviews$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveLevelReviews"])(nextReviews);
            return nextReviews;
        });
    }, [
        level.id,
        version
    ]);
    const recordTerminal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((state)=>{
        updateReview({
            result: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
            terminalReason: terminalReason(state),
            plies: state.plyCount,
            eatenSheep: state.eatenSheep
        });
    }, [
        updateReview
    ]);
    function importReviews() {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$admin$2d$level$2d$reviews$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseLevelReviewsJson"])(importText);
        if (!parsed) {
            setImportError(true);
            return;
        }
        setImportError(false);
        setReviews(parsed);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$admin$2d$level$2d$reviews$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveLevelReviews"])(parsed);
    }
    function exportReviews() {
        const blob = new Blob([
            JSON.stringify(reviews, null, 2)
        ], {
            type: 'application/json'
        });
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.download = `fangrush-level-reviews-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(href);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "mx-auto max-w-[1180px] pb-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex flex-wrap items-center gap-3 border-b border-[#5c6b52]/20 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/admin/levels",
                        className: "text-sm text-[#3d4a3a] underline",
                        children: "返回关卡台"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-serif text-xl text-[#2c3328]",
                                children: [
                                    "Admin 试玩 · ",
                                    level.nameZh
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-[#7a8574]",
                                children: [
                                    level.id,
                                    " · 配置 ",
                                    version,
                                    " · 不写玩家奖励与进度"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "flex gap-2 text-sm",
                        children: [
                            prev && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: `/admin/play/${prev.id}`,
                                className: "border border-[#5c6b52]/25 px-3 py-2",
                                children: "上一关"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                lineNumber: 97,
                                columnNumber: 20
                            }, this),
                            next && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: `/admin/play/${next.id}`,
                                className: "border border-[#5c6b52]/25 px-3 py-2",
                                children: "下一关"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                lineNumber: 98,
                                columnNumber: 20
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,560px)_1fr]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "border border-[#5c6b52]/20 bg-[#f7f5ef]",
                        children: reviewsLoaded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$PlayScreen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlayScreen"], {
                            level: level,
                            adminMode: true,
                            localeOverride: "zh",
                            onAdminAttempt: recordAttempt,
                            onAdminTerminal: recordTerminal
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                            lineNumber: 105,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "p-6 text-sm text-[#5c6b52]",
                            children: "正在载入试玩记录..."
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                            lineNumber: 107,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-medium text-[#2c3328]",
                                        children: "本关试玩反馈"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 112,
                                        columnNumber: 13
                                    }, this),
                                    stale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-2 bg-amber-100 p-2 text-xs text-amber-900",
                                        children: "关卡配置已变化，旧反馈需要重新确认。"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 113,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                        className: "mt-3 grid grid-cols-2 gap-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        className: "text-[#7a8574]",
                                                        children: "尝试次数"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 115,
                                                        columnNumber: 20
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        children: current.attempts
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 115,
                                                        columnNumber: 60
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 115,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        className: "text-[#7a8574]",
                                                        children: "最近结果"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 116,
                                                        columnNumber: 20
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        children: resultLabel(current)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 116,
                                                        columnNumber: 60
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 116,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        className: "text-[#7a8574]",
                                                        children: "最近 plies"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 20
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        children: current.plies ?? '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 64
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 117,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        className: "text-[#7a8574]",
                                                        children: "最近吃子"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 118,
                                                        columnNumber: 20
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        children: current.eatenSheep ?? '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 118,
                                                        columnNumber: 60
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 118,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 114,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "mt-4 grid gap-1 text-xs text-[#5c6b52]",
                                        children: [
                                            "结论",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: current.status,
                                                onChange: (event)=>updateReview({
                                                        status: event.target.value
                                                    }),
                                                className: "h-10 border border-[#5c6b52]/25 bg-white px-3 text-sm text-[#2c3328]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "unreviewed",
                                                        children: "未确认"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "passed",
                                                        children: "试玩通过"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 56
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "needs_changes",
                                                        children: "待修订"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 92
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 121,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 120,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "mt-3 grid gap-1 text-xs text-[#5c6b52]",
                                        children: [
                                            "主观难度",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: current.difficultyRating ?? '',
                                                onChange: (event)=>updateReview({
                                                        difficultyRating: event.target.value ? Number(event.target.value) : undefined
                                                    }),
                                                className: "h-10 border border-[#5c6b52]/25 bg-white px-3 text-sm text-[#2c3328]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: "未评分"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                        lineNumber: 127,
                                                        columnNumber: 17
                                                    }, this),
                                                    [
                                                        1,
                                                        2,
                                                        3,
                                                        4,
                                                        5
                                                    ].map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: value,
                                                            children: [
                                                                value,
                                                                "/5"
                                                            ]
                                                        }, value, true, {
                                                            fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                            lineNumber: 127,
                                                            columnNumber: 78
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 126,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 125,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "mt-3 grid gap-1 text-xs text-[#5c6b52]",
                                        children: [
                                            "备注",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                value: current.notes,
                                                onChange: (event)=>updateReview({
                                                        notes: event.target.value
                                                    }),
                                                rows: 5,
                                                placeholder: "记录策略是否看懂、卡住的位置和建议修改。",
                                                className: "border border-[#5c6b52]/25 bg-white p-3 text-sm text-[#2c3328]"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 131,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 130,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "font-medium text-[#2c3328]",
                                                children: "反馈导入导出"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 136,
                                                columnNumber: 70
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: exportReviews,
                                                className: "border border-[#3d4a3a] px-3 py-2 text-[#3d4a3a]",
                                                children: "导出 JSON"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                                lineNumber: 136,
                                                columnNumber: 124
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: importText,
                                        onChange: (event)=>setImportText(event.target.value),
                                        rows: 4,
                                        placeholder: "粘贴完整反馈 JSON；验证失败不会覆盖现有记录。",
                                        className: "mt-3 w-full border border-[#5c6b52]/25 bg-white p-3 font-mono text-xs"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 137,
                                        columnNumber: 13
                                    }, this),
                                    importError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-2 text-xs text-red-700",
                                        children: "JSON 格式或字段无效，现有记录未改变。"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 138,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: importReviews,
                                        className: "mt-2 bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea]",
                                        children: "导入并替换"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                        lineNumber: 139,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/admin/AdminPlayScreen.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
function emptyReview(levelId, version) {
    return {
        levelId,
        levelVersion: version,
        status: 'unreviewed',
        attempts: 0,
        notes: '',
        reviewedAt: new Date().toISOString()
    };
}
function terminalReason(state) {
    if (state.eatenSheep >= state.targetEaten) return 'targetEaten';
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listWolfActionsAsIfTurn"])(state).length === 0) return 'wolvesTrapped';
    if (state.plyCount >= state.maxPlies) return 'maxPlies';
    if ((state.repetitionCounts.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$src$2f$rules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["boardPositionKey"])(state)) ?? 0) >= 3) return 'repetition';
    return state.status;
}
function resultLabel(review) {
    if (!review.result) return '-';
    const winner = review.result === 'wolf' ? '狼胜' : review.result === 'sheep' ? '羊胜' : '和棋';
    return `${winner}${review.terminalReason ? ` · ${review.terminalReason}` : ''}`;
}
}),
];

//# sourceMappingURL=_f8118810._.js.map