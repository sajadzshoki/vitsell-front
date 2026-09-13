# Admin Phase 9 — Production Readiness

Frontend QA / UX polish / security boundaries for the vitsell Super Admin panel (`/seller`). No architecture rewrite; no new feature dump.

## Status

**READY WITH BACKEND GAPS**

The admin UI is cohesive enough for operational use against existing APIs, with FE overlays and permission gates. Production launch still depends on backend APIs listed below (staff RBAC, persistence for FE-only modules, immutable audit, payment secrets stays server-side).

---

## What this phase did

### Critical fixes

| Issue | Fix |
|---|---|
| Dashboard `/seller` skipped route permission | `seller-permission.global.ts` requires `dashboard.view` |
| Temporary password field on AdminForm | Removed (password via account/auth only) |
| Unsaved leave missing on Product / Page / Campaign forms | Shared `useSellerUnsavedGuard` + dirty snapshots |
| Dead analytics `comingSoon` nav | Removed from `sellerNavGroups` |
| Command palette recent items without `to` / raw product ids | Recent stores `{ label, to }`; product titles via `resolveProduct` |
| Shop → settings redirect lost history | `navigateTo(..., { replace: true })` |

### UX consistency

- `TheSellerEmptyState` optional `title`; applied on Banners, Deals, Notifications, Promotions, Roles (+ create CTA)
- Deals money display uses `formatPrice` (not ad-hoc `toLocaleString`)
- Search button in seller layout: `aria-label` for icon-only control

### Shared utilities

- `app/composables/useSellerUnsavedGuard.ts` — dirty navigation confirm; call `allowNextNavigation()` after successful save

---

## Production readiness checklist

### Functional

- [x] Routes / deep links under `/seller`
- [x] CRUD patterns for wired modules
- [x] Shared filters / list query where adopted
- [x] Global search (Ctrl/Cmd+K) with RBAC filtering
- [x] Pagination on major lists
- [ ] Full server persistence for FE-overlay modules (see gaps)

### UX

- [x] Loading / empty patterns on major lists
- [x] Unsaved guards on key editors (product, page, campaign, blog, settings)
- [x] Contextual delete confirmations on sensitive flows
- [ ] Widget-level error boundaries (Nuxt/Vue: recover via forbidden + toasts; no app-wide crash boundary library)

### Security (frontend)

- [x] Nav + route permission maps
- [x] Dashboard gate
- [x] Command palette respects `can(...)`
- [x] No temporary password / gateway secrets in FE forms
- [ ] Server-enforced abilities on every mutate (backend)

### Quality

- [x] Targeted consistency (empty, money format, a11y label)
- [ ] Typecheck / lint scripts not defined in `package.json` (validate via `build:admin`)

---

## Backend integration gaps

### CRITICAL (block production)

| Feature | Frontend state | Missing backend |
|---|---|---|
| Staff RBAC | Roles/permissions UI + FE `can()` | Staff admins/roles/abilities APIs; `/auth/me` abilities |
| Admin users mutate | FE session + forms | Create/update/suspend admin API (no password in FE) |
| Audit immutability | FE appendable store | Server-side append-only audit; query API |
| Payment / gateway secrets | UI links only; no secrets stored | Server vault; never expose to client |
| Orders / payments money truth | Derived FE + existing order APIs | Authoritative refund/settlement APIs where not wired |

### IMPORTANT (full functionality)

| Feature | Frontend state | Missing backend |
|---|---|---|
| Banners CRUD | FE state + storefront bridge when seeded | Banner CRUD API |
| Automatic discounts & campaigns | FE-only | Persist + evaluate stacking rules |
| Coupon overlay fields | Extra FE fields on discount codes | API accept targeting / fixed amount / usage stats |
| Attributes / brands / warehouses / variants commerce | Session `useState` overlays | Dedicated catalog APIs |
| CMS blog / pages / SEO extras | Mix of API + FE | Persist SEO overrides, publish pipeline |
| Platform settings / navigation / imports | FE hubs | Persistence + import job APIs |
| Notifications delivery receipts | Send UI | Delivery/status webhooks |

### OPTIONAL (enhancement)

| Feature | Notes |
|---|---|
| 2FA / failed-login feed | System overview placeholders |
| Table virtualization | Not needed until very large datasets |
| Widget error boundaries | Optional per-dashboard-card try/retry |
| Column visibility / sticky tables | Only where lists grow large |

---

## Role smoke matrix (frontend)

| Role | Expect |
|---|---|
| SUPER_ADMIN | Full nav when abilities include `*` / all keys |
| ADMIN | Broad manage minus locked system keys per catalog |
| PRODUCT_MANAGER | Products/catalog/inventory; no finance/admins |
| ORDER_MANAGER | Orders/customers/returns/refunds; limited catalog |
| MARKETING_MANAGER | Marketing/deals/banners/notifications |
| CONTENT_MANAGER | Blog/pages/SEO/media |
| FINANCE_MANAGER | Finance/payments/reports |
| SUPPORT_MANAGER | Customers/questions/reviews; limited mutate |

Frontend hides nav/actions and blocks routes; **backend must reject unauthorized mutates**.

---

## Manual QA focus (Phase 9)

Products · Orders · Customers · Marketing · CMS · Finance · Admins/Roles/Settings · Global search · Audit · Import/Export · Mobile/tablet sidebar · Restricted role vs SUPER_ADMIN

---

## Remaining issues (non-blocking for UI ship)

- BlogForm / SettingsHub still use local `onBeforeRouteLeave` (same UX; not yet on shared composable)
- No dedicated `npm run typecheck` / `lint` scripts
- Some list pages still use lighter empty messaging than others
- FE-only modules lose state on full reload until APIs exist

## Do not

Phase 9 is closed. Do not start Phase 10 or unrelated feature work from this doc alone.
