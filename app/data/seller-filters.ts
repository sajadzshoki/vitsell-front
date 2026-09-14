export type SellerFilterType =
  | 'text'
  | 'select'
  | 'multi'
  | 'boolean'
  | 'dateRange'
  | 'numberRange'

export type SellerFilterOption = {
  value: string
  label: string
}

export type SellerFilterDef = {
  /** Query key (and value key for simple filters) */
  key: string
  label: string
  type: SellerFilterType
  /** For select / multi */
  options?: SellerFilterOption[]
  /** Placeholder for text */
  placeholder?: string
  /** dateRange uses `${key}From` / `${key}To` unless overridden */
  fromKey?: string
  toKey?: string
  /** numberRange uses `${key}Min` / `${key}Max` unless overridden */
  minKey?: string
  maxKey?: string
}

export type SellerFilterValues = Record<string, string | string[] | boolean | null | undefined>

export function filterQueryKeys(def: SellerFilterDef): string[] {
  if (def.type === 'dateRange') {
    return [def.fromKey ?? `${def.key}From`, def.toKey ?? `${def.key}To`]
  }
  if (def.type === 'numberRange') {
    return [def.minKey ?? `${def.key}Min`, def.maxKey ?? `${def.key}Max`]
  }
  return [def.key]
}

export function parseFilterQuery(
  query: Record<string, unknown>,
  defs: SellerFilterDef[],
): SellerFilterValues {
  const values: SellerFilterValues = {}
  for (const def of defs) {
    if (def.type === 'dateRange') {
      const fromKey = def.fromKey ?? `${def.key}From`
      const toKey = def.toKey ?? `${def.key}To`
      values[fromKey] = firstString(query[fromKey])
      values[toKey] = firstString(query[toKey])
      continue
    }
    if (def.type === 'numberRange') {
      const minKey = def.minKey ?? `${def.key}Min`
      const maxKey = def.maxKey ?? `${def.key}Max`
      values[minKey] = firstString(query[minKey])
      values[maxKey] = firstString(query[maxKey])
      continue
    }
    if (def.type === 'multi') {
      values[def.key] = toStringArray(query[def.key])
      continue
    }
    if (def.type === 'boolean') {
      const raw = firstString(query[def.key])
      if (raw === '1' || raw === 'true') values[def.key] = true
      else if (raw === '0' || raw === 'false') values[def.key] = false
      else values[def.key] = null
      continue
    }
    values[def.key] = firstString(query[def.key])
  }
  return values
}

export function filterValuesToQuery(
  values: SellerFilterValues,
  defs: SellerFilterDef[],
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {}
  for (const def of defs) {
    for (const key of filterQueryKeys(def)) {
      const value = values[key]
      if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
        out[key] = undefined
        continue
      }
      if (typeof value === 'boolean') {
        out[key] = value ? '1' : '0'
        continue
      }
      out[key] = value as string | string[]
    }
  }
  return out
}

export function countActiveFilters(values: SellerFilterValues, defs: SellerFilterDef[]): number {
  let count = 0
  for (const def of defs) {
    if (def.type === 'dateRange' || def.type === 'numberRange') {
      const keys = filterQueryKeys(def)
      if (keys.some(k => hasValue(values[k]))) count += 1
      continue
    }
    if (hasValue(values[def.key])) count += 1
  }
  return count
}

export function clearFilterValues(defs: SellerFilterDef[]): SellerFilterValues {
  const values: SellerFilterValues = {}
  for (const def of defs) {
    if (def.type === 'multi') {
      values[def.key] = []
      continue
    }
    if (def.type === 'boolean') {
      values[def.key] = null
      continue
    }
    for (const key of filterQueryKeys(def)) {
      values[key] = ''
    }
  }
  return values
}

function firstString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '')
  if (value == null) return ''
  return String(value)
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (value == null || value === '') return []
  return String(value).split(',').map(s => s.trim()).filter(Boolean)
}

function hasValue(value: unknown): boolean {
  if (value == null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  return true
}

/** Product list filter definitions (query-synced) */
export const sellerProductFilterDefs: SellerFilterDef[] = [
  {
    key: 'q',
    label: 'جستجو',
    type: 'text',
    placeholder: 'جستجوی محصول',
  },
  {
    key: 'status',
    label: 'وضعیت',
    type: 'select',
    options: [
      { value: 'all', label: 'همه' },
      { value: 'active', label: 'فعال' },
      { value: 'inactive', label: 'غیرفعال' },
      { value: 'out_of_stock', label: 'ناموجود' },
    ],
  },
  {
    key: 'category',
    label: 'دسته‌بندی',
    type: 'select',
    options: [],
  },
  {
    key: 'brand',
    label: 'برند',
    type: 'select',
    options: [],
  },
  {
    key: 'stock',
    label: 'وضعیت موجودی',
    type: 'select',
    options: [
      { value: 'all', label: 'همه' },
      { value: 'in_stock', label: 'موجود' },
      { value: 'low_stock', label: 'کم‌موجود' },
      { value: 'out_of_stock', label: 'ناموجود' },
    ],
  },
  {
    key: 'price',
    label: 'بازه قیمت',
    type: 'numberRange',
    minKey: 'priceMin',
    maxKey: 'priceMax',
  },
  {
    key: 'created',
    label: 'بازه تاریخ',
    type: 'dateRange',
    fromKey: 'dateFrom',
    toKey: 'dateTo',
  },
  {
    key: 'hasDiscount',
    label: 'دارای تخفیف',
    type: 'boolean',
  },
  {
    key: 'hasVariants',
    label: 'دارای واریانت',
    type: 'boolean',
  },
  {
    key: 'featured',
    label: 'ویژه',
    type: 'boolean',
  },
  {
    key: 'published',
    label: 'منتشر شده',
    type: 'boolean',
  },
]
