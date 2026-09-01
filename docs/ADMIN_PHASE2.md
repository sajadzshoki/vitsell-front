# Admin Phase 2 — Products, Variants, Inventory

Frontend-first commerce catalog upgrades for `/seller`. Backend listing/product/category APIs remain the source of truth where they exist; attributes, brands, warehouses, stock movements, and product variants/SEO commerce fields use session `useState` until APIs ship.

## Modules

| Area | Routes | Persistence |
|---|---|---|
| Products list/filters/bulk | `/seller/products` | Listings API + commerce overlay |
| Product form (tabs) | `/seller/products/new`, `…/:id` | Listing mutate + `useSellerProductCommerce` |
| Categories (tree list) | `/seller/categories` | Categories API + FE `parentId` |
| Brands | `/seller/brands` | FE mock |
| Attributes | `/seller/attributes` | FE mock |
| Inventory | `/seller/inventory` | Listings + commerce variants |
| Stock movements | `/seller/inventory/movements` | FE mock (+ append on adjust) |
| Warehouses | `/seller/warehouses` | FE mock |

## Key files

- Data: `seller-attributes`, `seller-brands`, `seller-inventory`, `seller-product-variants`, expanded `seller-filters`
- Composables: `useSellerAttributes`, `useSellerBrands`, `useSellerInventory`, `useSellerProductCommerce`
- Components: `TheSellerAttributes|Brands|Inventory|Warehouses|StockMovements|ProductVariantsEditor`, upgraded `Products`, `ProductForm`, `Categories`

## Permissions

Uses existing RBAC keys: `products.*`, `categories.*`, `brands.*`, `attributes.*`, `inventory.*`, `warehouses.*` via `sellerNavPermissionMap` / `sellerRoutePermissionMap` / `can()`.

## Backend gaps

- No Attribute / Brand / Warehouse / StockMovement entities in `types/models.ts`
- Product variants not on Product schema (`colors`/`specs` JSON only)
- Category `parentId` prepared on FE; confirm Adonis migration before relying on tree in production
- Listing has no `createdAt` for date-range filter yet
