// Fetches use the native `fetch` API since these run server-side and in client
// components that don't need the shared axiosInstance interceptors.

const getAuthHeaders = (): Record<string, string> => { 
    let token = '';
    // Look for accessToken in cookies if running on client
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
        if (match) token = match[2];
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function createAppointment(data: {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    consultationType: 'video' | 'physical';
    fee: number;
    notes?: string;
}) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create appointment');
    }

    return res.json();
}

export async function getPatientAppointments() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/patient`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        cache: 'no-store'
    });

    if (!res.ok) {
        return { success: false, appointments: [] };
    }

    return res.json();
}

export async function getAvailableSlots(doctorId: string, date: string, consultationType: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/availability/${doctorId}?date=${date}&consultationType=${consultationType}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        cache: 'no-store'
    });

    if (!res.ok) {
        return { success: false, slots: [] };
    }

    return res.json();
}

export async function extendLock(slotId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/extend-lock`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify({ slotId }),
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new Error('Failed to extend lock');
    }

    return res.json();
}
