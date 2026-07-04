# TODO

## Admin sidebar + layout fixes
- [ ] Update `src/components/AdminSidebar.jsx` to remove unused lucide imports (use only the icons you render).
- [ ] Make sidebar links match the app routes (`/admin/dashboard`, `/admin/products`).
- [ ] Use `NavLink` (or consistent activeHref logic) so the correct item highlights.
- [ ] Ensure the admin blue/white design is applied (verify CSS import path).
- [ ] Update `src/pages/AdminLayout.jsx` to render the sidebar + outlet so all admin pages share layout.
- [ ] Update `src/App.jsx` to use `AdminLayout` and simplify routes to `/admin/*`.
- [ ] Run lint/build to confirm no ESLint errors.

