import type { Category, CategorySub } from '~/data/categories'
import type {
  CategoryPageMeta,
  CategorySuggestedItem,
} from '~/data/category-pages'
import { emptySeoMeta, sanitizeSeoMeta, seoMetaFromCategoryHeading, type SeoMeta } from '~/data/seo'
import { resolveSellerAdminIconName, isSellerAdminIconImage } from '~/data/seller-admin-icons'

export type SellerCategoryStatus = 'active' | 'inactive'

/** Sentinel for USelect — empty string crashes Reka SelectItem */
export const SELLER_CATEGORY_ROOT_PARENT = '__root__'

export type SellerCategory = {
  id: string
  name: string
  icon: string
  image: string | null
  text: string | null
  /** Tree field — backend `parent_id` */
  parentId: string | null
  status: SellerCategoryStatus
  sortOrder: number
  /** Indexable SEO — parallel to pageMeta.seo body content */
  seo: SeoMeta | null
  subs: CategorySub[]
  pageMeta: CategoryPageMeta | null
  suggested: CategorySuggestedItem[] | null
  createdAt: string | null
  updatedAt: string | null
}

export type SellerCategoryFormValues = {
  id: string
  name: string
  icon: string
  image: string
  text: string
  parentId: string
  status: SellerCategoryStatus
  sortOrder: number
  seo: SeoMeta
  subs: CategorySub[]
  pageMeta: CategoryPageMeta
  suggested: CategorySuggestedItem[]
}

/** Payload sent to POST/PUT /seller/categories */
export type SellerCategoryApiPayload = {
  id?: string
  name: string
  icon: string
  image: string | null
  text: string | null
  parentId?: string | null
  status?: SellerCategoryStatus
  sortOrder?: number
  seo?: SeoMeta | null
  subs: CategorySub[]
  pageMeta: CategoryPageMeta | null
  suggested: CategorySuggestedItem[] | null
}

export const categoryIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const sellerCategoryStatusMeta: Record<
  SellerCategoryStatus,
  { label: string, color: 'success' | 'neutral' }
> = {
  active: { label: 'فعال', color: 'success' },
  inactive: { label: 'غیرفعال', color: 'neutral' },
}

export function emptyPageMeta(): CategoryPageMeta {
  return {
    hero: {
      image: '',
      eyebrow: '',
      title: '',
      subtitle: '',
    },
    seo: {
      heading: '',
      paragraphs: [''],
    },
  }
}

export function emptySuggestedItem(): CategorySuggestedItem {
  return {
    id: '',
    title: '',
    image: '',
    query: '',
  }
}

export function emptySubGroup(): CategorySub {
  return {
    name: '',
    items: [],
    image: null,
  }
}

export function emptyCategoryForm(): SellerCategoryFormValues {
  return {
    id: '',
    name: '',
    icon: 'category',
    image: '',
    text: '',
    parentId: SELLER_CATEGORY_ROOT_PARENT,
    status: 'active',
    sortOrder: 0,
    seo: emptySeoMeta(),
    subs: [],
    pageMeta: emptyPageMeta(),
    suggested: [],
  }
}

function resolveSeo(raw: Partial<SellerCategory>): SeoMeta | null {
  if (raw.seo) return { ...emptySeoMeta(), ...raw.seo }
  const heading = raw.pageMeta?.seo?.heading
  if (heading) {
    return seoMetaFromCategoryHeading(heading, raw.pageMeta?.seo?.paragraphs ?? [])
  }
  return null
}

export function toSellerCategory(raw: Partial<SellerCategory> & { id: string, name: string } & Record<string, unknown>): SellerCategory {
  const status: SellerCategoryStatus = raw.status === 'inactive' ? 'inactive' : 'active'
  const parentRaw = raw.parentId ?? raw.parent_id
  let parentId: string | null = null
  if (parentRaw != null && parentRaw !== '') {
    const asString = String(parentRaw).trim()
    // Form sentinel / some backends use __root__ for top-level
    if (asString && asString !== SELLER_CATEGORY_ROOT_PARENT && asString !== 'null' && asString !== 'undefined') {
      parentId = asString
    }
  }
  return {
    id: raw.id,
    name: raw.name,
    icon: raw.icon || 'category',
    image: raw.image ?? null,
    text: raw.text ?? null,
    parentId,
    status,
    sortOrder: Number.isFinite(Number(raw.sortOrder ?? raw.sort_order))
      ? Number(raw.sortOrder ?? raw.sort_order)
      : 0,
    seo: resolveSeo(raw),
    subs: (raw.subs ?? []).map(sub => ({
      name: sub.name,
      items: [...(sub.items ?? [])],
      image: sub.image ?? null,
    })),
    pageMeta: raw.pageMeta ?? null,
    suggested: raw.suggested ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
  }
}

