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
        
        // Notify the backend to clear sessions and backend-specific database tokens
        if (backendUrl) {
            const cookieHeader = req.headers.get('cookie') || '';
            const endpoint = isAdmin ? '/api/admin/auth/logout' : '/api/auth/logout';
            await fetch(`${backendUrl}${endpoint}`, { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    cookie: cookieHeader,
                },
            }).catch(err => console.error('[logout proxy] Failed to reach backend:', err));
        } 

        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

        // Delete cookies on Next.js frontend domain
        const cookieOptions = {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
        };

        response.cookies.delete({ name: 'accessToken', ...cookieOptions });
        response.cookies.delete({ name: 'refreshToken', ...cookieOptions });

        return response;
    } catch (err) {
        console.error('[logout proxy] Error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
 