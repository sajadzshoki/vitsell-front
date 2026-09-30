import { toSearchRoute } from '~/data/categories'
import type { Category } from '~/data/categories'
import type { Product } from '~/data/products'

/** Display brand (FA) → aliases used for matching typed queries. */
export const SEARCH_BRAND_ALIASES: Record<string, string[]> = {
  سامسونگ: ['samsung', 'سامسونگ'],
  اپل: ['apple', 'اپل'],
  شیائومی: ['xiaomi', 'شیائومی', 'شیاومی'],
  پوکو: ['poco', 'پوکو'],
  هوآوی: ['huawei', 'هوآوی', 'هواوی'],
  آنر: ['honor', 'آنر', 'انر'],
  نوکیا: ['nokia', 'نوکیا'],
  گوگل: ['google', 'گوگل', 'pixel'],
  ناتینگ: ['nothing', 'ناتینگ'],
  ریلمی: ['realme', 'ریلمی'],
  اوپو: ['oppo', 'اوپو'],
  ویوو: ['vivo', 'ویوو'],
  موتورولا: ['motorola', 'موتورولا'],
  ایسوس: ['asus', 'ایسوس'],
  لنوو: ['lenovo', 'لنوو'],
  'اچ‌پی': ['hp', 'اچ پی', 'اچ‌پی'],
  دل: ['dell', 'دل'],
  سونی: ['sony', 'سونی'],
  'ال‌جی': ['lg', 'ال جی', 'ال‌جی'],
  'جی‌بی‌ال': ['jbl', 'جی بی ال', 'جی‌بی‌ال'],
  تکنو: ['tecno', 'تکنو'],
}

export type SearchScopeHint = {
  id: string
  kind: 'brand' | 'category' | 'query-in-category'
  /** Final display label (already interpolated). */
  label: string
  icon: string
  to: ReturnType<typeof toSearchRoute>
}

function toEnDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

export function normalizeSearchHintText(input: string) {
  return toEnDigits(String(input || ''))
    .replace(/\u064A/g, '\u06CC')
    .replace(/\u0643/g, '\u06A9')
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function brandAliasHit(queryNorm: string, aliasNorm: string) {
  if (!aliasNorm) return false
  // Short Latin tokens (hp, lg, …) — exact only
  if (/^[a-z0-9]{1,3}$/.test(aliasNorm)) return queryNorm === aliasNorm
  if (queryNorm === aliasNorm) return true
  if (aliasNorm.length >= 3 && queryNorm.includes(aliasNorm)) return true
  if (queryNorm.length >= 3 && aliasNorm.includes(queryNorm)) return true
  return false
}

/** Resolve typed query to a canonical Persian brand name when possible. */
export function matchSearchBrand(
  query: string,
  extraBrandNames: string[] = [],
): string | null {
  const q = normalizeSearchHintText(query)
  if (!q || q.length < 2) return null

  for (const [canonical, aliases] of Object.entries(SEARCH_BRAND_ALIASES)) {
    const pool = [canonical, ...aliases].map(normalizeSearchHintText)
    if (pool.some(a => brandAliasHit(q, a))) return canonical
  }

  for (const name of extraBrandNames) {
    const n = normalizeSearchHintText(name)
    if (!n || n.length < 2) continue
    if (brandAliasHit(q, n)) return name.trim()
  }

  return null
}

function matchCategoriesByName(query: string, categories: Category[]): Category[] {
  const q = normalizeSearchHintText(query)
  if (!q || q.length < 2) return []

  return categories
    .filter((cat) => {
      const name = normalizeSearchHintText(cat.name)
      if (!name) return false
      return name.includes(q) || (q.length >= 3 && q.includes(name))
    })
    .slice(0, 4)
}

function categoriesFromProducts(
  products: Product[],
  getCategoryById: (id: string) => Category | undefined,
): Category[] {
  const seen = new Set<string>()
  const out: Category[] = []
  for (const p of products) {
    const id = String(p.category || '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    const cat = getCategoryById(id)
    if (cat) out.push(cat)
    else if (p.categoryLabel) {
      out.push({
        id,
        name: p.categoryLabel,
        icon: 'category',
        parentId: null,
        image: null,
        text: null,
        subs: [],
      })
    }
    if (out.length >= 4) break
  }
  return out
}

/**
 * Digikala-style scoped search rows for the navbar suggest dropdown.
 * Prefer «query in category» links, then brand, above product hits.
 */
export function buildSearchScopeHints(input: {
  query: string
  categories: Category[]
  products: Product[]
  getCategoryById: (id: string) => Category | undefined
  /** i18n `t` — falls back to simple `{param}` replacement when missing. */
  t: (key: string, params?: Record<string, unknown>) => string
  max?: number
}): SearchScopeHint[] {
  const q = input.query.trim()
  if (!q) return []
  const max = input.max ?? 5
  const hints: SearchScopeHint[] = []
  const used = new Set<string>()
  const { t } = input

  function label(key: string, params: Record<string, string>) {
    const raw = t(key, params)
    if (raw && raw !== key && !/\{[a-z]+\}/i.test(raw)) return raw
    let out = key
    for (const [k, v] of Object.entries(params)) {
      out = out.split(`{${k}}`).join(v)
    }
    return out
  }

  const push = (hint: SearchScopeHint) => {
    if (used.has(hint.id) || hints.length >= max) return
    used.add(hint.id)
    hints.push(hint)
  }

  const productBrands = input.products.map(p => p.brand).filter(Boolean)
  const matchedBrand = matchSearchBrand(q, productBrands)
  const matchedBrandNorm = matchedBrand ? normalizeSearchHintText(matchedBrand) : ''

  const nameMatched = matchCategoriesByName(q, input.categories)

  // «جستجوی q در دسته» — Digikala-style primary scoped rows
  const scopeCats = [
    ...categoriesFromProducts(input.products, input.getCategoryById),
    ...nameMatched,
  ]
  const seenCat = new Set<string>()
  for (const cat of scopeCats) {
    if (seenCat.has(cat.id)) continue
    seenCat.add(cat.id)
    const catNorm = normalizeSearchHintText(cat.name)
    // Brand-named child categories (e.g. mobile-samsung) → use brand hint instead
    if (matchedBrandNorm && catNorm === matchedBrandNorm) continue

    const sameName = catNorm === normalizeSearchHintText(q)
    if (sameName) {
      push({
        id: `category:${cat.id}`,
        kind: 'category',
        label: label('در دسته {category}', { category: cat.name }),
        icon: 'i-tabler-category',
        to: toSearchRoute({ category: cat.id }),
      })
      continue
    }
    push({
      id: `q-cat:${cat.id}`,
      kind: 'query-in-category',
      label: label('جستجوی «{q}» در {category}', { q, category: cat.name }),
      icon: 'i-tabler-search',
      to: toSearchRoute({ q, category: cat.id }),
    })
  }

  // Remaining name-matched categories not already covered
  for (const cat of nameMatched) {
    const catNorm = normalizeSearchHintText(cat.name)
    if (matchedBrandNorm && catNorm === matchedBrandNorm) continue
    push({
      id: `category:${cat.id}`,
      kind: 'category',
      label: label('در دسته {category}', { category: cat.name }),
      icon: 'i-tabler-category',
      to: toSearchRoute({ category: cat.id }),
    })
  }

  if (matchedBrand) {
    push({
      id: `brand:${matchedBrand}`,
      kind: 'brand',
      label: label('در برند {brand}', { brand: matchedBrand }),
      icon: 'i-tabler-tag',
      to: toSearchRoute({ brands: matchedBrand }),
    })
  }

  return hints
}
