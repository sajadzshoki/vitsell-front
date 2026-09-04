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

/** @deprecated Seed mock — library is loaded from GET /seller/media */
export function buildDefaultMediaLibrary(): SellerMediaItem[] {
  return []
}
