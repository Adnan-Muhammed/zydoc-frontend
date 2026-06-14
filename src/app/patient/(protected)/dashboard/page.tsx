


// src/app/patient/(protected)/dashboard/page.tsx
import { cookies } from 'next/headers';
import DashboardClient from './DashBoardClient';

async function getUser() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) return null;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Cookie: `accessToken=${accessToken}` },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user ?? data;
    } catch {
        return null;
    }
}

export default async function Page() {
    const user = await getUser();
    // Pass user from server → client so Redux empty state doesn't matter
    return <DashboardClient user={user} />;
}