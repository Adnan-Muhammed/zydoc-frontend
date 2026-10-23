// src/app/api/auth/login/route.ts
//
// WHY THIS EXISTS:
// The backend (api.carehealth.online) issues the tokens. This proxy calls the backend
// server-to-server and re-sets the cookies on the frontend with the SAME attributes
// (Domain=.carehealth.online, Path=/) used everywhere else, so exactly one cookie per
// name exists and logout can reliably remove it.

import { NextRequest, NextResponse } from 'next/server';
import {
    ACCESS_TOKEN_NAME,
    REFRESH_TOKEN_NAME,
    getAuthCookieOptions,
    appendClearHostOnlyCookies,
    COOKIE_DOMAIN,
} from '@/lib/authCookies';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
        if (!backendUrl) {
            return NextResponse.json({ success: false, message: 'Backend URL not configured' }, { status: 500 });
        }

        // Server-to-server call — no CORS, no preflight, no cookie domain issues
        const { isAdmin, ...credentials } = body;
        const endpoint = isAdmin ? '/api/admin/auth/login' : '/api/auth/login';

        const backendRes = await fetch(`${backendUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
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
        response.headers.set('Cache-Control', 'no-store');

        // Re-set the backend's auth cookies on the frontend with unified attributes.
        const setCookies = backendRes.headers.getSetCookie();
        for (const cookieStr of setCookies) {
            const [nameValue] = cookieStr.split(';');
            const eqIdx = nameValue.indexOf('=');
            if (eqIdx === -1) continue;
            const cookieName = nameValue.slice(0, eqIdx).trim();
            const cookieValue = nameValue.slice(eqIdx + 1).trim();

            if (cookieName !== ACCESS_TOKEN_NAME && cookieName !== REFRESH_TOKEN_NAME) continue;

            response.cookies.set(cookieName, cookieValue, getAuthCookieOptions(cookieName));
        }

        // Remove any legacy host-only cookies (set by older versions) so they cannot
        // shadow the new domain-scoped ones. Must come AFTER response.cookies.set().
        if (COOKIE_DOMAIN) {
            appendClearHostOnlyCookies(response.headers);
        }

        return response;
    } catch (err) {
        console.error('[login proxy] Error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}