// src/components/auth/AuthHydrator.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setCredentials, clearCredentials } from '@/redux/auth/authSlice';
import authService from '@/redux/auth/authService';
import type { User } from '@/redux/auth/authTypes';

interface AuthHydratorProps {
    children: React.ReactNode;
    /** User resolved on the server via SSR — passed to skip a round-trip API call. */
    user?: User | null;
}

/**
 * Hydrates Redux auth state from either:
 * 1. SSR-resolved user (instant, no extra request)
 * 2. Client-side /auth/me call (fallback when SSR user is unavailable)
 *
 * Uses a ref guard so the effect only runs once per mount.
 */
export default function AuthHydrator({ children, user: serverUser }: AuthHydratorProps) {
    const dispatch = useAppDispatch();
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        if (serverUser) {
            dispatch(setCredentials({ user: serverUser, accessToken: null }));
            initialized.current = true;
            return;
        }

        const hydrate = async () => {
            try {
                const data = await authService.getCurrentUser();
                if (data?.user) {
                    dispatch(setCredentials({ user: data.user, accessToken: data.accessToken || null }));
                } else {
                    dispatch(clearCredentials());
                }
            } catch (error) {
                console.error('Auth hydration failed:', error);
                dispatch(clearCredentials());
            } finally {
                initialized.current = true;
            }
        };

        hydrate();
    }, [dispatch, serverUser]);

    return <>{children}</>;
}
