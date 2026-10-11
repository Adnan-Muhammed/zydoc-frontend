# Reusable Components

A reference for shared UI components in `src/components/ui/` and the patterns for using them.

---

## `Button`

**File:** `src/components/ui/Button.tsx`

The primary action button. Always prefer this over a raw `<button>` for form submissions and primary CTAs.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Button label |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Visual style |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `isLoading` | `boolean` | `false` | Disables button, shows spinner |
| `disabled` | `boolean` | `false` | Disables button |
| `icon` | `ReactNode` | — | Icon element |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon placement |
| `onClick` | `() => void` | — | Click handler |

### Usage

```tsx
// Standard submit button
<Button type="submit" fullWidth isLoading={isLoading}>
    Sign In
</Button>

// With trailing icon
<Button
    type="submit"
    fullWidth
    isLoading={isLoading}
    icon={<i className="fas fa-chevron-right" />}
    iconPosition="right"
>
    Continue to Verification
</Button>

// Danger variant
<Button variant="danger" onClick={handleDelete}>
    Delete Account
</Button>
```

---

## `Input`

**File:** `src/components/ui/Input.tsx`

Labeled form input with icon and error support.

### Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Visible label above input |
| `type` | `string` | HTML input type (`text`, `email`, `password`, etc.) |
| `name` | `string` | Input name for form handling |
| `value` | `string` | Controlled value |
| `onChange` | `ChangeEventHandler` | Change handler |
| `placeholder` | `string` | Placeholder text |
| `icon` | `ReactNode` | Left-side icon |
| `error` | `string` | Error message shown below input |
| `required` | `boolean` | Marks input as required |
| `maxLength` | `number` | Max character count |
| `className` | `string` | Additional CSS classes |

### Usage

```tsx
<Input
    label="Email"
    type="email"
    name="email"
    value={form.email}
    onChange={handleChange}
    placeholder="john@example.com"
    icon={<i className="fas fa-envelope" />}
    required
/>

// OTP input
<Input
    label="OTP Code"
    placeholder="123456"
    value={otpCode}
    onChange={(e) => setOtpCode(e.target.value)}
    maxLength={6}
    className="text-center text-2xl font-mono tracking-widest"
/>
```

---

## `Badge`

**File:** `src/components/ui/Badge.tsx`

Status badge for displaying user/doctor states.

### Usage

```tsx
<Badge variant="approved">Approved</Badge>
<Badge variant="pending">Pending</Badge>
<Badge variant="rejected">Rejected</Badge>
```

---

## Auth Components

### `AuthGuard`

**File:** `src/components/auth/AuthGuard.tsx`

Wraps protected routes. Redirects to `/login` if not authenticated. Also enforces role-based access (admin can't access `/patient/*`).

```tsx
// In a layout.tsx
<AuthGuard>
    {children}
</AuthGuard>
```

### `AuthHydrator`

**File:** `src/components/auth/AuthHydrator.tsx`

Hydrates Redux auth state from SSR-resolved user or client-side `/auth/me` call.

```tsx
// In a protected layout.tsx (server component)
const user = await resolveUserFromCookie();

<AuthHydrator user={user}>
    {children}
</AuthHydrator>
```

### `GuestGuard`

**File:** `src/components/auth/GuestGuard.tsx`

Wraps auth pages. Redirects already-authenticated users to their dashboard.

---

## Layout Components

### `Sidebar`

Role-aware navigation sidebar. Accepts `role` prop and renders the appropriate nav sections. Handles logout.

```tsx
<Sidebar role="doctor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
```

### `Topbar`

Dashboard topbar with hamburger menu, notifications, and profile quick-access.

```tsx
<Topbar onMenuClick={() => setSidebarOpen(true)} />
```

### `AppShell`

Composes `Sidebar` + `Topbar` + main content area into the full dashboard layout.

---

## Adding New Reusable Components

Add to `src/components/ui/` when:
- The component has no domain-specific logic
- It's used in 2+ different feature areas
- It accepts only primitive or generic props

Do **not** add to `src/components/ui/`:
- Components with Redux dependencies
- Components tied to a specific feature (put them with the feature)
- Single-use wrappers that provide no real abstraction
