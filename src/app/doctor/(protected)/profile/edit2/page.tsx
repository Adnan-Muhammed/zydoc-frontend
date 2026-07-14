import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SettingsMatrixClient from './SettingsMatrixClient';

export default async function SettingsMatrixPage() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        redirect('/login'); 
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctor/profile`, {
            headers: {
                Cookie: `accessToken=${accessToken}`,
                Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            redirect('/login');
        }

        const data = await res.json();
        // The new endpoint returns { success: true, profile: { ... } }
        const user = data.profile ?? data.user ?? data;
 
        return <SettingsMatrixClient initialData={user} />;
    } catch (error) {
        console.error('Error fetching user data:', error);
        redirect('/doctor/dashboard');
    }
}
