export type SellerAttributeType =
  | 'text'
  | 'select'
  | 'multi_select'
  | 'boolean'
  | 'number'
  | 'color'
  | 'measurement'

export type SellerAttributeStatus = 'active' | 'inactive'

export type SellerAttributeValue = {
  id: string
  label: string
  value: string
  /** Hex for color type */
  meta?: string | null
  sortOrder: number
  status?: 'active' | 'inactive'
  slug?: string
}

export type SellerAttribute = {
  id: string
  name: string
  slug: string
  type: SellerAttributeType
  values: SellerAttributeValue[]
  status: SellerAttributeStatus
  sortOrder: number
  /** Show in storefront filters */
  filterable: boolean
  searchable: boolean
  /** Used to generate product variants */
  variantDefining: boolean
  /** Category ids this attribute is assigned to (empty = all/unscoped) */
  categoryIds: string[]
  createdAt: string
  updatedAt: string
}

export type SellerAttributeFormValues = {
  id: string
  name: string
  slug: string
  type: SellerAttributeType
  values: SellerAttributeValue[]
  status: SellerAttributeStatus
  sortOrder: number
  filterable: boolean
  searchable: boolean
  variantDefining: boolean
  categoryIds: string[]
}

export const sellerAttributeTypeMeta: Record<SellerAttributeType, { label: string }> = {
  text: { label: 'متن' },
  select: { label: 'انتخابی' },
  multi_select: { label: 'چند انتخابی' },
  boolean: { label: 'بله/خیر' },
  number: { label: 'عدد' },
  color: { label: 'رنگ' },
  measurement: { label: 'اندازه/مقدار' },
}

export const attributeSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function emptyAttributeValue(index = 0): SellerAttributeValue {
  return {
    id: `val-${Date.now()}-${index}`,
    label: '',
    value: '',
    meta: null,
    sortOrder: index,
    status: 'active',
  }
}

export function emptyAttributeForm(): SellerAttributeFormValues {
  return {
    id: '',
    name: '',
    slug: '',
    type: 'select',
    values: [emptyAttributeValue(0), emptyAttributeValue(1)],
    status: 'active',
    sortOrder: 0,
    filterable: true,
    searchable: false,
    variantDefining: true,
    categoryIds: [],
  }
}

export function toAttributeForm(attr: SellerAttribute): SellerAttributeFormValues {
  return {
    id: attr.id,
    name: attr.name,
    slug: attr.slug,
    type: attr.type,
    values: attr.values.map(v => ({ ...v })),
    status: attr.status,
    sortOrder: attr.sortOrder,
    filterable: attr.filterable ?? true,
    searchable: attr.searchable ?? false,
    variantDefining: attr.variantDefining ?? true,
    categoryIds: [...(attr.categoryIds ?? [])],
  }
}

export function buildDefaultSellerAttributes(): SellerAttribute[] {
  const now = new Date().toISOString()
  const base = {
    filterable: true,
    searchable: false,
    variantDefining: true,
    categoryIds: [] as string[],
    createdAt: now,
    updatedAt: now,
  }
  return [
    {
      id: 'attr-color',
      name: 'رنگ',
      slug: 'color',
      type: 'color',
      status: 'active',
      sortOrder: 0,
      ...base,
      categoryIds: ['mobile', 'fashion'],
      values: [
        { id: 'color-red', label: 'قرمز', value: 'red', meta: '#b91c1c', sortOrder: 0, status: 'active' },
        { id: 'color-blue', label: 'آبی', value: 'blue', meta: '#2563eb', sortOrder: 1, status: 'active' },
        { id: 'color-black', label: 'مشکی', value: 'black', meta: '#1c1c1e', sortOrder: 2, status: 'active' },
        { id: 'color-white', label: 'سفید', value: 'white', meta: '#f5f5f0', sortOrder: 3, status: 'active' },
      ],
    },
    {
      id: 'attr-size',
      name: 'سایز',
      slug: 'size',
      type: 'select',
      status: 'active',
      sortOrder: 1,
      ...base,
      categoryIds: ['fashion'],
      values: [
        { id: 'size-s', label: 'S', value: 's', sortOrder: 0, status: 'active' },
        { id: 'size-m', label: 'M', value: 'm', sortOrder: 1, status: 'active' },
        { id: 'size-l', label: 'L', value: 'l', sortOrder: 2, status: 'active' },
        { id: 'size-xl', label: 'XL', value: 'xl', sortOrder: 3, status: 'active' },
      ],
    },
    {
      id: 'attr-storage',
      name: 'حافظه داخلی',
      slug: 'storage',
      type: 'select',
      status: 'active',
      sortOrder: 2,
      ...base,
      categoryIds: ['mobile', 'laptop'],
      values: [
        { id: 'st-128', label: '۱۲۸ گیگابایت', value: '128gb', sortOrder: 0, status: 'active' },
        { id: 'st-256', label: '۲۵۶ گیگابایت', value: '256gb', sortOrder: 1, status: 'active' },
        { id: 'st-512', label: '۵۱۲ گیگابایت', value: '512gb', sortOrder: 2, status: 'active' },
      ],
    },
    {
      id: 'attr-ram',
      name: 'رم',
      slug: 'ram',
      type: 'select',
      status: 'active',
      sortOrder: 3,
      ...base,
      categoryIds: ['mobile', 'laptop'],
      values: [
        { id: 'ram-8', label: '۸ گیگابایت', value: '8gb', sortOrder: 0, status: 'active' },
        { id: 'ram-12', label: '۱۲ گیگابایت', value: '12gb', sortOrder: 1, status: 'active' },
        { id: 'ram-16', label: '۱۶ گیگابایت', value: '16gb', sortOrder: 2, status: 'active' },
      ],
    },
  ]
}

/** Cartesian product of attribute value selections → combination rows */
export function generateVariantCombinations(
  axes: { attributeId: string, attributeName: string, values: SellerAttributeValue[] }[],
): { key: string, options: { attributeId: string, attributeName: string, valueId: string, label: string }[] }[] {
  if (!axes.length || axes.some(a => !a.values.length)) return []

  let combos: { attributeId: string, attributeName: string, valueId: string, label: string }[][] = [[]]
  for (const axis of axes) {
    const next: typeof combos = []
    for (const prefix of combos) {
      for (const value of axis.values) {
        next.push([
          ...prefix,
          {
            attributeId: axis.attributeId,
            attributeName: axis.attributeName,
            valueId: value.id,
            label: value.label,
          },
        ])
      }
    }
    combos = next
  }

  return combos.map(options => ({
    key: options.map(o => o.valueId).join('__'),
    options,
  }))
}
