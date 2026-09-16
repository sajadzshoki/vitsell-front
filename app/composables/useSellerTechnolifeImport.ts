export type TechnolifePreviewRow = {
  url: string
  status?: string
  productId?: string | null
  error?: { code: string, message: string } | null
  warnings?: string[]
  duplicate?: { productId: string, reason: string } | null
  normalized?: {
    title?: string
    brandName?: string
    priceToman?: number | null
    availability?: string
    images?: string[]
    specs?: { key: string, value: string }[]
  } | null
  brand?: { id: string | null, name: string, created: boolean } | null
  category?: { id: string, label: string } | null
}

export type TechnolifeBatch = {
  id: number
  status: string
  mode: string
  totalCount: number
  successCount: number
  failedCount: number
  duplicateCount: number
  startedAt?: string | null
  finishedAt?: string | null
  createdAt?: string | null
  items?: Array<{
    id: number
    sourceUrl: string
    status: string
    productId: string | null
    errorCode: string | null
    errorMessage: string | null
    warnings: string[]
    sourceProductId: string | null
  }>
}

export function useSellerTechnolifeImport() {
  async function preview(urls: string[]) {
    return usePost<{ results: TechnolifePreviewRow[] }>(
      '/seller/importers/technolife/preview',
      { urls },
      { headers: { 'no-error': true } },
    )
  }

  async function startImport(body: {
    urls: string[]
    mode?: 'create_only' | 'upsert'
    downloadImages?: boolean
    fieldPolicy?: Record<string, boolean>
  }) {
    return usePost<TechnolifeBatch>(
      '/seller/importers/technolife/import',
      body,
      { headers: { 'no-error': true } },
    )
  }

  async function listImports(page = 1) {
    return useGet<{ items: TechnolifeBatch[], total: number }>(
      '/seller/importers/technolife/imports',
      { page, pageSize: 20 },
      { headers: { 'no-error': true } },
    )
  }

  async function showImport(id: number) {
    return useGet<TechnolifeBatch>(
      `/seller/importers/technolife/imports/${id}`,
      undefined,
      { headers: { 'no-error': true } },
    )
  }

  async function retryImport(id: number) {
    return usePost<{ id: number, status: string }>(
      `/seller/importers/technolife/imports/${id}/retry`,
      {},
      { headers: { 'no-error': true } },
    )
  }

  return { preview, startImport, listImports, showImport, retryImport }
}
