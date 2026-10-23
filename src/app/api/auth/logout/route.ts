// // import { NextRequest, NextResponse } from 'next/server';

// // export async function POST(req: NextRequest) {
// //     try {
// //         let isAdmin = false;
// //         try {
// //             const body = await req.json();
// //             isAdmin = !!body?.isAdmin; 
// //         } catch {
// //             // body might be empty, ignore 
// //         } 

// //         const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

// //         const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

// //         // Forward cookies to backend to clear backend-specific database tokens
// //         if (backendUrl) {
// //             const cookieHeader = req.headers.get('cookie') || req.cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ');
// //             const endpoint = isAdmin ? '/api/admin/auth/logout' : '/api/auth/logout';
// //             try {
// //                 const backendRes = await fetch(`${backendUrl}${endpoint}`, {
// //                     method: 'POST',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                         cookie: cookieHeader,
// //                     },
// //                 });
// //                 const backendCookies = backendRes.headers.getSetCookie ? backendRes.headers.getSetCookie() : [];
// //                 for (const cookieStr of backendCookies) {
// //                     response.headers.append('set-cookie', cookieStr);
// //                 }
// //             } catch (err) {
// //                 console.error('[logout proxy] Failed to reach backend:', err);
// //             }
// //         }

// //         // Delete cookies on Next.js frontend domain (matches attributes set in /login/route.ts)
// //         const clearCookieOptions = {
// //             path: '/',
// //             httpOnly: true,
// //             secure: process.env.NODE_ENV === 'production',
// //             sameSite: 'lax' as const,
// //             maxAge: 0,
// //             expires: new Date(0),
// //         };

// //         response.cookies.set('accessToken', '', clearCookieOptions);
// //         response.cookies.set('refreshToken', '', clearCookieOptions);
// //         response.cookies.delete('accessToken');
// //         response.cookies.delete('refreshToken');

// //         return response;
// //     } catch (err) {
// //         console.error('[logout proxy] Error:', err);
// //         return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
// //     }
// // }

// // src/app/api/auth/logout/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { appendClearAuthCookies } from '@/lib/authCookies';

// export async function POST(req: NextRequest) {
//     try {
//         let isAdmin = false;
//         try {
//             const body = await req.json();
//             isAdmin = !!body?.isAdmin;
//         } catch {
//             // body might be empty, ignore
//         }

//         const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

//         const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
//         response.headers.set('Cache-Control', 'no-store');

//         // 1. Ask the backend to invalidate the refresh token in the database.
//         //    Failure here must never prevent the browser cookies from being cleared.
//         let backendCookies: string[] = [];
//         if (backendUrl) {
//             const cookieHeader =
//                 req.headers.get('cookie') ||
//                 req.cookies.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
//             const endpoint = isAdmin ? '/api/admin/auth/logout' : '/api/auth/logout';
//             try {
//                 const backendRes = await fetch(`${backendUrl}${endpoint}`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         cookie: cookieHeader,
//                     },
//                     cache: 'no-store',
//                 });
//                 backendCookies = backendRes.headers.getSetCookie
//                     ? backendRes.headers.getSetCookie()
//                     : [];
//             } catch (err) {
//                 console.error('[logout proxy] Failed to reach backend:', err);
//             }
//         }

//         // 2. Expire every variant (host-only + Domain=.carehealth.online).
//         //    IMPORTANT: use raw headers only. Do NOT mix with response.cookies.set/delete,
//         //    which rewrites the whole Set-Cookie header and drops what was appended.
//         appendClearAuthCookies(response.headers);

//         // 3. Also forward the backend's own clearing cookies (harmless duplicates).
//         for (const cookieStr of backendCookies) {
//             response.headers.append('set-cookie', cookieStr);
//         }

//         return response;
//     } catch (err) {
//         console.error('[logout proxy] Error:', err);
//         // Even on unexpected failure, still try to clear the cookies.
//         const response = NextResponse.json(
//             { success: false, message: 'Internal server error' },
//             { status: 500 }
//         );
//         appendClearAuthCookies(response.headers);
//         return response;
//     }
// }




// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { appendClearAuthCookies, getRequestHostname } from '@/lib/authCookies';

// Never cache or statically optimise this handler.
export const dynamic = 'force-dynamic';

const BACKEND_TIMEOUT_MS = 4000;

function applyLogoutHeaders(response: NextResponse, requestHost?: string) {
    response.headers.set('Cache-Control', 'no-store');
    // Lets you confirm in DevTools / curl that THIS handler produced the response.
    response.headers.set('X-Logout-Handler', 'v3');

    // 1. Expire every cookie variant explicitly (raw headers, not response.cookies).
    appendClearAuthCookies(response.headers, requestHost);

    // 2. Belt and braces: ask the browser to drop all cookies for this site.
    //    Only honoured on HTTPS, so restricted to production.
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Clear-Site-Data', '"cookies"');
    }
}

export async function POST(req: NextRequest) {
    const requestHost = getRequestHostname(req.headers);

    try {
        let isAdmin = false;
        try {
            const body = await req.json();
            isAdmin = !!body?.isAdmin;
        } catch {
            // body might be empty, ignore
        }

        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

        // 1. Ask the backend to invalidate the refresh token in the database.
        //    It must NEVER block or prevent the browser cookies from being cleared,
        //    so it has a hard timeout and every failure is swallowed.
        let backendCookies: string[] = [];
        if (backendUrl) {
            const cookieHeader =
                req.headers.get('cookie') ||
                req.cookies.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
            const endpoint = isAdmin ? '/api/admin/auth/logout' : '/api/auth/logout';
            try {
                const backendRes = await fetch(`${backendUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        cookie: cookieHeader,
                    },
                    cache: 'no-store',
                    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
                });
                backendCookies = backendRes.headers.getSetCookie
                    ? backendRes.headers.getSetCookie()
                    : [];
            } catch (err) {
                console.error('[logout proxy] Backend logout failed or timed out:', err);
            }
        }

        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
        applyLogoutHeaders(response, requestHost);

        // 2. Also forward the backend's own clearing cookies (harmless duplicates).
        for (const cookieStr of backendCookies) {
            response.headers.append('set-cookie', cookieStr);
        }

        return response;
    } catch (err) {
        console.error('[logout proxy] Error:', err);
        // Even on unexpected failure, still try to clear the cookies.
        const response = NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
        applyLogoutHeaders(response, requestHost);
        return response;
    }
}