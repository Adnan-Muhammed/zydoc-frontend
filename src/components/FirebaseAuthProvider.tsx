'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { checkAuth } from '@/redux/auth/authThunk';

export default function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check auth on mount, which will trigger the Firebase onAuthStateChanged observer
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
}
