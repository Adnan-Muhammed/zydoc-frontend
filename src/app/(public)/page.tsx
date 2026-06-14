// src/app/(public)/page.tsx
import { cookies } from 'next/headers';
import LandingClient from './LandingClient';

async function getUser(cookieHeader: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
            {
                method: 'GET',
                cache: 'no-store',
                headers: { cookie: cookieHeader },
            }
        );

        if (!res.ok) return null;
        const data = await res.json();
        return data.user ?? null;

    } catch {
        return null;
    }
}

export default async function LandingPage() {
    const cookieStore = cookies();

    const cookieHeader = cookieStore
        .getAll()
        .map(c => `${c.name}=${c.value}`)
        .join('; ');

    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Only fetch user if accessToken exists — otherwise let client handle refresh
    const user = accessToken ? await getUser(cookieHeader) : null;

    return (
        // Pass whether a refreshToken exists so client knows to attempt refresh
        <LandingClient
            initialUser={user}
            hasRefreshToken={!!refreshToken}
        />
    );
}


