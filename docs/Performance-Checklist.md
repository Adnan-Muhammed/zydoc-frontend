# Performance Checklist

A practical checklist for keeping Zydoc fast. Check these before shipping new features.

---

## Rendering

- [ ] **No unnecessary re-renders**: Components using `useAppSelector` select only the slice they need, not the entire state.
  ```ts
  // ✅ Select only what you need
  const user = useAppSelector((state) => state.auth.user);

  // ❌ Selects too much — any state change triggers a re-render
  const auth = useAppSelector((state) => state.auth);
  ```
- [ ] **No inline object/array creation in JSX props** that would cause referential inequality on every render.
- [ ] **Static nav configs are module-level constants** (e.g., `ADMIN_NAV`, `PATIENT_NAV` in Sidebar) — not created inside the component.

---

## Data Fetching

- [ ] **Server Components fetch at the edge where possible** — patient appointments, doctor list, records.
- [ ] **`cache: 'no-store'`** is used for data that must be fresh on every request (appointments, availability slots).
- [ ] **No duplicate API calls** for the same data on the same page.
- [ ] **Auth is hydrated once** per mount via `AuthHydrator` — the `initialized.current` ref guard prevents double calls.

---

## Bundle Size

- [ ] **No unused dependencies** in `package.json`.
- [ ] **Chart.js components are registered once** at module level in `AdminDashboardClient.tsx` — not re-registered on every render.
- [ ] **Large libraries are only imported where used** — Lucide icons imported individually, not the whole package.

---

## Images

- [ ] Doctor avatars that come from the backend are served via the API URL, not re-uploaded to a CDN.
- [ ] External images (Unsplash fallbacks) specify width and height to prevent layout shift.

---

## Forms

- [ ] Submit buttons are disabled during pending requests (via `isLoading` prop on `Button`).
- [ ] No double-submission possible — button is disabled while the thunk is in-flight.

---

## Middleware (Edge)

- [ ] Token decoding in middleware uses `atob` (synchronous) — no async overhead on the happy path.
- [ ] Refresh calls only happen when `accessToken` is missing but `refreshToken` exists.
- [ ] Redirect logic is short-circuited early: guest → redirect, valid token → decode and route, only then → try refresh.

---

## What NOT to Optimise Prematurely

- Don't `useMemo` form field values — cost of the memo exceeds cost of recompute.
- Don't `React.memo` small pure display components — reconciliation cost is negligible.
- Don't lazy-load small components — the chunking overhead may exceed the load savings.
- Don't cache appointment availability — it changes in real time.
