// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/patient', '/doctor', '/admin/dashboard'];
const AUTH_ROUTES = ['/login', '/signup', '/admin/login'];

const ROLE_DASHBOARD: Record<string, string> = {
    admin: '/admin/dashboard',
    doctor: '/doctor/dashboard',
    patient: '/patient/dashboard',
};

const ROLE_PREFIX: Record<string, string> = {
    admin: '/admin',
    doctor: '/doctor',
    patient: '/patient',
};

function getTokenPayload(token: string): any {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

function getRedirectForRole(role: string, pathname: string, isProfileCompleted?: boolean): string | null {
    const dashboard = ROLE_DASHBOARD[role];
    if (!dashboard) return '/login';

    // Enforce doctor profile completion
    if (role === 'doctor') {
        if (isProfileCompleted === false && !pathname.startsWith('/doctor/complete-profile')) {
            // If in protected route or auth route, redirect to profile-update
            const isProtectedOrAuth = PROTECTED_ROUTES.some(r => pathname.startsWith(r)) || AUTH_ROUTES.includes(pathname);
            if (isProtectedOrAuth) return '/doctor/complete-profile';
        }
        if (isProfileCompleted === true && pathname.startsWith('/doctor/complete-profile')) {
            return dashboard;
        }
    }

    // Enforce patient profile completion
    if (role === 'patient') {
        if (isProfileCompleted === false && !pathname.startsWith('/patient/profile-update')) {
            const isProtectedOrAuth = PROTECTED_ROUTES.some(r => pathname.startsWith(r)) || AUTH_ROUTES.includes(pathname);
            if (isProtectedOrAuth) return '/patient/profile-update';
        }
        if (isProfileCompleted === true && pathname.startsWith('/patient/profile-update')) {
            return dashboard;
        }
    }

    // Logged-in user on any auth page → own dashboard (or profile-update if incomplete)
    if (AUTH_ROUTES.includes(pathname)) {
        if (role === 'doctor' && isProfileCompleted === false) return '/doctor/complete-profile';
        if (role === 'patient' && isProfileCompleted === false) return '/patient/profile-update';
        return dashboard;
    }

    // Logged-in user in another role's area → own dashboard
    const ownPrefix = ROLE_PREFIX[role];
    const isOtherRoleArea = PROTECTED_ROUTES.some(
        r => pathname.startsWith(r) && !pathname.startsWith(ownPrefix)
    );
    if (isOtherRoleArea) {
        if (role === 'doctor' && isProfileCompleted === false) return '/doctor/complete-profile';
        if (role === 'patient' && isProfileCompleted === false) return '/patient/profile-update';
        return dashboard;
    }

    return null;
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const accessToken = req.cookies.get('accessToken')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;

    const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
    const isAuthPage = AUTH_ROUTES.includes(pathname);

    // ─── Case 1: No tokens → guest ───
    if (!accessToken && !refreshToken) {
        if (isProtected && !isAuthPage) {
            const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';
            return NextResponse.redirect(new URL(loginPath, req.url));
        }
        return NextResponse.next();
    }

    // ─── Case 2: Valid accessToken ───
    if (accessToken) {
        const payload = getTokenPayload(accessToken);
        if (payload && payload.role) {
            const redirectTo = getRedirectForRole(payload.role, pathname, payload.isProfileCompleted);
            if (redirectTo) {
                return NextResponse.redirect(new URL(redirectTo, req.url));
            }
        }
        return NextResponse.next();
    }

    // ─── Case 3: No accessToken, try refresh ───
    try {
        const refreshRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
            {
                method: 'POST',
                headers: { cookie: `refreshToken=${refreshToken}` },
                cache: 'no-store',
            }
        );

        if (!refreshRes.ok) {
            const response = (isProtected && !isAuthPage)
                ? NextResponse.redirect(
                    new URL(pathname.startsWith('/admin') ? '/admin/login' : '/login', req.url)
                )
                : NextResponse.next();
            response.cookies.delete('accessToken');
            response.cookies.delete('refreshToken');
            return response;
        }

        const setCookieHeader = refreshRes.headers.get('set-cookie') ?? '';
        const newAccessToken = extractCookieValue(setCookieHeader, 'accessToken');
        const payload = newAccessToken ? getTokenPayload(newAccessToken) : null;
        const role = payload?.role;

        const redirectTo = role
            ? getRedirectForRole(role, pathname, payload?.isProfileCompleted)
            : isAuthPage
                ? (pathname.startsWith('/admin') ? '/admin/dashboard' : '/')
                : null;

        const response = redirectTo
            ? NextResponse.redirect(new URL(redirectTo, req.url))
            : NextResponse.next();

        if (newAccessToken) {
            response.cookies.set('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 2 * 60,
            });
        }

        return response;

    } catch {
        if (isProtected && !isAuthPage) {
            return NextResponse.redirect(
                new URL(pathname.startsWith('/admin') ? '/admin/login' : '/login', req.url)
            );
        }
        return NextResponse.next();
    }
}

function extractCookieValue(setCookieHeader: string, name: string): string | null {
    const match = setCookieHeader.match(new RegExp(`(?:^|,)\\s*${name}=([^;]+)`));
    return match ? match[1] : null;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};