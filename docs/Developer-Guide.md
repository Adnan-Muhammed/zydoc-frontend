# Developer Guide

Everything you need to get up and running on the Zydoc frontend.

---

## Prerequisites

- Node.js 18+
- npm 9+
- Access to the Zydoc backend (running locally or staging URL)

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env
# Edit .env and set NEXT_PUBLIC_API_URL to your backend URL
# e.g., NEXT_PUBLIC_API_URL=http://localhost:5001

# 3. Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL (no trailing slash) |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Production build (also runs TypeScript checks) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Project Conventions

See [Frontend-Rules.md](./Frontend-Rules.md) for the complete rule set. Quick version:

- Use `useAppDispatch` / `useAppSelector` — not raw Redux hooks.
- Delete old code — don't comment it out.
- No `console.log` in production paths.
- `any` catch blocks → use `unknown` and narrow the type.

---

## Making API Requests

See [Api-Guidelines.md](./Api-Guidelines.md) for the full picture.

TL;DR:
- **Redux thunks + authenticated requests** → use `axiosInstance`
- **Server Components + public data** → use native `fetch()`
- All auth headers are injected automatically by `axiosInstance`

---

## Adding a New Feature

### New Page

1. Create the route in `src/app/<role>/(protected)/<page-name>/page.tsx`
2. If the page needs data, fetch it server-side in `page.tsx`
3. Create a `<PageName>Client.tsx` component in `src/components/<role>/` if client interactivity is needed

### New Redux Slice

Follow the existing pattern:

```
src/redux/features/<feature>/
├── <feature>Service.ts   # API calls using axiosInstance
├── <feature>Slice.ts     # State shape + reducers
├── <feature>Thunk.ts     # createAsyncThunk wrappers
└── <feature>Types.ts     # TypeScript interfaces
```

Register the reducer in `src/redux/store.ts`.

### New Shared Component

Add to `src/components/ui/` only if it's truly generic (no Redux, no domain logic). Otherwise, co-locate with the feature.

---

## Auth Flow Overview

```
Signup:
  UnifiedSignupForm → signupUser thunk → backend sends OTP → OTP screen → verifyOtp thunk → redirect to profile-update

Login (Patient/Doctor):
  UnifiedLoginForm → loginUser thunk → window.location to /{role}/dashboard

Login (Admin):
  AdminLoginForm → loginUser thunk (isAdmin: true) → redirect to /admin/dashboard

Session Check:
  AuthHydrator → setCredentials (from SSR user) or /auth/me call → auth.isAuthChecked = true

Logout:
  Sidebar logout button → logoutUser thunk → router.replace('/') + router.refresh()
```

---

## Common Tasks

### Check the current user's role
```ts
const user = useAppSelector((state) => state.auth.user);
// user.role is 'admin' | 'doctor' | 'patient'
```

### Dispatch an action with error handling
```ts
dispatch(someThunk(payload))
    .unwrap()
    .then((result) => { /* success */ })
    .catch((err: unknown) => {
        setError(typeof err === 'string' ? err : 'Something went wrong');
    });
```

### Fetch data server-side in a page
```ts
// src/app/patient/(protected)/appointments/page.tsx
import { getPatientAppointments } from '@/lib/appointments';

export default async function AppointmentsPage() {
    const { appointments } = await getPatientAppointments();
    return <AppointmentsList appointments={appointments} />;
}
```

---

## Troubleshooting

### "Not authenticated" flash before redirect
The `AuthGuard` waits for `isAuthChecked` before rendering. If you see a flash, check that `AuthHydrator` is higher in the tree and receiving the correct `user` prop from the server layout.

### 401 errors in the browser network tab
The `axiosInstance` interceptor auto-retries once with a refreshed token. If the retry also fails, `auth/clearCredentials` is dispatched, which the middleware picks up on the next navigation.

### Build fails with type errors
Run `npx tsc --noEmit` locally to see all type errors before pushing. The build pipeline enforces strict TypeScript.
