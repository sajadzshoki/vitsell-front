import {
  compactMegaMenuFilter,
  emptyMegaMenuForm,
  type MegaMenuFilterDefinition,
  type MegaMenuItemType,
  type MegaMenuStatus,
  type SellerMegaMenuFormValues,
  type SellerMegaMenuItem,
  type SellerMegaMenuSection,
  type SellerMegaMenuSummary,
  type SellerMegaMenuTree,
} from '~/data/mega-menu'

function apiErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback
  const data = 'data' in error
    ? (error as { data?: { errors?: Array<{ message?: string }>, message?: string } }).data
    : undefined
  const fromFields = data?.errors?.map(e => e.message).filter(Boolean).join(' ، ')
  if (fromFields) return fromFields
  if (data?.message) return data.message
  if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message
  }
  return fallback
}

function asStatus(value: unknown): MegaMenuStatus {
  return value === 'inactive' ? 'inactive' : 'active'
}

function asItemType(value: unknown): MegaMenuItemType {
  if (value === 'filter' || value === 'link') return value
  return 'category'
}

function asCategoryRef(raw: unknown): { id: string, name: string, icon: string } | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as { id?: unknown, name?: unknown, icon?: unknown }
  const id = String(row.id || '').trim()
  if (!id) return null
  return {
    id,
    name: String(row.name || id),
    icon: String(row.icon || ''),
  }
}

function asFilter(raw: unknown): MegaMenuFilterDefinition | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return compactMegaMenuFilter(raw as MegaMenuFilterDefinition)
}

function toSummary(raw: Record<string, unknown>): SellerMegaMenuSummary {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    slug: String(raw.slug || ''),
    icon: raw.icon ? String(raw.icon) : null,
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0)),
    status: asStatus(raw.status),
    sectionCount: Math.max(0, Math.round(Number(raw.sectionCount) || 0)),
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
  }
}

function toItem(raw: Record<string, unknown>): SellerMegaMenuItem {
  return {
    id: String(raw.id || ''),
    sectionId: String(raw.sectionId || ''),
    title: String(raw.title || ''),
    slug: raw.slug != null && String(raw.slug).trim() ? String(raw.slug) : null,
    type: asItemType(raw.type),
    categoryId: raw.categoryId ? String(raw.categoryId) : null,
    category: asCategoryRef(raw.category),
    filter: asFilter(raw.filter),
    url: raw.url ? String(raw.url) : null,
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0)),
    status: asStatus(raw.status),
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
  }
}

function toSection(raw: Record<string, unknown>): SellerMegaMenuSection {
  const items = Array.isArray(raw.items)
    ? raw.items.map(row => toItem(row as Record<string, unknown>))
    : []
  const sections = Array.isArray(raw.sections)
    ? raw.sections.map(row => toSection(row as Record<string, unknown>))
    : []
  return {
    id: String(raw.id || ''),
    menuId: String(raw.menuId || ''),
    parentId: raw.parentId ? String(raw.parentId) : null,
    title: String(raw.title || ''),
    slug: raw.slug != null && String(raw.slug).trim() ? String(raw.slug) : null,
    categoryId: raw.categoryId ? String(raw.categoryId) : null,
    category: asCategoryRef(raw.category),
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0)),
    status: asStatus(raw.status),
    itemCount: Math.max(0, Math.round(Number(raw.itemCount) || items.length)),
    childCount: Math.max(0, Math.round(Number(raw.childCount) || sections.length)),
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
    items,
    sections,
  }
}

function toTree(raw: Record<string, unknown>): SellerMegaMenuTree {
  return {
    ...toSummary(raw),
    sections: Array.isArray(raw.sections)
      ? raw.sections.map(row => toSection(row as Record<string, unknown>))
      : [],
  }
}

