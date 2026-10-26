import { NextRequest, NextResponse } from 'next/server';
import {
    ACCESS_TOKEN_NAME,
    getAuthCookieOptions,
    appendClearHostOnlyCookies,
    COOKIE_DOMAIN,
} from '@/lib/authCookies';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accessToken } = body;

        if (!accessToken || typeof accessToken !== 'string') {
            return NextResponse.json({ success: false, message: 'Valid access token required' }, { status: 400 });
        }

        const response = NextResponse.json({ success: true, message: 'Auth token synced successfully' });
        response.headers.set('Cache-Control', 'no-store');

        // Set unified auth cookie on frontend domain with sameSite lax, 15m expiry
        response.cookies.set(ACCESS_TOKEN_NAME, accessToken, getAuthCookieOptions(ACCESS_TOKEN_NAME));

        if (COOKIE_DOMAIN) {
            appendClearHostOnlyCookies(response.headers);
        }

        return response;
    } catch (err) {
        console.error('[sync-token proxy] Error syncing token cookie:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
