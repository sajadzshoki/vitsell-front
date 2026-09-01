/** CSV import center — FE validation + apply to session stores */

export type SellerImportEntity = 'products' | 'categories' | 'brands' | 'inventory'

export type SellerImportRowError = {
  row: number
  field: string
  message: string
}

export type SellerImportPreview = {
  entity: SellerImportEntity
  headers: string[]
  rows: Record<string, string>[]
  errors: SellerImportRowError[]
  validCount: number
  invalidCount: number
}

export type SellerImportHistoryItem = {
  id: string
  entity: SellerImportEntity
  actorName: string
  createdAt: string
  totalRows: number
  successRows: number
  failedRows: number
  status: 'completed' | 'failed' | 'partial'
}

export const sellerImportEntityMeta: Record<SellerImportEntity, { label: string, templateHeaders: string[] }> = {
  products: {
    label: 'محصولات',
    templateHeaders: ['id', 'title', 'price', 'stock', 'categoryId', 'brandId', 'status'],
  },
  categories: {
    label: 'دسته‌بندی‌ها',
    templateHeaders: ['id', 'name', 'parentId', 'status'],
  },
  brands: {
    label: 'برندها',
    templateHeaders: ['id', 'name', 'slug', 'status'],
  },
  inventory: {
    label: 'موجودی',
    templateHeaders: ['sku', 'productId', 'qty', 'warehouseId'],
  },
}

export function parseCsvText(text: string): { headers: string[], rows: Record<string, string>[] } {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
  if (!lines.length) return { headers: [], rows: [] }
  const headers = splitCsvLine(lines[0]!)
  const rows = lines.slice(1).map((line) => {
    const cols = splitCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = cols[i]?.trim() ?? ''
    })
    return row
  })
  return { headers, rows }
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      }
      else {
        inQuotes = !inQuotes
      }
    }
    else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    }
    else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

export function validateImport(
  entity: SellerImportEntity,
  headers: string[],
  rows: Record<string, string>[],
): SellerImportPreview {
  const required = sellerImportEntityMeta[entity].templateHeaders
  const errors: SellerImportRowError[] = []
  for (const h of required) {
    if (!headers.includes(h)) {
      errors.push({ row: 0, field: h, message: `ستون الزامی «${h}» وجود ندارد` })
    }
  }
  rows.forEach((row, idx) => {
    const rowNum = idx + 2
    if (entity === 'products') {
      if (!row.title) errors.push({ row: rowNum, field: 'title', message: 'عنوان خالی است' })
      const price = Number(row.price)
      if (!Number.isFinite(price) || price < 0) {
        errors.push({ row: rowNum, field: 'price', message: 'قیمت نامعتبر است' })
      }
    }
    if (entity === 'categories' && !row.name) {
      errors.push({ row: rowNum, field: 'name', message: 'نام دسته خالی است' })
    }
    if (entity === 'brands' && !row.name) {
      errors.push({ row: rowNum, field: 'name', message: 'نام برند خالی است' })
    }
    if (entity === 'inventory') {
      if (!row.sku) errors.push({ row: rowNum, field: 'sku', message: 'SKU خالی است' })
      const qty = Number(row.qty)
      if (!Number.isFinite(qty)) errors.push({ row: rowNum, field: 'qty', message: 'تعداد نامعتبر است' })
    }
  })
  // duplicate ids within file
  const idKey = entity === 'inventory' ? 'sku' : 'id'
  const seen = new Set<string>()
  rows.forEach((row, idx) => {
    const v = row[idKey]?.trim()
    if (!v) return
    if (seen.has(v)) {
      errors.push({ row: idx + 2, field: idKey, message: `${idKey} تکراری در فایل` })
    }
    seen.add(v)
  })

  const invalidRows = new Set(errors.filter(e => e.row > 0).map(e => e.row))
  return {
    entity,
    headers,
    rows,
    errors,
    validCount: Math.max(0, rows.length - invalidRows.size),
    invalidCount: invalidRows.size,
  }
}
