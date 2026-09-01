export type SellerMediaKind = 'image' | 'video' | 'document' | 'other'

export type SellerMediaItem = {
  id: string
  url: string
  filename: string
  mimeType: string
  kind: SellerMediaKind
  alt: string
  title: string
  description: string
  width: number | null
  height: number | null
  sizeBytes: number | null
  createdAt: string
  updatedAt: string
  /** Soft usage hints — only when known; never invent "unused" */
  usageHints: string[]
}

export function mediaKindFromMime(mime: string): SellerMediaKind {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (
    mime.includes('pdf')
    || mime.includes('document')
    || mime.includes('sheet')
    || mime.includes('text/')
  ) {
    return 'document'
  }
  return 'other'
}

export function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function filenameFromUrl(url: string) {
  try {
    const path = url.split('?')[0] || url
    const part = path.split('/').pop() || 'file'
    return decodeURIComponent(part)
  }
  catch {
    return 'file'
  }
}

export function buildDefaultMediaLibrary(): SellerMediaItem[] {
  const now = Date.now()
  const samples = [
    { url: '/images/products/iphone.png', filename: 'iphone.png', w: 800, h: 800, hint: 'محصول: آیفون' },
    { url: '/images/products/galaxy.png', filename: 'galaxy.png', w: 800, h: 800, hint: 'محصول: گلکسی' },
    { url: '/images/categories/mobile.jpg', filename: 'mobile.jpg', w: 1200, h: 600, hint: 'دسته: موبایل' },
    { url: '/images/banners/home-1.jpg', filename: 'home-1.jpg', w: 1600, h: 600, hint: 'بنر صفحه اصلی' },
  ]
  return samples.map((s, i) => ({
    id: `media-${i + 1}`,
    url: s.url,
    filename: s.filename,
    mimeType: 'image/jpeg',
    kind: 'image' as const,
    alt: s.filename.replace(/\.\w+$/, ''),
    title: s.filename,
    description: '',
    width: s.w,
    height: s.h,
    sizeBytes: 240_000 + i * 12_000,
    createdAt: new Date(now - (i + 1) * 86400_000).toISOString(),
    updatedAt: new Date(now - (i + 1) * 86400_000).toISOString(),
    usageHints: s.hint ? [s.hint] : [],
  }))
}
