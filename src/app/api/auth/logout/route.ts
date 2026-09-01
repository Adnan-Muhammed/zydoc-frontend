import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
        
        // Notify the backend to clear any backend-specific sessions if needed
        if (backendUrl) {
            await fetch(`${backendUrl}/api/auth/logout`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).catch(err => console.error('[logout proxy] Failed to reach backend:', err));
        }

        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

        // IMPORTANT: Clear the first-party cookies that were set by Next.js login proxy!
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');

        return response;
    } catch (err) {
        console.error('[logout proxy] Error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