export function useSellerMegaMenus() {
  const items = useState<SellerMegaMenuSummary[]>('seller-mega-menus-items', () => [])
  const tree = useState<SellerMegaMenuTree | null>('seller-mega-menu-tree', () => null)
  const pending = useState('seller-mega-menus-pending', () => false)
  const treePending = useState('seller-mega-menu-tree-pending', () => false)

  const menus = computed(() => items.value)

  async function fetchList(query?: { q?: string, status?: string }) {
    pending.value = true
    try {
      const params: Record<string, string> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      const { result, error } = await useGet<{ items?: unknown[] }>(
        '/seller/mega-menus',
        { query: params, headers: { 'no-error': true }, server: false },
      )
      if (error || result == null) {
        return { ok: false as const, error: apiErrorMessage(error, 'بارگذاری مگا منو ناموفق بود') }
      }
      items.value = Array.isArray(result.items)
        ? result.items.map(row => toSummary(row as Record<string, unknown>))
        : []
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function fetchTree(id: string) {
    treePending.value = true
    try {
      const { result, error } = await useGet<Record<string, unknown>>(
        `/seller/mega-menus/${encodeURIComponent(id)}`,
        { headers: { 'no-error': true }, server: false },
      )
      if (error || !result?.id) {
        tree.value = null
        return { ok: false as const, error: apiErrorMessage(error, 'منوی مگا یافت نشد') }
      }
      tree.value = toTree(result)
      return { ok: true as const, error: null as null, tree: tree.value }
    }
    finally {
      treePending.value = false
    }
  }

  async function createMenu(form: SellerMegaMenuFormValues) {
    const payload: Record<string, unknown> = {
      title: String(form.title || '').trim(),
      status: form.status === 'inactive' ? 'inactive' : 'active',
      sortOrder: Math.max(0, Math.round(Number(form.sortOrder) || 0)),
      icon: String(form.icon || '').trim() || null,
    }
    const slug = String(form.slug || '').trim().toLowerCase()
    if (slug) payload.slug = slug
    const { result, error } = await usePost<Record<string, unknown>>('/seller/mega-menus', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت منو ناموفق بود') }
    }
    const created = toSummary(result)
    items.value = [...items.value, created].sort((a, b) => a.sortOrder - b.sortOrder)
    return { ok: true as const, error: null as null, menu: created }
  }

  async function updateMenu(id: string, form: SellerMegaMenuFormValues) {
    const payload: Record<string, unknown> = {
      title: String(form.title || '').trim(),
      status: form.status === 'inactive' ? 'inactive' : 'active',
      sortOrder: Math.max(0, Math.round(Number(form.sortOrder) || 0)),
      icon: String(form.icon || '').trim() || null,
    }
    const slug = String(form.slug || '').trim().toLowerCase()
    if (slug) payload.slug = slug
    const { result, error } = await usePut<Record<string, unknown>>(
      `/seller/mega-menus/${encodeURIComponent(id)}`,
      payload,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ویرایش منو ناموفق بود') }
    }
    tree.value = toTree(result)
    items.value = items.value.map(m => m.id === id ? toSummary(result) : m)
    return { ok: true as const, error: null as null, tree: tree.value }
  }

  async function setMenuStatus(id: string, status: MegaMenuStatus) {
    const { result, error } = await usePatch<Record<string, unknown>>(
      `/seller/mega-menus/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت ناموفق بود') }
    }
    const summary = toSummary(result)
    items.value = items.value.map(m => m.id === id ? { ...m, ...summary } : m)
    if (tree.value?.id === id) {
      tree.value = { ...tree.value, ...summary }
    }
    return { ok: true as const, error: null as null }
  }

  async function reorderMenus(orderedIds: string[]) {
    const { error } = await usePost('/seller/mega-menus/reorder', { orderedIds }, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر ترتیب ناموفق بود') }
    }
    const byId = new Map(items.value.map(m => [m.id, m]))
    items.value = orderedIds
      .map((id, index) => {
        const row = byId.get(id)
        return row ? { ...row, sortOrder: index } : null
      })
      .filter((row): row is SellerMegaMenuSummary => Boolean(row))
    return { ok: true as const, error: null as null }
  }

  async function destroyMenu(id: string) {
    const { error } = await useDelete(`/seller/mega-menus/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف منو ناموفق بود') }
    }
    items.value = items.value.filter(m => m.id !== id)
    if (tree.value?.id === id) tree.value = null
    return { ok: true as const, error: null as null }
  }

  async function createSection(payload: {
    menuId: string
    title: string
    slug?: string | null
    parentId?: string | null
    categoryId?: string | null
    sortOrder?: number
    status?: MegaMenuStatus
  }) {
    const body: Record<string, unknown> = {
      menuId: payload.menuId,
      title: payload.title.trim(),
      parentId: payload.parentId || null,
      categoryId: payload.categoryId || null,
      sortOrder: Math.max(0, Math.round(Number(payload.sortOrder) || 0)),
      status: payload.status || 'active',
    }
    const slug = String(payload.slug || '').trim().toLowerCase()
    if (slug) body.slug = slug
    const { result, error } = await usePost<Record<string, unknown>>('/seller/mega-menu-sections', body, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت بخش ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function updateSection(id: string, payload: {
    title: string
    slug?: string | null
    parentId?: string | null
    categoryId?: string | null
    sortOrder?: number
    status?: MegaMenuStatus
  }) {
    const body: Record<string, unknown> = {
      title: payload.title.trim(),
      parentId: payload.parentId ?? null,
      categoryId: payload.categoryId ?? null,
      sortOrder: Math.max(0, Math.round(Number(payload.sortOrder) || 0)),
      status: payload.status || 'active',
    }
    const slug = String(payload.slug || '').trim().toLowerCase()
    if (slug) body.slug = slug
    const { error } = await usePut(`/seller/mega-menu-sections/${encodeURIComponent(id)}`, body, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'ویرایش بخش ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function setSectionStatus(id: string, status: MegaMenuStatus) {
    const { error } = await usePatch(
      `/seller/mega-menu-sections/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت بخش ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function reorderSections(orderedIds: string[]) {
    const { error } = await usePost('/seller/mega-menu-sections/reorder', { orderedIds }, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر ترتیب بخش‌ها ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function destroySection(id: string) {
    const { error } = await useDelete(`/seller/mega-menu-sections/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف بخش ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function createItem(payload: {
    sectionId: string
    title: string
    slug?: string | null
    type: MegaMenuItemType
    categoryId?: string | null
    filter?: MegaMenuFilterDefinition | null
    url?: string | null
    sortOrder?: number
    status?: MegaMenuStatus
  }) {
    const body: Record<string, unknown> = {
      sectionId: payload.sectionId,
      title: payload.title.trim(),
      type: payload.type,
      sortOrder: Math.max(0, Math.round(Number(payload.sortOrder) || 0)),
      status: payload.status || 'active',
    }
    const slug = String(payload.slug || '').trim().toLowerCase()
    if (slug) body.slug = slug
    if (payload.type === 'category') body.categoryId = payload.categoryId || null
    if (payload.type === 'filter') body.filter = payload.filter || null
    if (payload.type === 'link') body.url = payload.url || null
    const { error } = await usePost('/seller/mega-menu-items', body, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت آیتم ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function updateItem(id: string, payload: {
    title: string
    slug?: string | null
    type: MegaMenuItemType
    categoryId?: string | null
    filter?: MegaMenuFilterDefinition | null
    url?: string | null
    sortOrder?: number
    status?: MegaMenuStatus
  }) {
    const body: Record<string, unknown> = {
      title: payload.title.trim(),
      type: payload.type,
      sortOrder: Math.max(0, Math.round(Number(payload.sortOrder) || 0)),
      status: payload.status || 'active',
      categoryId: payload.type === 'category' ? payload.categoryId || null : null,
      filter: payload.type === 'filter' ? payload.filter || null : null,
      url: payload.type === 'link' ? payload.url || null : null,
    }
    const slug = String(payload.slug || '').trim().toLowerCase()
    if (slug) body.slug = slug
    const { error } = await usePut(`/seller/mega-menu-items/${encodeURIComponent(id)}`, body, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'ویرایش آیتم ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function setItemStatus(id: string, status: MegaMenuStatus) {
    const { error } = await usePatch(
      `/seller/mega-menu-items/${encodeURIComponent(id)}/status`,
      { status },
      { headers: { 'no-error': true } },
    )
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر وضعیت آیتم ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function reorderItems(orderedIds: string[]) {
    const { error } = await usePost('/seller/mega-menu-items/reorder', { orderedIds }, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'تغییر ترتیب آیتم‌ها ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  async function destroyItem(id: string) {
    const { error } = await useDelete(`/seller/mega-menu-items/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return { ok: false as const, error: apiErrorMessage(error, 'حذف آیتم ناموفق بود') }
    }
    return { ok: true as const, error: null as null }
  }

  function formFromSummary(menu: SellerMegaMenuSummary | SellerMegaMenuTree): SellerMegaMenuFormValues {
    return {
      title: menu.title,
      slug: menu.slug,
      icon: menu.icon || '',
      sortOrder: menu.sortOrder,
      status: menu.status,
    }
  }

  return {
    menus,
    tree,
    pending,
    treePending,
    fetchList,
    fetchTree,
    createMenu,
    updateMenu,
    setMenuStatus,
    reorderMenus,
    destroyMenu,
    createSection,
    updateSection,
    setSectionStatus,
    reorderSections,
    destroySection,
    createItem,
    updateItem,
    setItemStatus,
    reorderItems,
    destroyItem,
    formFromSummary,
    emptyForm: emptyMegaMenuForm,
  }
}
