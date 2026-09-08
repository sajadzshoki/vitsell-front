import {
  filenameFromUrl,
  mediaKindFromMime,
  type SellerMediaItem,
  type SellerMediaKind,
} from '~/data/seller-media'
import { resolveMediaUrl } from '~/composables/fetch'

export type SellerMediaQuery = {
  q?: string
  kind?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerMediaPage = {
  items: SellerMediaItem[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toItem(raw: any): SellerMediaItem {
  const mimeType = String(raw?.mimeType || 'application/octet-stream')
  const kind = (['image', 'video', 'document', 'other'].includes(raw?.kind)
    ? raw.kind
    : mediaKindFromMime(mimeType)) as SellerMediaKind

  return {
    id: String(raw?.id || ''),
    url: resolveMediaUrl(String(raw?.url || '')),
    filename: String(raw?.filename || filenameFromUrl(String(raw?.url || ''))),
    mimeType,
    kind,
    alt: String(raw?.alt || ''),
    title: String(raw?.title || ''),
    description: String(raw?.description || ''),
    width: raw?.width == null ? null : Number(raw.width) || null,
    height: raw?.height == null ? null : Number(raw.height) || null,
    sizeBytes: raw?.sizeBytes == null ? null : Number(raw.sizeBytes) || null,
    createdAt: raw?.createdAt ? String(raw.createdAt) : new Date().toISOString(),
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : new Date().toISOString(),
    usageHints: Array.isArray(raw?.usageHints) ? raw.usageHints.map(String) : [],
  }
}

export function useSellerMedia() {
  const items = useState<SellerMediaItem[]>('seller-media-library', () => [])
  const listMeta = useState('seller-media-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 24,
    statusCounts: {
      all: 0,
      image: 0,
      video: 0,
      document: 0,
      other: 0,
    } as Record<string, number>,
  }))
  const seeded = useState('seller-media-seeded', () => false)
  const pending = useState('seller-media-pending', () => false)

  const media = computed(() => items.value)

  function upsertLocal(item: SellerMediaItem) {
    const index = items.value.findIndex(m => m.id === item.id)
    if (index === -1) items.value = [item, ...items.value]
    else {
      const copy = [...items.value]
      copy[index] = item
      items.value = copy
    }
  }

  function getById(id: string) {
    return items.value.find(m => m.id === id) ?? null
  }

  function getByUrl(url: string) {
    return items.value.find(m => m.url === url) ?? null
  }

  async function fetchList(query?: SellerMediaQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.kind && query.kind !== 'all') params.kind = query.kind
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 24
      }

      const { result, error } = await useGet<SellerMediaPage | SellerMediaItem[]>(
        '/seller/media',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'media-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        items.value = result.map(toItem)
        listMeta.value = {
          total: items.value.length,
          page: 1,
          pageSize: items.value.length,
          statusCounts: {
            all: items.value.length,
            image: items.value.filter(m => m.kind === 'image').length,
            video: items.value.filter(m => m.kind === 'video').length,
            document: items.value.filter(m => m.kind === 'document').length,
            other: items.value.filter(m => m.kind === 'other').length,
          },
        }
      }
      else {
        items.value = Array.isArray(result.items) ? result.items.map(toItem) : []
        listMeta.value = {
          total: Number(result.total) || items.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 24,
          statusCounts: {
            all: Number(result.statusCounts?.all) || items.value.length,
            image: Number(result.statusCounts?.image) || 0,
            video: Number(result.statusCounts?.video) || 0,
            document: Number(result.statusCounts?.document) || 0,
            other: Number(result.statusCounts?.other) || 0,
          },
        }
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) return items.value
    await fetchList({ page: 1, pageSize: 100, all: true })
    return items.value
  }

  async function uploadFiles(files: File[]) {
    const uploaded: SellerMediaItem[] = []
    const errors: string[] = []

    for (const file of files) {
      const fm = new FormData()
      fm.append('file', file)

      if (file.type.startsWith('image/')) {
        try {
          const dims = await readImageDims(URL.createObjectURL(file))
          fm.append('width', String(dims.width))
          fm.append('height', String(dims.height))
        }
        catch { /* ignore */ }
      }

      const { result, error } = await usePost<any>('/seller/media', fm, {
        headers: { 'no-error': true },
      })

      if (error || !result?.id) {
        errors.push(apiErrorMessage(error, `آپلود «${file.name}» ناموفق بود`))
        continue
      }

      const item = toItem(result)
      upsertLocal(item)
      uploaded.push(item)
    }

    if (!uploaded.length && errors.length) {
      return { ok: false as const, items: [] as SellerMediaItem[], error: errors[0]! }
    }

    listMeta.value = {
      ...listMeta.value,
      total: listMeta.value.total + uploaded.length,
      statusCounts: {
        ...listMeta.value.statusCounts,
        all: (Number(listMeta.value.statusCounts.all) || 0) + uploaded.length,
      },
    }

    return {
      ok: true as const,
      items: uploaded,
      error: errors.length ? errors.join(' ، ') : null,
    }
  }

  async function updateMedia(
    id: string,
    patch: Partial<Pick<SellerMediaItem, 'alt' | 'title' | 'description' | 'usageHints'>>,
  ) {
    const { result, error } = await usePut<any>(`/seller/media/${encodeURIComponent(id)}`, patch, {
      headers: { 'no-error': true },
    })
    if (error || !result?.id) {
      return {
        ok: false as const,
        item: null as SellerMediaItem | null,
        error: apiErrorMessage(error, 'به‌روزرسانی رسانه ناموفق بود'),
      }
    }
    const item = toItem(result)
    upsertLocal(item)
    return { ok: true as const, item, error: null as null }
  }

  async function deleteMedia(ids: string[]) {
    const unique = [...new Set(ids.filter(Boolean))]
    if (!unique.length) return { ok: true as const, error: null as null }

    if (unique.length === 1) {
      const { error } = await useDelete(`/seller/media/${encodeURIComponent(unique[0]!)}`, {
        headers: { 'no-error': true },
      })
      if (error) {
        return { ok: false as const, error: apiErrorMessage(error, 'حذف رسانه ناموفق بود') }
      }
    }
    else {
      const { error } = await usePost('/seller/media/bulk-delete', { ids: unique }, {
        headers: { 'no-error': true },
      })
      if (error) {
        return { ok: false as const, error: apiErrorMessage(error, 'حذف گروهی ناموفق بود') }
      }
    }

    const set = new Set(unique)
    items.value = items.value.filter(m => !set.has(m.id))
    return { ok: true as const, error: null as null }
  }

  async function registerExternalUrl(url: string, meta?: Partial<SellerMediaItem>) {
    if (!url.trim()) return null
    const existing = getByUrl(url)
    if (existing) return existing

    const { result, error } = await usePost<any>('/seller/media/register', {
      url: url.trim(),
      filename: meta?.filename,
      mimeType: meta?.mimeType,
      kind: meta?.kind,
      alt: meta?.alt,
      title: meta?.title,
      description: meta?.description,
      width: meta?.width,
      height: meta?.height,
      sizeBytes: meta?.sizeBytes,
      usageHints: meta?.usageHints,
    }, { headers: { 'no-error': true } })

    if (error || !result?.id) return null
    const item = toItem(result)
    upsertLocal(item)
    return item
  }

  return {
    media,
    listMeta,
    pending,
    ensureLoaded,
    fetchList,
    getById,
    getByUrl,
    uploadFiles,
    updateMedia,
    deleteMedia,
    registerExternalUrl,
  }
}

function readImageDims(url: string): Promise<{ width: number, height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('dim-fail'))
    img.src = url
  })
}
