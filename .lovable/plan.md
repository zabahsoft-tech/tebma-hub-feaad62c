## Goal

Make the admin sign-in keep users logged in across browser restarts, with an explicit "Remember me" choice, plus a few auth-page quality upgrades.

## What changes

**1. Remember me checkbox on `/auth`**
- Add a styled checkbox ("Keep me signed in") to the sign-in form, checked by default.
- Remember the last used email in `localStorage` and pre-fill it on return visits.

**2. Session persistence behavior**
- Sessions already persist in browser storage and auto-refresh, so a signed-in admin stays signed in indefinitely — that stays the default when the box is checked.
- When the box is **unchecked**, store a "session-only" flag; on app start, if that flag is set and the browser was fully closed since (detected via a `sessionStorage` marker that dies with the tab), sign the user out before rendering. This gives a true "don't keep me signed in" behavior without touching the generated Supabase client.

**3. Already-signed-in handling**
- If a signed-in user opens `/auth`, redirect them straight to `/admin` (or the `redirect` search param) instead of showing the form.
- Show a small "Checking session…" state while that check runs, so no form flash.

**4. Forgot password**
- Add a "Forgot password?" link on the sign-in tab that sends a reset email.
- Add a public `/reset-password` route where the user sets a new password, then lands on `/admin`.

**5. Polish**
- Show/hide password toggle.
- Clearer inline error messages (invalid credentials vs. unconfirmed email).
- Disable the form and show a spinner while submitting.

## Technical notes

- `src/routes/auth.tsx`: add checkbox, remembered-email prefill, password visibility toggle, signed-in redirect via `supabase.auth.getUser()`, and forgot-password flow using `resetPasswordForEmail` with `redirectTo: ${origin}/reset-password`.
- New `src/lib/auth-persistence.ts`: helpers for the remember flag and the browser-restart detection; called once in `src/routes/__root.tsx` on mount (client-only).
- New `src/routes/reset-password.tsx`: public route calling `supabase.auth.updateUser({ password })`.
- No database or server-function changes; the generated Supabase client stays untouched.
