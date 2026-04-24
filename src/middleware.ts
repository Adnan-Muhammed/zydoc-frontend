

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const refreshToken = request.cookies.get('refreshToken')?.value;

    const isAdminPath = pathname.startsWith('/admin');
    const isDoctorPath = pathname.startsWith('/doctor');
    const isPatientPath = pathname.startsWith('/patient');

    const isLoginPage = pathname.endsWith('/login');
    const isSignupPage = pathname.endsWith('/signup');

    // ✅ 1. If NOT logged in → block protected routes
    if (!refreshToken) {
        if (isAdminPath && !isLoginPage) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        if ((isDoctorPath || isPatientPath) && !(isLoginPage || isSignupPage)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // ✅ 2. If logged in → prevent visiting auth pages
    if (refreshToken && (isLoginPage || isSignupPage)) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/doctor/:path*',
        '/patient/:path*',
        '/login',
        '/signup',
    ],
};