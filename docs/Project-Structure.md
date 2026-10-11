# Project Structure

A practical reference for where things live and why.

---

## `src/api/`

The HTTP layer. Two files:

- **`axiosInstance.ts`** — Shared Axios instance with base URL, auth header injection (from Redux `auth.accessToken`), and automatic token refresh on 401. Import this everywhere you need authenticated HTTP.
- **`endpoints.ts`** — Typed constants for all backend API paths. Use these to avoid magic strings and make URL changes a single-file update.

---

## `src/app/`

Next.js App Router. Each folder is a route segment.

```
app/
├── (auth)/           # Route group — login/signup pages
│   ├── layout.tsx    # Auth shell (centered card layout)
│   ├── login/
│   └── signup/
├── (public)/         # Landing page, Find Doctor (no auth required)
├── admin/
│   ├── (auth)/       # Admin login
│   ├── (protected)/  # Admin dashboard, users, approvals, doctors, patients
│   │   └── layout.tsx  # Injects AuthHydrator, fetches user from cookie
│   ├── admin.css
│   └── layout.tsx
├── doctor/
│   ├── (protected)/  # Doctor dashboard, profile, schedule, earnings
│   │   └── layout.tsx
│   └── layout.tsx
├── patient/
│   ├── (protected)/  # Patient dashboard, appointments, records, find-doctor
│   │   └── layout.tsx
│   └── layout.tsx
├── api/              # Next.js API routes (if any)
├── globals.css
└── layout.tsx        # Root layout — fonts, metadata, ReduxProvider
```

The `(protected)` route groups are a Next.js convention for shared layouts without affecting the URL path.

---

## `src/components/`

Feature-grouped UI components.

```
components/
├── admin/
│   └── AdminDashboardClient.tsx   # Admin dashboard charts and stat cards
├── auth/
│   ├── AuthGuard.tsx              # Client-side route protection wrapper
│   ├── AuthHydrator.tsx           # Redux state hydration from SSR user
│   └── GuestGuard.tsx             # Redirect authenticated users away from auth pages
├── doctor/
│   └── ScheduleManager/           # Doctor schedule management UI
├── find-doctor/
│   ├── DoctorFilters.tsx          # Search/filter sidebar for doctor listing
│   └── DoctorList.tsx             # Doctor card grid
├── forms/
│   ├── AdminLoginForm.tsx         # Admin login (dark theme, 2FA ready)
│   ├── UnifiedLoginForm.tsx       # Patient/Doctor login with Google OAuth
│   └── UnifiedSignupForm.tsx      # Patient/Doctor signup with OTP verification
├── landing/                       # Landing page sections (FAQ, Features, etc.)
├── layout/
│   ├── AppShell.tsx               # Dashboard layout wrapper (sidebar + topbar)
│   ├── AuthHeader.tsx             # Minimal header for auth pages
│   ├── Footer.tsx                 # Public footer
│   ├── Header.tsx                 # Public navigation header
│   ├── Sidebar.tsx                # Dashboard sidebar with role-based nav
│   ├── Topbar.tsx                 # Dashboard topbar (search, notifications)
│   └── dashboard-layout.css       # Sidebar/topbar layout styles
├── patient/
│   └── SlotPicker/                # Appointment time slot selection
├── shared/                        # (Reserved for truly cross-cutting components)
└── ui/
    ├── Badge.tsx                  # Status badge component
    ├── Button.tsx                 # Primary button with loading state
    └── Input.tsx                  # Form input with label, icon, error support
```

---

## `src/hooks/`

Custom React hooks. Currently empty — logic is co-located with components where it's used.

Add a hook here when the same stateful logic appears in **2+ different components**.

---

## `src/lib/`

Server-side data utilities. These are plain async functions meant to be called from **Server Components** (`page.tsx`, `layout.tsx`).

- **`doctors.ts`** — Fetch doctor list with filters, fetch doctor by ID
- **`appointments.ts`** — Create appointment, fetch patient appointments, get available slots

These use native `fetch()`, not axios, because they run server-side and don't need the shared axios interceptors.

---

## `src/redux/`

Redux store and feature slices.

```
redux/
├── auth/
│   ├── authService.ts   # API calls (login, signup, OTP, logout, me)
│   ├── authSlice.ts     # Auth state + reducers
│   ├── authThunk.ts     # Async thunks
│   └── authTypes.ts     # AuthState, User interfaces
├── features/
│   ├── admin/           # Admin state (stats, users, logs)
│   ├── doctor/          # Doctor profile update state
│   └── patient/         # Scaffolded — not yet wired to store
├── hooks.ts             # Typed useAppDispatch / useAppSelector
├── provider.tsx         # ReduxProvider wrapper
└── store.ts             # Store configuration
```

Each feature follows the same pattern: `Service → Thunk → Slice`.

---

## `src/types/`

Shared TypeScript types exported for cross-cutting use.

- **`index.ts`** — Re-exports `User`, `AuthState`, `AdminUser`, `AdminState`, `SystemStats`. Also defines `UserRole`, `ApiResponse`, `Pagination`.

Feature-specific types remain co-located with their feature (e.g., `authTypes.ts`).

---

## `src/middleware.ts`

Next.js Edge Middleware that runs on every request (except `_next/static`, `_next/image`, `favicon.ico`).

Responsibilities:
- Reads `accessToken` and `refreshToken` cookies
- Decodes JWT to extract role and `isProfileCompleted`
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages to their dashboard
- Handles automatic token refresh via `/api/auth/refresh`
- Enforces doctor/patient profile completion redirects
