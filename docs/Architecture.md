# Architecture

## Overview

Zydoc is a healthcare consultation platform built with **Next.js 14 (App Router)**. It supports three user roles — **admin**, **doctor**, and **patient** — each with isolated routes, layouts, and protected dashboard pages.

The architecture follows a **pragmatic, collocated approach**: logic lives close to where it's used. No Clean Architecture, no domain layers, no enterprise patterns.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| State Management | Redux Toolkit |
| HTTP Client | Axios (shared instance) + native fetch (server-side) |
| Styling | Tailwind CSS + vanilla CSS modules |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Font Awesome 6 + Lucide React |

---

## Directory Structure

```
src/
├── api/            # Axios instance + endpoint constants
├── app/            # Next.js App Router pages and layouts
│   ├── (auth)/     # Login / Signup pages (unauthenticated)
│   ├── (public)/   # Landing page, Find Doctor
│   ├── admin/      # Admin routes
│   ├── doctor/     # Doctor routes
│   └── patient/    # Patient routes
├── components/     # UI components grouped by feature area
├── hooks/          # Custom React hooks
├── lib/            # Server-side data fetching utilities
├── redux/          # Redux store, slices, thunks, services
├── types/          # Shared TypeScript type definitions
└── middleware.ts   # Edge middleware for route protection
```

---

## Auth Architecture

Authentication uses **HTTP-only cookies** set by the backend. The middleware reads the `accessToken` cookie at the edge and enforces role-based routing without needing a full API call on most requests.

```
Request → Edge Middleware
            │
            ├── accessToken valid?  → decode JWT, enforce role routes
            ├── only refreshToken?  → call /api/auth/refresh, get new token
            └── no tokens?         → redirect to /login
```

**Client-side auth state** is managed by Redux and hydrated via `AuthHydrator`:
1. If the Next.js server layout resolved a user from the cookie, it's passed as a prop and instantly committed to Redux (no extra network request).
2. If no server user exists, `AuthHydrator` calls `/auth/me` as a fallback.

---

## Role-Based Route Protection

| Route prefix | Protected by |
|---|---|
| `/admin/*` | Middleware (JWT role check) + AuthGuard |
| `/doctor/*` | Middleware (JWT role check) + AuthGuard |
| `/patient/*` | Middleware (JWT role check) + AuthGuard |
| `/login`, `/signup` | Middleware (redirect if already authenticated) |

The `middleware.ts` file handles server-side protection. `AuthGuard.tsx` provides a client-side second layer for hydration scenarios where the middleware can't act (e.g., client-side navigation to a protected route after a soft refresh).

---

## State Management

Redux is used for **shared client state only**:

- `auth` — user identity, authentication flags, 2FA state
- `admin` — system stats, user list, audit logs (admin dashboard)
- `doctor` — doctor profile update state

All slices use the **Redux Toolkit** pattern: `createSlice` + `createAsyncThunk` + service functions. Services encapsulate axios calls, thunks handle async logic, slices own the state shape.

Patient dashboard data is fetched server-side via Next.js Server Components — no Redux slice needed.

---

## Data Fetching Patterns

| Context | Method | Why |
|---|---|---|
| Public pages (Find Doctor, Doctor list) | `fetch()` in Server Components | SSR, no auth needed |
| Patient appointments, records | `fetch()` in Server Components | Fresh per-request, no staleness |
| Admin dashboard stats | Redux thunk via axios | Needs auth headers, client interaction |
| Doctor profile update | Redux thunk (multipart) | File upload, needs interceptors |
