// src/lib/authCookies.ts
//
// Single source of truth for auth cookie attributes on the Next.js side.
// Used by: /api/auth/login, /api/auth/logout, /api/auth/refresh and middleware.
// Must stay edge-runtime safe (no Node-only APIs).

export const ACCESS_TOKEN_NAME = 'accessToken';
export const REFRESH_TOKEN_NAME = 'refreshToken';

export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes (seconds)
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (seconds)

const isProd = process.env.NODE_ENV === 'production';

// Shared parent domain so apex, www and api subdomains all see the same cookie.
// Undefined in development (host-only cookies on localhost).
export const COOKIE_DOMAIN: string | undefined = isProd
    ? process.env.COOKIE_DOMAIN || '.carehealth.online'
    : undefined;

/**
 * Options for SETTING an auth cookie via NextResponse.cookies.set().
 * SameSite=Lax is correct here: apex, www and api are all the same *site*.
 */
export function getAuthCookieOptions(name: string) {
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: name === ACCESS_TOKEN_NAME ? ACCESS_TOKEN_MAX_AGE : REFRESH_TOKEN_MAX_AGE,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    };
}

function buildExpiredCookie(name: string, domain?: string): string {
    return [
        `${name}=`,
        'Path=/',
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'Max-Age=0',
        'HttpOnly',
        'SameSite=Lax',
        ...(isProd ? ['Secure'] : []),
        ...(domain ? [`Domain=${domain}`] : []),
    ].join('; ');
}

/**
 * Expire ONLY the legacy host-only variant (no Domain attribute).
 * Call this after setting fresh domain-scoped cookies so a stale host-only
 * cookie with the same name can never shadow the new one.
 */
export function appendClearHostOnlyCookies(headers: Headers) {
    headers.append('set-cookie', buildExpiredCookie(ACCESS_TOKEN_NAME));
    headers.append('set-cookie', buildExpiredCookie(REFRESH_TOKEN_NAME));
}

/**
 * Expire BOTH variants of both auth cookies:
 *   1. host-only (no Domain)  -> cookies set by older code / current host
 *   2. Domain=<COOKIE_DOMAIN> -> cookies set by the backend / current code
 *
 * Raw Set-Cookie strings are used on purpose: NextResponse.cookies is keyed by
 * cookie name, so it cannot represent two cookies with the same name but a
 * different Domain, and it would also overwrite manually appended headers.
 */
export function appendClearAuthCookies(headers: Headers) {
    for (const name of [ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME]) {
        headers.append('set-cookie', buildExpiredCookie(name));
        if (COOKIE_DOMAIN) {
            headers.append('set-cookie', buildExpiredCookie(name, COOKIE_DOMAIN));
        }
    }
}