# Technolife Product Importer

See the canonical documentation in the backend repo:

`digishop-back/docs/technolife-importer.md`

## Admin UI

- Route: `/seller/importer/technolife`
- Permission: `products.import`
- Nav: کاتالوگ → ایمپورت تکنولایف

## API (via `useSellerTechnolifeImport`)

- `POST /seller/importers/technolife/preview`
- `POST /seller/importers/technolife/import`
- `GET /seller/importers/technolife/imports`
- `GET /seller/importers/technolife/imports/:id`
- `POST /seller/importers/technolife/imports/:id/retry`
