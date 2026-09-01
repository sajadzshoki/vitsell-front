# Admin Phase 4 — Taxonomy, Brands, Attributes & Media Library

Frontend-first completion of category taxonomy, brands, dynamic attributes, and a shared media library for the seller admin panel.

## Goals

- Finish multi-level category management (not rebuild Phase 2)
- Brands + shared SEO
- Attributes with category assignment + filter/variant flags
- One Media Library + reusable MediaPicker (no per-module upload stacks)

## Routes

| Module | Path |
|---|---|
| Categories | `/seller/categories`, `/new`, `/:id` |
| Brands | `/seller/brands`, `/new`, `/:id` (detail + edit) |
| Attributes | `/seller/attributes`, `/new`, `/:id` |
| Media | `/seller/media` |

## Categories

- Independent Create/Edit form (`parentId`, root option, image, page hero/banner, status, sort, SEO via `TheSellerSeoFields`)
- Unlimited tree via `parentId` + `categoryParentOptions` (blocks self/descendant parents)
- List: tree/flat, expand/collapse, search, status/parent filters, product & attribute counts, bulk activate/deactivate, CSV export
- Safe delete: blocked when children exist or products reference the category
- Category ↔ attribute assignment on form (`categoryIds` on attributes)

## Brands

- FE store (`seller-brands` / `useSellerBrands`) with SEO meta
- List: search, status, product count, bulk, export
- Detail tabs: info, products, SEO, edit
- Logo via shared `ImageUpload` (+ library picker)

## Attributes

- Dynamic types/values (Phase 2 base)
- Flags: `filterable`, `searchable`, `variantDefining`
- `categoryIds`: empty = all categories
- Values: label, value, slug, sort, status, color meta when useful
- Variant editor prefers category-scoped + `variantDefining` attributes

## Media

- `seller-media` / `useSellerMedia` — upload via `POST /upload`, metadata in session state
- `TheSellerMediaLibrary` — grid/list, search, type/date filters, detail panel, bulk delete
- `TheSellerMediaPicker` — single/multi select for forms
- `ImageUpload` — «از کتابخانه» when `media.view`

## Permissions

`categories.*`, `brands.*`, `attributes.*`, `media.view|upload|update|delete|manage`

`media.manage` expands to view + upload + update + delete.

## Backend used

- Categories: `GET/POST/PUT/DELETE` `/seller/categories`
- Upload: `POST /upload`
- Products (counts / links): existing product list APIs

## FE overlays / gaps

- Brand / Attribute / Media entities are not in Prisma/`types/models.ts` yet
- Category `parentId` / `status` / `seo` may not fully persist on all backends — FE payload prepared
- Media usage hints are optional; UI never claims “unused” without data
- No separate global admin search module yet — list filters only

## Key files

- `app/data/seller-categories.ts`, `seller-brands.ts`, `seller-attributes.ts`, `seller-media.ts`
- `app/composables/useSellerCategories.ts`, `useSellerBrands.ts`, `useSellerAttributes.ts`, `useSellerMedia.ts`
- `app/components/TheSeller/Categories.vue`, `CategoryForm.vue`, `Brands.vue`, `BrandForm.vue`, `BrandDetail.vue`, `Attributes.vue`, `AttributeForm.vue`, `MediaLibrary.vue`, `MediaPicker.vue`, `ImageUpload.vue`, `ProductVariantsEditor.vue`
