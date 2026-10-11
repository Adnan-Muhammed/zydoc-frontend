# API Guidelines

How to work with the Zydoc backend API from the frontend.

---

## The Two HTTP Patterns

This project uses **two different HTTP approaches** depending on context:

### 1. `axiosInstance` — for authenticated client-side requests

**File:** `src/api/axiosInstance.ts`

Use for:
- Redux thunks (admin stats, doctor profile update, etc.)
- Any request that needs the `Authorization` header automatically injected
- Any request that needs automatic token refresh on 401

```ts
import axiosInstance from '@/api/axiosInstance';

const res = await axiosInstance.get('/admin/stats');
return res.data;
```

Features:
- Auto-injects `Authorization: Bearer <token>` from Redux state
- Auto-refreshes token on 401 and retries the original request
- Dispatches `auth/clearCredentials` if refresh fails

### 2. Native `fetch` — for server-side / unauthenticated requests

**Files:** `src/lib/doctors.ts`, `src/lib/appointments.ts`

Use for:
- Next.js Server Components (page.tsx, layout.tsx)
- Public endpoints that don't need auth headers
- Server-side data that benefits from Next.js caching

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors`, {
    cache: 'no-store',
});
return res.json();
```

---

## Endpoint Constants

All API paths are documented in `src/api/endpoints.ts`. Reference them to avoid typos:

```ts
import { AUTH, ADMIN, DOCTORS, APPOINTMENTS } from '@/api/endpoints';

// AUTH.LOGIN            → '/auth/login'
// ADMIN.STATS           → '/admin/stats'
// DOCTORS.BY_ID(id)     → `/doctors/${id}`
// APPOINTMENTS.CREATE   → '/appointments'
```

> **Note:** Services still use inline strings currently. Adopt `endpoints.ts` constants incrementally when modifying service files.

---

## Error Handling

### In thunks
Always use `rejectWithValue` to surface errors to the Redux slice:

```ts
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            return await authService.login(credentials);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);
```

### In components
Catch the result of `.unwrap()` to access the error in the component:

```ts
dispatch(loginUser({ credentials }))
    .unwrap()
    .then((res) => { /* success */ })
    .catch((err: unknown) => {
        setError(typeof err === 'string' ? err : 'Something went wrong');
    });
```

### In server components
Check `res.ok` before parsing:

```ts
if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
}
```

---

## Auth Headers

The `axiosInstance` injects auth headers automatically. For `fetch()` calls that need auth (e.g., `lib/appointments.ts`), headers are extracted from the cookie:

```ts
const getAuthHeaders = (): Record<string, string> => {
    if (typeof document === 'undefined') return {};
    const match = document.cookie.match(/(^| )accessToken=([^;]+)/);
    const token = match?.[2] ?? '';
    return token ? { Authorization: `Bearer ${token}` } : {};
};
```

This is necessary because `fetch()` doesn't go through the Axios interceptor.

---

## Request Patterns by Feature

| Feature | File | Pattern |
|---|---|---|
| Auth (login/signup/OTP) | `redux/auth/authService.ts` | axiosInstance |
| Admin management | `redux/features/admin/adminService.ts` | axiosInstance |
| Doctor profile update | `redux/features/doctor/doctorService.ts` | axiosInstance (multipart) |
| Doctor listing (public) | `lib/doctors.ts` | fetch (no-store) |
| Appointments (patient) | `lib/appointments.ts` | fetch + cookie auth |
| Slot availability | `lib/appointments.ts` | fetch + cookie auth (no-store) |

---

## Environment Variables

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL. All fetch calls and axiosInstance baseURL use this. |

Never hardcode the API URL. Always use `process.env.NEXT_PUBLIC_API_URL`.
