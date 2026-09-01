import {
  buildDefaultStockMovements,
  buildDefaultWarehouses,
  emptyWarehouseForm,
  toWarehouseForm,
  type SellerInventoryRow,
  type SellerStockMovement,
  type SellerWarehouse,
  type SellerWarehouseFormValues,
} from '~/data/seller-inventory'
import { sellerLowStockThreshold } from '~/data/seller'
import { variantLabel } from '~/data/seller-product-variants'

export function useSellerInventory() {
  const warehouses = useState<SellerWarehouse[]>('seller-warehouses', () => [])
  const movements = useState<SellerStockMovement[]>('seller-stock-movements', () => [])
  const warehousesSeeded = useState('seller-warehouses-seeded', () => false)
  const movementsSeeded = useState('seller-movements-seeded', () => false)

  const { listings, resolveProduct } = useSeller()
  const { getCommerce } = useSellerProductCommerce()

  function ensureWarehouses() {
    if (!warehousesSeeded.value) {
      warehouses.value = buildDefaultWarehouses()
      warehousesSeeded.value = true
    }
    return warehouses.value
  }

  function ensureMovements() {
    if (!movementsSeeded.value) {
      movements.value = buildDefaultStockMovements()
      movementsSeeded.value = true
    }
    return movements.value
  }

  function ensureLoaded() {
    ensureWarehouses()
    ensureMovements()
  }

  const defaultWarehouse = computed(() =>
    warehouses.value.find(w => w.isDefault) || warehouses.value[0] || null,
  )

  const inventoryRows = computed((): SellerInventoryRow[] => {
    ensureLoaded()
    const rows: SellerInventoryRow[] = []
    const wh = defaultWarehouse.value?.id || 'wh-tehran'

    for (const listing of listings.value) {
      const product = resolveProduct(listing.productId)
      const commerce = getCommerce(listing.productId)
      const threshold = commerce.lowStockThreshold || sellerLowStockThreshold

      if (commerce.variants.length) {
        for (const variant of commerce.variants) {
          const available = Math.max(0, variant.stock)
          const status = available <= 0
            ? 'out_of_stock'
            : available <= threshold
              ? 'low_stock'
              : 'in_stock'
          rows.push({
            id: `${listing.productId}__${variant.id}`,
            productId: listing.productId,
            productTitle: product.title,
            sku: variant.sku || listing.productId,
            variantId: variant.id,
            variantLabel: variantLabel(variant),
            warehouseId: commerce.warehouseId || wh,
            stock: variant.stock,
            reserved: 0,
            available,
            lowStockThreshold: variant.lowStockThreshold || threshold,
            status,
          })
        }
      }
      else {
        const available = Math.max(0, listing.stock)
        const status = listing.status === 'out_of_stock' || available <= 0
          ? 'out_of_stock'
          : available <= threshold
            ? 'low_stock'
            : 'in_stock'
        rows.push({
          id: listing.productId,
          productId: listing.productId,
          productTitle: product.title,
          sku: commerce.sku || listing.productId,
          variantId: null,
          variantLabel: null,
          warehouseId: commerce.warehouseId || wh,
          stock: listing.stock,
          reserved: 0,
          available,
          lowStockThreshold: threshold,
          status,
        })
      }
    }
    return rows
  })

  function getWarehouse(id: string) {
    return warehouses.value.find(w => w.id === id) ?? null
  }

  function createWarehouse(form: SellerWarehouseFormValues) {
    ensureWarehouses()
    const id = form.id.trim() || `wh-${form.code.trim().toLowerCase()}`
    if (!form.name.trim() || !form.code.trim()) {
      return { ok: false as const, error: 'نام و کد الزامی است' }
    }
    if (warehouses.value.some(w => w.id === id || w.code === form.code.trim())) {
      return { ok: false as const, error: 'کد انبار تکراری است' }
    }
    const now = new Date().toISOString()
    let list = [...warehouses.value]
    if (form.isDefault) {
      list = list.map(w => ({ ...w, isDefault: false }))
    }
    const warehouse: SellerWarehouse = {
      id,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      city: form.city.trim(),
      address: form.address.trim(),
      status: form.status,
      isDefault: form.isDefault || list.length === 0,
      createdAt: now,
      updatedAt: now,
    }
    warehouses.value = [warehouse, ...list]
    return { ok: true as const, warehouse }
  }

  function updateWarehouse(id: string, form: SellerWarehouseFormValues) {
    ensureWarehouses()
    const index = warehouses.value.findIndex(w => w.id === id)
    if (index === -1) return { ok: false as const, error: 'انبار پیدا نشد' }
    let list = [...warehouses.value]
    if (form.isDefault) {
      list = list.map(w => ({ ...w, isDefault: false }))
    }
    const previous = list.find(w => w.id === id)!
    const next: SellerWarehouse = {
      ...previous,
      name: form.name.trim() || previous.name,
      code: form.code.trim().toUpperCase() || previous.code,
      city: form.city.trim(),
      address: form.address.trim(),
      status: form.status,
      isDefault: form.isDefault,
      updatedAt: new Date().toISOString(),
    }
    warehouses.value = list.map(w => (w.id === id ? next : w))
    return { ok: true as const, warehouse: next }
  }

  function appendMovement(entry: Omit<SellerStockMovement, 'id' | 'createdAt'>) {
    ensureMovements()
    const row: SellerStockMovement = {
      ...entry,
      id: `mov-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    movements.value = [row, ...movements.value]
    return row
  }

  return {
    warehouses,
    movements,
    inventoryRows,
    defaultWarehouse,
    ensureLoaded,
    ensureWarehouses,
    ensureMovements,
    getWarehouse,
    createWarehouse,
    updateWarehouse,
    appendMovement,
    emptyWarehouseForm,
    toWarehouseForm,
  }
}
