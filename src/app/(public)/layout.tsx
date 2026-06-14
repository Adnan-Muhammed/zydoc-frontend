// src/app/(public)/layout.tsx
import { cookies } from 'next/headers';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "@/app/(public)/landing.css";

async function getUser(cookieHeader: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            method: 'GET',
            cache: 'no-store',
            headers: { cookie: cookieHeader },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user ?? null;
    } catch { return null; }
}

export default async function PublicLayout({
    children
}: Readonly<{ children: React.ReactNode }>) {

    // 1. Get the cookies properly
    const cookieStore = cookies();

    // 2. Format the cookie header for the API call
    const cookieHeader = cookieStore.getAll()
        .map(c => `${c.name}=${c.value}`)
        .join('; ');

    // 3. Extract tokens
    const accessToken = cookieStore.get('accessToken')?.value;

    // 4. Fetch the user server-side
    const user = accessToken ? await getUser(cookieHeader) : null;

    return (
        <div className="flex min-h-screen flex-col">
            <Header user={user} />

            <main className=''>
                {children}
            </main>

            <Footer />
        </div>
    );
}