# Frontend Rules

Conventions and rules for this project. Read this before contributing.

---

## Core Principles

1. **Don't change working code without a clear reason.** Refactoring for the sake of refactoring introduces bugs.
2. **Keep it simple.** If a solution requires a paragraph to explain, reconsider it.
3. **Colocate.** Logic lives close to where it's used, not in a distant abstraction.
4. **No dead code.** Delete old implementations — don't comment them out.

---

## Architecture Rules

### ❌ Do NOT introduce

- Repository pattern
- Use Case layer / Domain layer / Entity layer
- Dependency Injection containers
- Feature-sliced architecture (FSD)
- Hexagonal / Onion / Clean Architecture
- CQRS
- Any other enterprise pattern not already present

The architecture is intentionally simple. Adding layers adds maintenance cost without proportional benefit at this scale.

### ✅ What IS acceptable

- TypeScript interfaces and types (in `src/types/` or co-located)
- Custom hooks when the same logic appears in 2+ components
- Small pure utility functions in `src/lib/`
- Additional Redux slices following the existing `service → thunk → slice` pattern

---

## Component Rules

### Responsibility
Each component should do one thing. If you're adding a second `useEffect` that does something unrelated, extract a component or hook.

### State
- Keep state **local** unless it needs to be shared.
- Don't duplicate state: if you can derive a value, don't store it.
- Don't use `useEffect` to sync state between two pieces of local state — use derived values instead.

### Props
- Don't pass more than 5-6 props to a component. If you need more, reconsider the component boundary.
- Avoid prop drilling beyond 2 levels — use Redux or React Context.

### Memoization
- Don't memoize by default.
- Memoize (`useMemo`, `useCallback`, `React.memo`) **only** when you have measured a real performance problem.

---

## Redux Rules

### When to use Redux
Use Redux for state that is:
- Shared across multiple unrelated components
- Needed across route boundaries
- Related to authentication

### When NOT to use Redux
- Local UI state (open/close, tab selection, form values)
- Data fetched by a single Server Component — just fetch it server-side

### Slice pattern
Always follow this pattern:

```
authService.ts   →  pure API calls (axios)
authThunk.ts     →  createAsyncThunk wrappers with error handling
authSlice.ts     →  createSlice with reducers and extraReducers
```

### Typed hooks
Always use `useAppDispatch` and `useAppSelector` — never raw `useDispatch`/`useSelector`.

```ts
// ✅ Correct
const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);

// ❌ Wrong
const dispatch = useDispatch<AppDispatch>();
const user = useSelector((state: RootState) => state.auth.user);
```

---

## TypeScript Rules

- **No `any`** unless there is genuinely no better option. Use `unknown` and narrow.
- Catch block errors should use `unknown`, not `any`:
  ```ts
  // ✅
  catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
  }
  ```
- All component props should be typed with an interface.
- API response shapes should be typed or use `ApiResponse<T>` from `src/types/`.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `DoctorCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuthState.ts` |
| Services | camelCase with `Service` suffix | `authService.ts` |
| Types/Interfaces | PascalCase | `AuthState`, `User` |
| Constants | SCREAMING_SNAKE_CASE | `ROLE_DASHBOARD` |
| CSS classes | kebab-case | `.nav-item`, `.sidebar-logo` |

---

## File Rules

- **Delete, don't comment out.** Old implementations should be removed. Use git history to recover them.
- **No `console.log` in production code.** Use `console.error` only for genuine error cases.
- Imports should be grouped: external packages → internal absolute (`@/`) → relative (`./`).

---

## Forms

- Always disable the submit button while a request is pending (`isLoading`).
- Always show a user-friendly error message on failure.
- Validate client-side before sending the request — don't rely solely on server validation for UX.
- Use the `Button` component's `isLoading` prop for consistent loading states.

---

## Styling

- Use Tailwind utility classes as the primary styling approach.
- Use vanilla CSS (in `.css` files) for complex layout patterns (dashboard sidebar, topbar).
- Do not mix inline `style` objects with Tailwind classes on the same element unless unavoidable.
- Never hardcode colors as hex values in JSX — use Tailwind color tokens.
