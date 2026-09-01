# Admin Phase 8 — Super Administration & Platform Configuration

Completes the digishop Super Admin foundation (single-vendor site admin under `/seller`).

## Mapping

| Area | Path |
|---|---|
| System overview | `/seller/system` |
| Settings hub | `/seller/settings` (`/seller/shop` redirects here) |
| Admins / Roles / Permissions catalog | `/seller/admins`, `/seller/roles`, `/seller/roles/permissions` |
| Audit / Activity | `/seller/audit`, `/seller/activity` (same audit store) |
| Navigation | `/seller/navigation` |
| Import / Export | `/seller/imports`, `/seller/exports` |
| Global search | Command palette (Ctrl/Cmd+K) in seller layout |
| SEO / Footer / Gateways | Existing Phase 6–7 routes (linked from settings) |

## RBAC

- New keys: `permissions.view`, `system.view|manage`, `navigation.view|update`, `imports.*`, `exports.*`
- Aliases: `admin_users.*` ↔ `admins.*`, `audit_logs.view` ↔ `audit.view`
- Role `SUPPORT_MANAGER` added; `SUPPORT_AGENT` kept for compatibility
- Admin status: `active | inactive | suspended` with self-lockout + last SUPER_ADMIN protection

## Settings

- Hub tabs over shop API identity + FE `seller-platform-settings`
- No secrets in FE; payments tab links to finance gateways

## Import / Export

- Import: CSV template → validate → confirm → history + audit (FE session apply markers)
- Export: center reuses `downloadSellerCsv`

## Backend gaps

- Staff admins/roles/abilities APIs; `/auth/me` abilities
- Platform settings / navigation / import persistence APIs
- Real integration health, 2FA, failed-login feed
- Server-side audit immutability
