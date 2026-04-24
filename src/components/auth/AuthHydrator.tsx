// AuthHydrator.tsx - CHECK AUTHENTICATION
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks'; // redux
import { setCredentials, clearCredentials } from '@/redux/auth/authSlice'; // redux
import authService from '@/redux/auth/authService'; // redux



export default function AuthHydrator({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    // const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const hydrate = async () => {
            try {
                // Try to get current user session
                const data = await authService.getCurrentUser();
                if (data && data.user) {
                    dispatch(setCredentials({
                        user: data.user,
                        accessToken: data.accessToken
                    }));
                } else {
                    dispatch(clearCredentials());
                }
            } catch (error) {
                console.error('Hydration failed:', error);
                dispatch(clearCredentials());
            }
            // finally {
            //     setIsHydrated(true);
            // }
        };

        hydrate();
    }, [dispatch]);


    return <>{children}</>;
}

