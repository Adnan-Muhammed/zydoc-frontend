// src/app/api/auth/verify-otp/route.ts
//
// WHY THIS EXISTS:
// When the browser calls the backend (different domain on tunnels), cookies are set
// on the BACKEND domain. The Next.js middleware only reads cookies on the FRONTEND
// domain. This proxy calls the backend server-to-server and re-sets the cookies
// on the frontend domain so the middleware can read them correctly.
//
// This is the same pattern used by /api/auth/refresh and /api/auth/set-role.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
        if (!backendUrl) {
            return NextResponse.json({ success: false, message: 'Backend URL not configured' }, { status: 500 });
        }

        // Server-to-server call — no CORS, no preflight, no cookie domain issues
        const backendRes = await fetch(`${backendUrl}/api/auth/verify-otp`, {
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
            console.error('[verify-otp proxy] Non-JSON response from backend:', text.substring(0, 100));
            return NextResponse.json({ success: false, message: 'Invalid response from backend server' }, { status: 502 });
        }

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        const response = NextResponse.json(data);

        // Re-set cookies on the FRONTEND domain so Next.js middleware can read them
        const setCookieHeader = backendRes.headers.get('set-cookie');
        if (setCookieHeader) {
            // Split multiple cookies (they are comma-separated, but commas can appear in values)
            const cookieParts = setCookieHeader.split(/,(?=[^ ])/);
            for (const part of cookieParts) {
                const [nameValue] = part.trim().split(';');
                const eqIdx = nameValue.indexOf('=');
                if (eqIdx === -1) continue;
                const cookieName = nameValue.slice(0, eqIdx).trim();
                const cookieValue = nameValue.slice(eqIdx + 1).trim();

                response.cookies.set(cookieName, cookieValue, {
                    httpOnly: true,
                    // sameSite 'lax' is safe here — this cookie is being set for the
                    // SAME frontend domain (not cross-origin), so 'lax' works fine.
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: cookieName === 'accessToken' ? 2 * 60 : 7 * 24 * 60 * 60,
                });
            }
        }

        return response;

    } catch (err) {
        console.error('[verify-otp proxy] Error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
