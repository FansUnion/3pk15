(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__3342a1b4._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/apps/web/src/config/locales.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/apps/web/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.18_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/config/locales.ts [middleware-edge] (ecmascript)");
;
;
function handleAdmin(request) {
    const { pathname } = request.nextUrl;
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/zh/admin')) {
        return null;
    }
    // Normalize /zh/admin → /admin (admin is English-only, unprefixed)
    if (pathname.startsWith('/zh/admin')) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(/^\/zh/, '') || '/admin';
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
    }
    const shell = ("TURBOPACK compile-time value", "standalone") ?? 'standalone';
    const enabled = process.env.ADMIN_ENABLED === 'true';
    if (shell === 'portal' || !enabled) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(new URL('/not-found-admin', request.url));
    }
    const key = process.env.ADMIN_ACCESS_KEY;
    if (key && key.length > 0) {
        const unlocked = request.cookies.get('ws_admin_gate')?.value === '1';
        if (!unlocked && !pathname.startsWith('/admin/gate')) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/gate';
            url.searchParams.set('next', pathname);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
function middleware(request) {
    const admin = handleAdmin(request);
    if (admin) return admin;
    const { pathname } = request.nextUrl;
    // Skip Next internals already excluded by matcher; also skip llm/sitemap handled as routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.') // static files
    ) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    const cookie = request.cookies.get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LOCALE_COOKIE"])?.value;
    const preferred = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getLocaleFromHeaders"])(cookie, request.headers.get('accept-language'));
    const hasZhPrefix = pathname === '/zh' || pathname.startsWith('/zh/');
    const stripped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["stripLocalePrefix"])(pathname);
    if (hasZhPrefix) {
        if (preferred === 'en' && cookie === 'en') {
            const url = request.nextUrl.clone();
            url.pathname = stripped;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
        }
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-locale', 'zh');
        const url = request.nextUrl.clone();
        url.pathname = stripped;
        const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url, {
            request: {
                headers: requestHeaders
            }
        });
        if (cookie !== 'zh') {
            res.cookies.set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LOCALE_COOKIE"], 'zh', {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
                sameSite: 'lax'
            });
        }
        return res;
    }
    // English (unprefixed) path
    if (preferred === 'zh') {
        const url = request.nextUrl.clone();
        url.pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$locales$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["withLocalePath"])(pathname, 'zh');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', 'en');
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$18_react$2d$dom$40$19$2e$2$2e$7_react$40$19$2e$2$2e$7_$5f$react$40$19$2e$2$2e$7$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: requestHeaders
        }
    });
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__3342a1b4._.js.map