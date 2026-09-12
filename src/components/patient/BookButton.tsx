'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

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
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
                <i className="fas fa-calendar-check text-xs" />
                Book Now
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 shrink-0"
        >
            <i className="fas fa-calendar-check text-xs" />
            Book Appointment
        </button>
    );
}