export function toCategoryForm(category: SellerCategory): SellerCategoryFormValues {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon || 'category',
    image: category.image ?? '',
    text: category.text ?? '',
    parentId: category.parentId || SELLER_CATEGORY_ROOT_PARENT,
    status: category.status ?? 'active',
    sortOrder: category.sortOrder ?? 0,
    seo: category.seo ? { ...emptySeoMeta(), ...category.seo } : emptySeoMeta(),
    subs: category.subs.map(sub => ({
      name: sub.name,
      items: [...sub.items],
      image: sub.image ?? null,
    })),
    pageMeta: category.pageMeta
      ? {
          hero: { ...category.pageMeta.hero },
          seo: {
            heading: category.pageMeta.seo.heading,
            paragraphs: category.pageMeta.seo.paragraphs.length
              ? [...category.pageMeta.seo.paragraphs]
              : [''],
          },
        }
      : emptyPageMeta(),
    suggested: (category.suggested ?? []).map(item => ({ ...item })),
  }
}

export function formToApiPayload(form: SellerCategoryFormValues): SellerCategoryApiPayload {
  return {
    id: form.id.trim(),
    name: form.name.trim(),
    icon: form.icon.trim() || 'category',
    image: form.image.trim() || null,
    text: form.text.trim() || null,
    parentId: (() => {
      const raw = form.parentId.trim()
      if (!raw || raw === SELLER_CATEGORY_ROOT_PARENT) return null
      return raw
    })(),
    status: form.status,
    sortOrder: Math.max(0, Math.round(Number(form.sortOrder) || 0)),
    seo: sanitizeSeoMeta(form.seo),
    subs: sanitizeSubs(form.subs),
    pageMeta: sanitizePageMeta(form.pageMeta),
    suggested: (() => {
      const items = sanitizeSuggested(form.suggested)
      return items.length ? items : null
    })(),
  }
}

export function sellerCategoryToListItem(category: SellerCategory): Category {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    image: category.image,
    text: category.text,
    subs: category.subs.map(sub => ({
      name: sub.name,
      items: [...sub.items],
      image: sub.image ?? null,
    })),
  }
}

