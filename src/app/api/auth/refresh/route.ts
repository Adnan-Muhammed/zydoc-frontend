// src/app/api/auth/refresh/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
        const refreshRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
            {
                method: 'POST',
                cache: 'no-store',
                headers: { cookie: `refreshToken=${refreshToken}` },
            }
        );

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
        const meRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
            {
                method: 'GET',
                cache: 'no-store',
                headers: { cookie: `accessToken=${newAccessToken}; refreshToken=${refreshToken}` },
            }
        );

        if (!meRes.ok) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const data = await meRes.json();

        // ✅ Route Handlers CAN set cookies — this works
        const response = NextResponse.json({ user: data.user ?? null });

        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 2 * 60,
        });

        return response;

    } catch {
        return NextResponse.json({ user: null }, { status: 500 });
    }
}