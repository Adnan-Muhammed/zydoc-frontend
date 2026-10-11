# Caching Strategy

This document explains what is cached, what is not, and why.

---

## Principle

Cache only what provides real value. Over-caching causes stale data; under-caching wastes server resources. This project caches conservatively.

---

## What IS Cached

### Auth User (Redux)

**How:** Redux `auth` slice, hydrated once via `AuthHydrator`.

**Why:** The user object (name, role, avatarUrl) doesn't change mid-session. Reading it from Redux is free.

**Invalidation:** On logout (`logoutUser` thunk resets to `initialState`). On doctor profile update (`updateDoctorProfile.fulfilled` syncs the user into auth state).

```ts
// In authSlice.ts — keeps auth.user in sync after profile update
.addCase(updateDoctorProfile.fulfilled, (state, action) => {
    if (action.payload?.user) state.user = action.payload.user;
})
```

### Admin Dashboard Stats (Redux)

**How:** Redux `admin.stats` slice, populated by `getSystemStats` thunk.

**Why:** Stats don't need to be real-time. A per-page-load fetch is sufficient.

**Invalidation:** Next page visit triggers a re-fetch via the admin dashboard's `useEffect`.

---

## What is NOT Cached

### Appointment Availability

**Why not:** Slots change as other patients book. Caching means showing already-booked slots as available. All availability fetches use `cache: 'no-store'`:

```ts
const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/availability/${doctorId}?date=${date}`,
    { cache: 'no-store' }
);
```

### Doctor Listing

**Why not:** Doctor info (availability, fees, approval status) can change. Always fresh:

```ts
const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors`,
    { cache: 'no-store' }
);
```

### Patient Appointments

**Why not:** Appointment status changes (confirmed → completed, etc.). Always fresh.

### Audit Logs (Admin)

**Why not:** Logs are append-only and need to show the latest entries.

---

## Next.js Cache Behavior

| `fetch()` call | Cache setting | Behavior |
|---|---|---|
| Doctor listing | `cache: 'no-store'` | Fresh on every request |
| Doctor by ID | `cache: 'no-store'` | Fresh on every request |
| Appointment availability | `cache: 'no-store'` | Fresh on every request |
| Patient appointments | `cache: 'no-store'` | Fresh on every request |

> All server-side `fetch` calls in this project use `cache: 'no-store'` because healthcare data must always be up to date.

---

## What to Cache in the Future

If traffic grows, consider:

1. **Doctor list with short TTL** — `next: { revalidate: 60 }` (1-minute stale-while-revalidate). Safe because new doctor approvals can be slightly delayed.
2. **Static lookup data** (specialties, languages) — fully cacheable with long TTL.
3. **User profile** — already cached in Redux. No further action needed.

Do **not** cache:
- Appointment availability
- Booking confirmations
- Any realtime status data
