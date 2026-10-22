import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        let isAdmin = false;
        try {
            const body = await req.json();
            isAdmin = !!body?.isAdmin;
        } catch {
            // body might be empty, ignore
        }

        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

        // Forward cookies to backend to clear backend-specific database tokens
        if (backendUrl) {
            const cookieHeader = req.headers.get('cookie') || req.cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ');
            const endpoint = isAdmin ? '/api/admin/auth/logout' : '/api/auth/logout';
            try {
                const backendRes = await fetch(`${backendUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        cookie: cookieHeader,
                    },
                });
                const backendCookies = backendRes.headers.getSetCookie ? backendRes.headers.getSetCookie() : [];
                for (const cookieStr of backendCookies) {
                    response.headers.append('set-cookie', cookieStr);
                }
            } catch (err) {
                console.error('[logout proxy] Failed to reach backend:', err);
            }
        }

        // Delete cookies on Next.js frontend domain (matches attributes set in /login/route.ts)
        const clearCookieOptions = {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 0,
            expires: new Date(0),
        };

        response.cookies.set('accessToken', '', clearCookieOptions);
        response.cookies.set('refreshToken', '', clearCookieOptions);
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');

        return response;
    } catch (err) {
        console.error('[logout proxy] Error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
