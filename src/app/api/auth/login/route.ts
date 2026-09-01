// src/app/api/auth/login/route.ts
//
// WHY THIS EXISTS:
// Same reason as /api/auth/verify-otp/route.ts:
// On tunnel setups, the backend (different domain) sets cookies on its own domain.
// This proxy calls the backend server-to-server and re-sets the cookies on the
// frontend domain so Next.js middleware can see the accessToken and refreshToken.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
        if (!backendUrl) {
            return NextResponse.json({ success: false, message: 'Backend URL not configured' }, { status: 500 });
        }

        // Server-to-server call — no CORS, no preflight, no cookie domain issues
        const isAdmin = body.isAdmin;
        // Don't forward isAdmin to the backend login if it expects strict schema, but it shouldn't hurt
        const endpoint = isAdmin ? '/api/admin/auth/login' : '/api/auth/login';

        const backendRes = await fetch(`${backendUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        const text = await backendRes.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('[login proxy] Non-JSON response from backend:', text.substring(0, 100));
            return NextResponse.json({ success: false, message: 'Invalid response from backend server' }, { status: 502 });
        }

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        const response = NextResponse.json(data);

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// OLD CODE
//         const setCookieHeader = backendRes.headers.get('set-cookie');
//         if (setCookieHeader) {
//             const cookieParts = setCookieHeader.split(/,(?=[^ ])/);
//             for (const part of cookieParts) {
//                 const [nameValue] = part.trim().split(';');
//                 const eqIdx = nameValue.indexOf('=');
//                 if (eqIdx === -1) continue;
//                 const cookieName = nameValue.slice(0, eqIdx).trim();
//                 const cookieValue = nameValue.slice(eqIdx + 1).trim();
// 
//                 response.cookies.set(cookieName, cookieValue, {
//                     httpOnly: true,
//                     secure: process.env.NODE_ENV === 'production',
//                     sameSite: 'lax',
//                     path: '/',
//                     maxAge: cookieName === 'accessToken' ? 2 * 60 : 7 * 24 * 60 * 60,
//                 });
//             }
//         }
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// NEW CODE
        const setCookies = backendRes.headers.getSetCookie();
        for (const cookieStr of setCookies) {
            const [nameValue] = cookieStr.split(';');
            const eqIdx = nameValue.indexOf('=');
            if (eqIdx === -1) continue;
            const cookieName = nameValue.slice(0, eqIdx).trim();
            const cookieValue = nameValue.slice(eqIdx + 1).trim();

            response.cookies.set(cookieName, cookieValue, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                // this line currently 2m but i want to be 15m
                // and refresh token 7 days
                maxAge: cookieName === 'accessToken' ? 15 * 60 : 7 * 24 * 60 * 60,
            });
        }
//////////////////////////////////////////////////
//////////////////////////////////////////////////

        return response;

    } catch (err) {
        console.error('[login proxy] Error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
