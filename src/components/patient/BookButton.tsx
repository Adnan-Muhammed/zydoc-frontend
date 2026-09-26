'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

import { CalendarCheck } from 'lucide-react';

interface BookButtonProps {
    doctorId: string;
    /** Visual variant — 'hero' for the top-right button, 'card' for the inline full-width button */
    variant?: 'hero' | 'card';
}

/**
 * Smart "Book Appointment" button.
 *
 * - If the user is already logged in as a patient → navigate directly to the booking page.
 * - If the user is NOT logged in → navigate to /login with a callbackUrl so they are
 *   returned to the booking page after signing in.
 *
 * This component must stay 'use client' because it reads Redux auth state.
 * The parent doctor profile page remains a Server Component.
 */
export default function BookButton({ doctorId, variant = 'hero' }: BookButtonProps) {
    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const bookingPath = `/patient/find-doctor/book/${doctorId}`;

    const handleClick = () => {
        if (isAuthenticated) {
            router.push(bookingPath);
        } else {
            router.push(`/login?callbackUrl=${encodeURIComponent(bookingPath)}`);
        }
    };

    if (variant === 'card') {
        return (
            <button
                type="button"
                onClick={handleClick}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#181852] hover:bg-[#252575] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
                <CalendarCheck className="size-4" />
                <span>Book Appointment</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#181852] hover:bg-[#252575] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
        >
            <CalendarCheck className="size-4" />
            <span>Book Appointment</span>
        </button>
    );
}
