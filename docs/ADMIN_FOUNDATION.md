# Admin panel foundation

Frontend Super Admin foundations for vitsell. Routes stay under `/seller`; identity remains site admin (single vendor), not marketplace.

See also: [ADMIN_SEPARATION.md](./ADMIN_SEPARATION.md), [ROUTES.md](./ROUTES.md), `.cursor/skills/seller/SKILL.md`.

## Phase status

| Phase | Focus | Status |
|-------|--------|--------|
| 0 | Shell, nav groups, filters, SEO, category parentId prep, RBAC types | done |
| 1 | Dashboard analytics, Admin users, Roles UI, permission gates, audit foundation | done |
| 2–7 | Catalog, orders, taxonomy, marketing, CMS/SEO, finance | done |
| 8 | Super admin, settings hub, search, import/export, RBAC completion | done |

## Module status

| Module | UI | Persistence | Notes |
|--------|----|-------------|-------|
| Dashboard | yes | API + derived/mock KPIs | Charts, alerts, activity, quick actions |
| Products / Orders / … | yes | API | Permission-aware actions |
| Admin users | yes | **local mock** | `/seller/admins` |
| Roles & permissions | yes | **local mock** | Configurable roles + SUPER_ADMIN protection |
| Audit logs | yes | **local mock** | `/seller/audit` + append from admin/role mutations |
| Account | yes | session + mock roles | Role preview for SUPER_ADMIN |

## RBAC

- Catalog: `app/data/seller-permissions.ts` (grouped, expandable `.manage` aliases)
- Roles store: `useSellerRoles` / `seller-roles.ts`
- Admins store: `useSellerAdmins` / `seller-admins.ts`
- Checks: `useSellerPermissions().can / canAny / canAll`
- Nav filter + `seller-permission.global.ts` → `/seller/forbidden`
- SUPER_ADMIN cannot be locked out (last active super protected)

## Backend gaps

- Staff admins / roles / permissions APIs
- Abilities on `/auth/me`
- Dashboard analytics endpoints
- Audit log API
- Customer metrics API

## Validation

`npm run build:admin`
