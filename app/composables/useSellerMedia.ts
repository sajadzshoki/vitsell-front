import {
  buildDefaultMediaLibrary,
  filenameFromUrl,
  mediaKindFromMime,
  type SellerMediaItem,
} from '~/data/seller-media'

export function useSellerMedia() {
  const items = useState<SellerMediaItem[]>('seller-media-library', () => [])
  const seeded = useState('seller-media-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      items.value = buildDefaultMediaLibrary()
      seeded.value = true
    }
    return items.value
  }

  const media = computed(() => items.value)

  function getById(id: string) {
    return items.value.find(m => m.id === id) ?? null
  }

  function getByUrl(url: string) {
    return items.value.find(m => m.url === url) ?? null
  }

  async function uploadFiles(files: File[]) {
    ensureLoaded()
    const uploaded: SellerMediaItem[] = []
    for (const file of files) {
      const fm = new FormData()
      fm.append('file', file)
      const { result, error } = await usePost<{ url?: string, path?: string } | string>(
        '/upload',
        fm,
        { headers: { 'no-error': true } },
      )
      let url = ''
      if (typeof result === 'string') url = result
      else if (result && typeof result === 'object') {
        url = String((result as any).url || (result as any).path || '')
      }
      if (error || !url) {
        // Fallback: object URL for frontend-only preview when upload API fails
        url = URL.createObjectURL(file)
      }
      const now = new Date().toISOString()
      const item: SellerMediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url,
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        kind: mediaKindFromMime(file.type || ''),
        alt: file.name.replace(/\.\w+$/, ''),
        title: file.name,
        description: '',
        width: null,
        height: null,
        sizeBytes: file.size,
        createdAt: now,
        updatedAt: now,
        usageHints: [],
      }
      if (item.kind === 'image') {
        try {
          const dims = await readImageDims(url)
          item.width = dims.width
          item.height = dims.height
        }
        catch { /* ignore */ }
      }
      uploaded.push(item)
    }
    items.value = [...uploaded, ...items.value]
    return { ok: true as const, items: uploaded }
  }

  function updateMedia(id: string, patch: Partial<Pick<SellerMediaItem, 'alt' | 'title' | 'description' | 'usageHints'>>) {
    ensureLoaded()
    const index = items.value.findIndex(m => m.id === id)
    if (index === -1) return { ok: false as const, error: 'رسانه پیدا نشد' }
    const previous = items.value[index]!
    const next: SellerMediaItem = {
      ...previous,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    return { ok: true as const, item: next }
  }

  function deleteMedia(ids: string[]) {
    ensureLoaded()
    const set = new Set(ids)
    items.value = items.value.filter(m => !set.has(m.id))
    return { ok: true as const }
  }

  function registerExternalUrl(url: string, meta?: Partial<SellerMediaItem>) {
    ensureLoaded()
    if (!url.trim()) return null
    const existing = getByUrl(url)
    if (existing) return existing
    const now = new Date().toISOString()
    const item: SellerMediaItem = {
      id: `media-ext-${Date.now()}`,
      url,
      filename: filenameFromUrl(url),
      mimeType: 'image/*',
      kind: 'image',
      alt: meta?.alt || '',
      title: meta?.title || filenameFromUrl(url),
      description: meta?.description || '',
      width: meta?.width ?? null,
      height: meta?.height ?? null,
      sizeBytes: meta?.sizeBytes ?? null,
      createdAt: now,
      updatedAt: now,
      usageHints: meta?.usageHints || [],
    }
    items.value = [item, ...items.value]
    return item
  }

  return {
    media,
    ensureLoaded,
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
