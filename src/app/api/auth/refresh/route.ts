// // src/app/api/auth/refresh/route.ts

// import { cookies } from 'next/headers';
// import { NextResponse } from 'next/server';

// export async function GET() {
//     const cookieStore = cookies();
//     const refreshToken = cookieStore.get('refreshToken')?.value;

//     if (!refreshToken) {
//         return NextResponse.json({ user: null }, { status: 401 });  
//     }

//     try {
//         const refreshRes = await fetch(
//             `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
//             {
//                 method: 'POST',
//                 cache: 'no-store',
//                 headers: { cookie: `refreshToken=${refreshToken}` },
//             }
//         );

//         if (!refreshRes.ok) {
//             return NextResponse.json({ user: null }, { status: 401 });
//         }

//         // Extract new accessToken from backend Set-Cookie
//         const setCookieHeader = refreshRes.headers.get('set-cookie') ?? '';
//         const match = setCookieHeader.match(/(?:^|,)\s*accessToken=([^;]+)/);
//         const newAccessToken = match?.[1];

//         if (!newAccessToken) {
//             return NextResponse.json({ user: null }, { status: 401 });
//         }

//         // Fetch user with new token
//         const meRes = await fetch(
//             `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
//             {
//                 method: 'GET',
//                 cache: 'no-store',
//                 headers: { cookie: `accessToken=${newAccessToken}; refreshToken=${refreshToken}` },
//             }
//         );

//         if (!meRes.ok) {
//             return NextResponse.json({ user: null }, { status: 401 });
//         }

//         const data = await meRes.json();

//         // ✅ Route Handlers CAN set cookies — this works
//         const response = NextResponse.json({ user: data.user ?? null });

//         response.cookies.set('accessToken', newAccessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'lax',
//             path: '/',
//             maxAge: 2 * 60,
//         });

//         return response;

//     } catch {
//         return NextResponse.json({ user: null }, { status: 500 });
//     }
// }

// src/app/api/auth/refresh/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
    ACCESS_TOKEN_NAME,
    getAuthCookieOptions,
    appendClearHostOnlyCookies,
    COOKIE_DOMAIN,
} from '@/lib/authCookies';

export async function GET() {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

    try {
        const refreshRes = await fetch(`${backendUrl}/api/auth/refresh`, {
            method: 'POST',
            cache: 'no-store',
            headers: { cookie: `refreshToken=${refreshToken}` },
        });

        if (!refreshRes.ok) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Extract new accessToken from backend Set-Cookie
        const setCookieHeader = refreshRes.headers.get('set-cookie') ?? '';
        const match = setCookieHeader.match(/(?:^|,)\s*accessToken=([^;]+)/);
        const newAccessToken = match?.[1];

        if (!newAccessToken) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Fetch user with new token
        const meRes = await fetch(`${backendUrl}/api/auth/me`, {
            method: 'GET',
            cache: 'no-store',
            headers: { cookie: `accessToken=${newAccessToken}; refreshToken=${refreshToken}` },
        });

        if (!meRes.ok) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const data = await meRes.json();

        const response = NextResponse.json({ user: data.user ?? null });
        response.headers.set('Cache-Control', 'no-store');

        // Same attributes as login (15 min, Domain=.carehealth.online)
        response.cookies.set(ACCESS_TOKEN_NAME, newAccessToken, getAuthCookieOptions(ACCESS_TOKEN_NAME));

        // Drop any stale host-only copy (must come AFTER response.cookies.set)
        if (COOKIE_DOMAIN) {
            appendClearHostOnlyCookies(response.headers);
        }

        return response;
    } catch {
        return NextResponse.json({ user: null }, { status: 500 });
    }
}