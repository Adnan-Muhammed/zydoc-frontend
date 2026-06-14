

// src/components/auth/AuthHydrator.jsx

'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import {
    setCredentials,
    clearCredentials,
} from '@/redux/auth/authSlice';
import authService from '@/redux/auth/authService';

export default function AuthHydrator({
    children,
    user: serverUser,
}) {
    const dispatch = useAppDispatch();
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        /**
         * 1. Immediate SSR Hydration
         * If server already passed user, instantly store it in Redux
         */
        if (serverUser) {
            dispatch(
                setCredentials({
                    user: serverUser,
                    accessToken: null,
                })
            );
            initialized.current = true;
            return;
        }

        /**
         * 2. CSR Silent Session Fallback
         * If no SSR user exists, verify via backend refresh/session endpoint
         */
        const hydrate = async () => {
            try {
                const data = await authService.getCurrentUser();

                if (data?.user) {
                    dispatch(
                        setCredentials({
                            user: data.user,
                            accessToken:
                                data.accessToken || null,
                        })
                    );
                } else {
                    dispatch(clearCredentials());
                }
            } catch (error) {
                console.error(
                    'Auth hydration failed:',
                    error
                );
                dispatch(clearCredentials());
            } finally {
                initialized.current = true;
            }
        };

        hydrate();
    }, [dispatch, serverUser]);

    /**
     * 3. Render Protected Content
     */
    return <>{children}</>;
}