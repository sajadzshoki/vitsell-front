import {
  emptyWarehouseForm,
  toWarehouseForm,
  type SellerInventoryRow,
  type SellerStockMovement,
  type SellerStockMovementType,
  type SellerWarehouse,
  type SellerWarehouseFormValues,
} from '~/data/seller-inventory'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || fallback
  )
}

export type SellerWarehousesQuery = {
  q?: string
  status?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerWarehousesPage = {
  items: SellerWarehouse[]
  total: number
  page: number
  pageSize: number
  statusCounts: { all: number, active: number, inactive: number }
}

export type SellerMovementsQuery = {
  q?: string
  type?: string
  warehouseId?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerMovementsPage = {
  items: SellerStockMovement[]
  total: number
  page: number
  pageSize: number
  typeCounts: Record<string, number>
}

export type SellerInventoryQuery = {
  q?: string
  status?: string
  warehouseId?: string
  category?: string
  brand?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerInventoryPage = {
  items: SellerInventoryRow[]
  total: number
  page: number
  pageSize: number
  statusCounts: {
    all: number
    in_stock: number
    low_stock: number
    out_of_stock: number
  }
  defaultWarehouseId?: string
  categoryOptions?: { value: string, label: string }[]
  brandOptions?: { value: string, label: string }[]
}

function toWarehouse(raw: any): SellerWarehouse {
  return {
    id: String(raw.id),
    name: String(raw.name || ''),
    code: String(raw.code || ''),
    city: String(raw.city || ''),
    address: String(raw.address || ''),
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    isDefault: Boolean(raw.isDefault),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  }
}

function toMovement(raw: any): SellerStockMovement {
  return {
    id: String(raw.id),
    productId: String(raw.productId || ''),
    productTitle: String(raw.productTitle || ''),
    variantId: raw.variantId ?? null,
    variantLabel: raw.variantLabel ?? null,
    warehouseId: String(raw.warehouseId || ''),
    type: (raw.type || 'adjust') as SellerStockMovementType,
    quantity: Number(raw.quantity) || 0,
    before: Number(raw.before) || 0,
    after: Number(raw.after) || 0,
    reason: String(raw.reason || ''),
    actorName: String(raw.actorName || ''),
    createdAt: String(raw.createdAt || new Date().toISOString()),
  }
}

function toInventoryRow(raw: any): SellerInventoryRow {
  return {
    id: String(raw.id || raw.productId),
    productId: String(raw.productId),
    productTitle: String(raw.productTitle || raw.productId),
    sku: String(raw.sku || raw.productId),
    variantId: raw.variantId ?? null,
    variantLabel: raw.variantLabel ?? null,
    warehouseId: String(raw.warehouseId || ''),
    stock: Number(raw.stock) || 0,
    reserved: Number(raw.reserved) || 0,
    available: Number(raw.available) || Math.max(0, (Number(raw.stock) || 0) - (Number(raw.reserved) || 0)),
    lowStockThreshold: Number(raw.lowStockThreshold) || 5,
    status: raw.status === 'low_stock' || raw.status === 'out_of_stock' ? raw.status : 'in_stock',
  }
}

function normalizeWarehousesPage(result: unknown): SellerWarehousesPage {
  if (Array.isArray(result)) {
    const items = result.map(toWarehouse)
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
      statusCounts: {
        all: items.length,
        active: items.filter(w => w.status === 'active').length,
        inactive: items.filter(w => w.status === 'inactive').length,
      },
    }
  }
  const page = (result || {}) as Partial<SellerWarehousesPage>
  const items = Array.isArray(page.items) ? page.items.map(toWarehouse) : []
  return {
    items,
    total: Number(page.total) || items.length,
    page: Number(page.page) || 1,
    pageSize: Number(page.pageSize) || 50,
    statusCounts: {
      all: Number(page.statusCounts?.all) || items.length,
      active: Number(page.statusCounts?.active) || 0,
      inactive: Number(page.statusCounts?.inactive) || 0,
    },
  }
}

export function useSellerInventory() {
  const warehouses = useState<SellerWarehouse[]>('seller-warehouses', () => [])
  const warehousesMeta = useState('seller-warehouses-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 50,
    statusCounts: { all: 0, active: 0, inactive: 0 },
  }))
  const movements = useState<SellerStockMovement[]>('seller-stock-movements', () => [])
  const movementsMeta = useState('seller-movements-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 15,
    typeCounts: { all: 0 } as Record<string, number>,
  }))
  const inventoryRows = useState<SellerInventoryRow[]>('seller-inventory-rows', () => [])
  const inventoryMeta = useState('seller-inventory-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 15,
    statusCounts: { all: 0, in_stock: 0, low_stock: 0, out_of_stock: 0 },
    defaultWarehouseId: 'wh-tehran',
    categoryOptions: [] as { value: string, label: string }[],
    brandOptions: [] as { value: string, label: string }[],
  }))

  const warehousesSeeded = useState('seller-warehouses-seeded', () => false)
  const pending = useState('seller-inventory-pending', () => false)

  const defaultWarehouse = computed(() =>
    warehouses.value.find(w => w.isDefault) || warehouses.value[0] || null,
  )

  async function ensureWarehouses(options?: { force?: boolean }) {
    if (warehousesSeeded.value && warehouses.value.length && !options?.force) {
      return warehouses.value
    }
    const { result, error } = await useGet<SellerWarehousesPage | SellerWarehouse[]>(
      '/seller/warehouses',
      { query: { all: true, pageSize: 200 }, headers: { 'no-error': true } },
    )
    if (!error && result != null) {
      const page = normalizeWarehousesPage(result)
      warehouses.value = page.items
      warehousesMeta.value = {
        total: page.total,
        page: page.page,
        pageSize: page.pageSize,
        statusCounts: page.statusCounts,
      }
    }
    warehousesSeeded.value = true
    return warehouses.value
  }

  async function fetchWarehouses(query?: SellerWarehousesQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 50
      }
      const { result, error } = await useGet<SellerWarehousesPage | SellerWarehouse[]>(
        '/seller/warehouses',
        { query: params, headers: { 'no-error': true } },
      )
      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'warehouses-fetch-failed' } }
      }
      const page = normalizeWarehousesPage(result)
      warehouses.value = page.items
      warehousesMeta.value = {
        total: page.total,
        page: page.page,
        pageSize: page.pageSize,
        statusCounts: page.statusCounts,
      }
      warehousesSeeded.value = true
      return { ok: true as const, error: null as null, page }
    }
    finally {
      pending.value = false
    }
  }

  async function fetchWarehouse(id: string, options?: { force?: boolean }) {
    const cached = getWarehouse(id)
    if (cached && !options?.force) return { ok: true as const, warehouse: cached }
    const { result, error } = await useGet<SellerWarehouse>(
      `/seller/warehouses/${encodeURIComponent(id)}`,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) return { ok: false as const, warehouse: null as SellerWarehouse | null }
    const warehouse = toWarehouse(result)
    warehouses.value = [warehouse, ...warehouses.value.filter(w => w.id !== warehouse.id)]
    return { ok: true as const, warehouse }
  }

  function getWarehouse(id: string) {
    return warehouses.value.find(w => w.id === id) ?? null
  }

  async function createWarehouse(form: SellerWarehouseFormValues) {
    if (!form.name.trim() || !form.code.trim()) {
      return { ok: false as const, error: 'نام و کد الزامی است' }
    }
    const { result, error } = await usePost<SellerWarehouse>(
      '/seller/warehouses',
      {
        id: form.id.trim() || undefined,
        name: form.name.trim(),
        code: form.code.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        status: form.status,
        isDefault: form.isDefault,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'ثبت انبار ناموفق بود') }
    }
    const warehouse = toWarehouse(result)
    if (warehouse.isDefault) {
      warehouses.value = warehouses.value.map(w => ({ ...w, isDefault: false }))
    }
    warehouses.value = [warehouse, ...warehouses.value.filter(w => w.id !== warehouse.id)]
    return { ok: true as const, warehouse }
  }

  async function updateWarehouse(id: string, form: SellerWarehouseFormValues) {
    const { result, error } = await usePut<SellerWarehouse>(
      `/seller/warehouses/${encodeURIComponent(id)}`,
      {
        name: form.name.trim(),
        code: form.code.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        status: form.status,
        isDefault: form.isDefault,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی انبار ناموفق بود') }
    }
    const warehouse = toWarehouse(result)
    if (warehouse.isDefault) {
      warehouses.value = warehouses.value.map(w =>
        w.id === id ? warehouse : { ...w, isDefault: false },
      )
    }
    else {
      warehouses.value = warehouses.value.map(w => (w.id === id ? warehouse : w))
    }
    return { ok: true as const, warehouse }
  }

  async function fetchMovements(query?: SellerMovementsQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.type && query.type !== 'all') params.type = query.type
      if (query?.warehouseId && query.warehouseId !== 'all') params.warehouseId = query.warehouseId
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 15
      }
      const { result, error } = await useGet<SellerMovementsPage>(
        '/seller/stock-movements',
        { query: params, headers: { 'no-error': true } },
      )
      if (error || !result) {
        return { ok: false as const, error: error ?? { message: 'movements-fetch-failed' } }
      }
      const items = Array.isArray(result.items) ? result.items.map(toMovement) : []
      movements.value = items
      movementsMeta.value = {
        total: Number(result.total) || items.length,
        page: Number(result.page) || 1,
        pageSize: Number(result.pageSize) || 15,
        typeCounts: result.typeCounts || { all: items.length },
      }
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureMovements(options?: { force?: boolean }) {
    if (movements.value.length && !options?.force) return movements.value
    await fetchMovements({ all: true, pageSize: 200 })
    return movements.value
  }

  async function appendMovement(entry: Omit<SellerStockMovement, 'id' | 'createdAt'>) {
    const { result, error } = await usePost<SellerStockMovement>(
      '/seller/stock-movements',
      entry,
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      const row: SellerStockMovement = {
        ...entry,
        id: `mov-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      movements.value = [row, ...movements.value]
      return row
    }
    const row = toMovement(result)
    movements.value = [row, ...movements.value]
    return row
  }

  async function fetchInventory(query?: SellerInventoryQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.status && query.status !== 'all') params.status = query.status
      if (query?.warehouseId && query.warehouseId !== 'all') params.warehouse = query.warehouseId
      if (query?.category && query.category !== 'all') params.category = query.category
      if (query?.brand && query.brand !== 'all') params.brand = query.brand
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 15
      }
      const { result, error } = await useGet<SellerInventoryPage>(
        '/seller/inventory',
        { query: params, headers: { 'no-error': true } },
      )
      if (error || !result) {
        return { ok: false as const, error: error ?? { message: 'inventory-fetch-failed' } }
      }
      const items = Array.isArray(result.items) ? result.items.map(toInventoryRow) : []
      inventoryRows.value = items
      inventoryMeta.value = {
        total: Number(result.total) || items.length,
        page: Number(result.page) || 1,
        pageSize: Number(result.pageSize) || 15,
        statusCounts: {
          all: Number(result.statusCounts?.all) || items.length,
          in_stock: Number(result.statusCounts?.in_stock) || 0,
          low_stock: Number(result.statusCounts?.low_stock) || 0,
          out_of_stock: Number(result.statusCounts?.out_of_stock) || 0,
        },
        defaultWarehouseId: result.defaultWarehouseId || 'wh-tehran',
        categoryOptions: Array.isArray(result.categoryOptions) ? result.categoryOptions : [],
        brandOptions: Array.isArray(result.brandOptions) ? result.brandOptions : [],
      }
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function adjustStock(input: {
    productId: string
    stock: number
    warehouseId?: string
    variantId?: string | null
    variantLabel?: string | null
    reason?: string
    actorName?: string
  }) {
    const { result, error } = await usePatch<{
      row: SellerInventoryRow
      movement: SellerStockMovement
    }>(
      `/seller/inventory/${encodeURIComponent(input.productId)}`,
      {
        stock: input.stock,
        warehouseId: input.warehouseId,
        variantId: input.variantId,
        variantLabel: input.variantLabel,
        reason: input.reason,
        actorName: input.actorName,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.row) {
      return { ok: false as const, error: apiErrorMessage(error, 'به‌روزرسانی موجودی ناموفق بود') }
    }
    const row = toInventoryRow(result.row)
    inventoryRows.value = inventoryRows.value.map(r =>
      r.productId === row.productId && !r.variantId ? row : r,
    )
    if (result.movement) {
      movements.value = [toMovement(result.movement), ...movements.value]
    }
    return { ok: true as const, row, movement: result.movement ? toMovement(result.movement) : null }
  }

  async function ensureLoaded() {
    await Promise.all([ensureWarehouses(), ensureMovements()])
  }

  return {
    warehouses,
    warehousesMeta,
    movements,
    movementsMeta,
    inventoryRows: computed(() => inventoryRows.value),
    inventoryMeta,
    pending: computed(() => pending.value),
    defaultWarehouse,
    ensureLoaded,
    ensureWarehouses,
    ensureMovements,
    fetchWarehouses,
    fetchWarehouse,
    fetchMovements,
    fetchInventory,
    getWarehouse,
    createWarehouse,
    updateWarehouse,
    appendMovement,
    adjustStock,
    emptyWarehouseForm,
    toWarehouseForm,
  }
}
