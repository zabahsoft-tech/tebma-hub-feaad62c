# Fix certificate verification + editable certificate codes

## What's wrong

The verification result page is blank. The lookup itself works — the server returns the right certificate for `TBM-2026-B8P3XF` — but the page never renders it.

Cause: `/verify` and `/verify/{code}` are set up so the `/verify` page acts as the parent of the result page, and the parent never makes room for the child page to appear. So the result screen mounts into nothing and the user sees an empty page.

## Fix

1. Move the "enter a code / scan QR" screen into its own leaf page, and turn `/verify` into a thin wrapper that renders its child pages. `/verify` keeps working exactly as today; `/verify/{code}` will now show the result card.
2. Add a loading and an error state to the result page, so a slow or failed lookup shows a branded message instead of a blank screen.
3. Verify both a valid code, a revoked code, and a nonexistent code after the change.

## Editable certificate codes

### Code format setting
- Add a **Certificates** settings section (stored with the other site settings) with:
  - Code prefix (default `TBM`)
  - Whether to include the year
  - Random-part length (default 6)
  - A live preview of the resulting pattern, e.g. `TBM-2026-8829XK`
- The "New certificate" form's suggested code is generated from this setting instead of the hardcoded `TBM-` pattern. The field stays editable, so admins can always type their own code.

### Editing the code on existing certificates
- Keep the code field editable on the edit page, but add proper validation:
  - Required, uppercased and trimmed automatically
  - Allowed characters only (letters, numbers, hyphens), 4–40 characters
  - Duplicate check before saving, with a clear inline message ("This code is already used by another certificate") instead of a silent failure
- The QR preview on the edit page regenerates from the saved code, and a note warns that changing the code invalidates QR codes already printed on issued certificates.

## Technical notes

- Route restructure: `src/routes/verify.tsx` becomes a layout rendering `<Outlet />`; the current form UI moves to `src/routes/verify.index.tsx`. `src/routes/verify.$code.tsx` is unchanged apart from added `pendingComponent`/`errorComponent`.
- New nullable columns on the existing site settings table: `cert_code_prefix`, `cert_code_include_year`, `cert_code_random_length`; exposed through the existing admin settings server functions and read by the public/admin code generator.
- `adminUpsertCert` gains a slug-style uniqueness pre-check (excluding the current row on edit) returning a friendly error, mirroring the news slug validation already in place.
- Verification data path (`verifyCertificate` server function → `verify_certificate_by_code`) is unchanged; no security posture change.
