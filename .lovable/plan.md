## Goal

Upgrade the `/admin` experience so the sidebar is fixed, collapsible, and mobile-friendly, and give the dashboard overview a richer, more useful landing view. Confirm forms already live on their own routes (not modals) and remove the last remaining native `confirm()` modal from the delete action.

## What changes

### 1. New admin shell built on shadcn `Sidebar`

Rewrite `src/components/admin/AdminShell.tsx` to use the shadcn `Sidebar` primitives already present in `src/components/ui/sidebar.tsx`:

- Wrap the layout in `SidebarProvider` with `defaultOpen` remembered via cookie (built-in behavior).
- `<Sidebar collapsible="icon">` — on desktop it collapses to a narrow icon rail; on mobile it becomes an off-canvas `Sheet` automatically.
- Sections in the sidebar:
  - Brand header with TEBMA mark + short label (label hides when collapsed).
  - **Content** group: Overview, News, Styles, Rules, Dictionary, Gallery.
  - **Operations** group: Certificates, Applications, Messages.
  - Footer: user email + sign-out button.
- Each item uses `SidebarMenuButton asChild` wrapping a TanStack `Link`, with `isActive` derived from `useRouterState` pathname (exact match for Overview, prefix match otherwise) and tooltip prop for the collapsed state.
- Sticky top app bar inside `SidebarInset` containing `SidebarTrigger` (always visible so users can collapse/expand on any screen), breadcrumb-style page title, and a "View public site" link.
- Uses `w-[var(--sidebar-width)]` explicit `var()` syntax where needed (Tailwind v4 sidebar-width fix).

### 2. Enhanced dashboard overview (`admin.index.tsx`)

Replace the plain card grid with a richer landing:

- Top row: 4 stat cards — Published articles, Disciplines, Pending applications, Unread messages — fed by a new `adminDashboardStats` server function that returns counts (uses existing admin Supabase client with `ensureAdmin`).
- Middle: "Recent applications" and "Recent messages" lists (5 each) linking to their respective admin pages.
- Bottom: quick-access card grid (existing content but restyled to match).

### 3. Inline delete confirmation (remove `window.confirm`)

`DataTable` in `src/components/admin/AdminForm.tsx` currently uses `confirm("Delete this record?")`. Replace it with an inline `AlertDialog` (shadcn) so no browser-native modal is used. Forms themselves are already dedicated pages (`admin.news.new.tsx`, `admin.news.$id.tsx`, etc.) — no changes needed there.

### 4. Small polish

- Page container (`AdminPage`) gets `max-w-none` and consistent horizontal padding so wide tables use the available width once the sidebar is collapsed.
- Active-link styling matches shadcn defaults instead of the custom black pill.
- Header row uses the responsive `grid-cols-[minmax(0,1fr)_auto]` pattern so titles never clip on mobile.

## Files touched

- `src/components/admin/AdminShell.tsx` — rewritten to use shadcn Sidebar.
- `src/components/admin/AdminForm.tsx` — swap `confirm()` for `AlertDialog`.
- `src/routes/_authenticated/admin.tsx` — unchanged export, still renders `AdminShell`.
- `src/routes/_authenticated/admin.index.tsx` — new stats + recents layout.
- `src/lib/admin.functions.ts` — add `adminDashboardStats` server function (counts + recents).

## Out of scope

- No changes to individual admin CRUD form routes (already page-based).
- No auth or RLS changes.
- No changes to the public site.