/** Exclude self and descendants so parent picker cannot create cycles (client-side). */
export function categoryParentOptions(
  categories: SellerCategory[],
  currentId?: string | null,
): { value: string, label: string }[] {
  const byParent = new Map<string | null, SellerCategory[]>()
  for (const cat of categories) {
    const key = cat.parentId ?? null
    const list = byParent.get(key) ?? []
    list.push(cat)
    byParent.set(key, list)
  }

  const blocked = new Set<string>()
  if (currentId) {
    const walk = (id: string) => {
      blocked.add(id)
      for (const child of byParent.get(id) ?? []) {
        walk(child.id)
      }
    }
    walk(currentId)
  }

  const options: { value: string, label: string }[] = [
    { value: SELLER_CATEGORY_ROOT_PARENT, label: 'دسته ریشه (بدون والد)' },
  ]

  function walkTree(parentId: string | null, depth: number) {
    const children = (byParent.get(parentId) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fa'))
    for (const cat of children) {
      if (blocked.has(cat.id)) continue
      const prefix = depth > 0 ? `${'— '.repeat(depth)}` : ''
      options.push({ value: cat.id, label: `${prefix}${cat.name}` })
      walkTree(cat.id, depth + 1)
    }
  }

  walkTree(null, 0)

  // Include orphans whose parent is missing from the list
  for (const cat of categories) {
    if (blocked.has(cat.id)) continue
    if (options.some(o => o.value === cat.id)) continue
    options.push({ value: cat.id, label: cat.name })
  }

  return options
}

function sanitizeSubs(subs: CategorySub[]): CategorySub[] {
  return subs
    .map(sub => ({
      name: sub.name.trim(),
      items: sub.items.map(item => item.trim()).filter(Boolean),
      image: sub.image?.trim() || null,
    }))
    .filter(sub => sub.name.length > 0)
}

function sanitizePageMeta(meta: CategoryPageMeta): CategoryPageMeta | null {
  const hero = {
    image: meta.hero.image.trim(),
    eyebrow: meta.hero.eyebrow.trim(),
    title: meta.hero.title.trim(),
    subtitle: meta.hero.subtitle.trim(),
  }
  const paragraphs = meta.seo.paragraphs.map(p => p.trim()).filter(Boolean)
  const heading = meta.seo.heading.trim()

  if (!hero.image && !hero.eyebrow && !hero.title && !hero.subtitle && !heading && !paragraphs.length) {
    return null
  }

  return {
    hero,
    seo: {
      heading,
      paragraphs: paragraphs.length ? paragraphs : [''],
    },
  }
}

function sanitizeSuggested(items: CategorySuggestedItem[]): CategorySuggestedItem[] {
  return items
    .map(item => ({
      id: item.id.trim(),
      title: item.title.trim(),
      image: item.image.trim(),
      query: item.query.trim(),
    }))
    .filter(item => item.id && item.title && item.query)
}

export function countSubItems(subs: CategorySub[]) {
  return subs.reduce((sum, sub) => sum + (sub.items?.length ?? 0), 0)
}

export type SellerCategoryTreeRow = SellerCategory & {
  depth: number
  childCount: number
  parentName: string | null
}

/** Flat tree rows for admin list (roots first, children indented by depth). */
export function flattenCategoryTree(categories: SellerCategory[]): SellerCategoryTreeRow[] {
  const byParent = new Map<string | null, SellerCategory[]>()
  for (const cat of categories) {
    const key = cat.parentId ?? null
    const list = byParent.get(key) ?? []
    list.push(cat)
    byParent.set(key, list)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fa'))
  }

  const byId = new Map(categories.map(c => [c.id, c]))
  const rows: SellerCategoryTreeRow[] = []
  const seen = new Set<string>()

  function walk(parentId: string | null, depth: number) {
    for (const cat of byParent.get(parentId) ?? []) {
      if (seen.has(cat.id)) continue
      seen.add(cat.id)
      const parent = cat.parentId ? byId.get(cat.parentId) : null
      rows.push({
        ...cat,
        depth,
        childCount: (byParent.get(cat.id) ?? []).length,
        parentName: parent?.name ?? null,
      })
      walk(cat.id, depth + 1)
    }
  }

  walk(null, 0)

  for (const cat of categories) {
    if (seen.has(cat.id)) continue
    const parent = cat.parentId ? byId.get(cat.parentId) : null
    rows.push({
      ...cat,
      depth: 0,
      childCount: (byParent.get(cat.id) ?? []).length,
      parentName: parent?.name ?? (cat.parentId ? cat.parentId : null),
    })
  }

  return rows
}

/** Nested tree nodes for product-form category picker (Nuxt UI Tree). */
export type SellerCategoryPickerNode = {
  id: string
  label: string
  /** Always a Tabler / Nuxt Icon name — never an image URL (UTree uses UIcon). */
  icon: string
  /** Optional image preview (category.image or icon-as-image). */
  image?: string | null
  defaultExpanded?: boolean
  children?: SellerCategoryPickerNode[]
}

function pickerIconFields(cat: SellerCategory): Pick<SellerCategoryPickerNode, 'icon' | 'image'> {
  const rawIcon = String(cat.icon || '').trim()
  if (isSellerAdminIconImage(rawIcon)) {
    return {
      icon: 'i-tabler-category',
      image: rawIcon || cat.image || null,
    }
  }
  return {
    icon: resolveCategoryIconName(rawIcon || 'category'),
    image: cat.image || null,
  }
}

export function buildSellerCategoryPickerTree(
  categories: SellerCategory[],
  options?: { includeInactiveIds?: string[], query?: string },
): SellerCategoryPickerNode[] {
  const include = new Set(options?.includeInactiveIds?.filter(Boolean) ?? [])
  const filtered = categories.filter(c => c.status !== 'inactive' || include.has(c.id))

  const byParent = new Map<string | null, SellerCategory[]>()
  for (const cat of filtered) {
    const key = cat.parentId ?? null
    const list = byParent.get(key) ?? []
    list.push(cat)
    byParent.set(key, list)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fa'))
  }

  const seen = new Set<string>()
  function walk(parentId: string | null): SellerCategoryPickerNode[] {
    const nodes: SellerCategoryPickerNode[] = []
    for (const cat of byParent.get(parentId) ?? []) {
      if (seen.has(cat.id)) continue
      seen.add(cat.id)
      const children = walk(cat.id)
      nodes.push({
        id: cat.id,
        label: cat.name,
        ...pickerIconFields(cat),
        ...(children.length ? { children, defaultExpanded: true } : {}),
      })
    }
    return nodes
  }

  const tree = walk(null)

  // Orphans (missing parent still in list)
  for (const cat of filtered) {
    if (seen.has(cat.id)) continue
    seen.add(cat.id)
    tree.push({
      id: cat.id,
      label: cat.name,
      ...pickerIconFields(cat),
    })
  }

  const query = options?.query?.trim().toLowerCase()
  if (!query) return tree

  function filterNodes(nodes: SellerCategoryPickerNode[]): SellerCategoryPickerNode[] {
    const out: SellerCategoryPickerNode[] = []
    for (const node of nodes) {
      const childMatches = filterNodes(node.children ?? [])
      const selfMatch = node.label.toLowerCase().includes(query)
        || node.id.toLowerCase().includes(query)
      if (selfMatch) {
        out.push({
          ...node,
          defaultExpanded: true,
          ...(node.children?.length
            ? { children: childMatches.length ? childMatches : node.children }
            : {}),
        })
      }
      else if (childMatches.length) {
        out.push({ ...node, defaultExpanded: true, children: childMatches })
      }
    }
    return out
  }

  return filterNodes(tree)
}

/** Ancestor category ids (nearest parent first → root last). */
export function categoryAncestorIds(
  categories: SellerCategory[],
  categoryId: string,
): string[] {
  const byId = new Map(categories.map(c => [c.id, c]))
  const ids: string[] = []
  let current = byId.get(categoryId)
  const guard = new Set<string>()
  while (current?.parentId) {
    if (guard.has(current.parentId)) break
    guard.add(current.parentId)
    ids.push(current.parentId)
    current = byId.get(current.parentId)
  }
  return ids
}

export function resolveCategoryIconName(icon: string) {
  return resolveSellerAdminIconName(icon)
}
