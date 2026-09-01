import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const accessToken = req.cookies.get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json({ success: false, message: 'No token' }, { status: 401 });
        }

        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
        
        const backendRes = await fetch(`${backendUrl}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            cache: 'no-store',
        });

        if (!backendRes.ok) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: backendRes.status });
        }

        const data = await backendRes.json();
        
        // Inject the accessToken so the frontend Redux store can capture it on page reload
        data.accessToken = accessToken;

        return NextResponse.json(data);
    } catch (err) {
        console.error('[auth/me proxy] Error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
