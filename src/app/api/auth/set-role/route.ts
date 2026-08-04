import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Server-to-server call - no CORS, no preflight
        const backendRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/set-role`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(body),
                cache: 'no-store',
            }
        );

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        const response = NextResponse.json(data);

        const setCookieHeader = backendRes.headers.get('set-cookie');
        if (setCookieHeader) {
            const cookieParts = setCookieHeader.split(/,(?=[^ ])/);
            for (const part of cookieParts) {
                const [nameValue] = part.trim().split(';');
                const [name, value] = nameValue.trim().split('=');
                response.cookies.set(name.trim(), value?.trim() ?? '', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: name.trim() === 'accessToken' ? 2 * 60 : 7 * 24 * 60 * 60,
                });
            }
        }

        return response;

    } catch (err) {
        console.error('[set-role proxy] Error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
