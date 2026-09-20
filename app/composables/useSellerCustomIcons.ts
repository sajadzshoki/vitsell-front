import { isSellerAdminIconImage, normalizeSellerAdminIconKey } from '~/data/seller-admin-icons'

const STORAGE_KEY = 'seller-custom-icons'
const MAX_ICONS = 80

function readStorage(): string[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(item => String(item || '').trim())
      .filter(Boolean)
      .slice(0, MAX_ICONS)
  }
  catch {
    return []
  }
}

function writeStorage(icons: string[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(icons.slice(0, MAX_ICONS)))
  }
  catch {
    // quota / private mode — ignore
  }
}

function canonicalizeMediaUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  // Prefer stable relative upload path so resolveMediaUrl can retarget API origin.
  const upload = raw.match(/\/uploads\/([\w.-]+\.(?:jpe?g|png|webp|gif|svg))$/i)
  if (upload) return `/uploads/${upload[1]}`
  return raw
}

function normalizeIcon(icon: string) {
  const raw = String(icon || '').trim()
  if (!raw) return ''
  if (isSellerAdminIconImage(raw)) return canonicalizeMediaUrl(raw)
  return normalizeSellerAdminIconKey(raw)
}

/** Persisted library of custom Tabler keys + uploaded image icons for admin pickers. */
export function useSellerCustomIcons() {
  const icons = useState<string[]>('seller-custom-icons', () => [])
  const hydrated = useState('seller-custom-icons-hydrated', () => false)

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    const fromStorage = readStorage()
    if (fromStorage.length) {
      const set = new Set([...fromStorage, ...icons.value])
      icons.value = [...set].slice(0, MAX_ICONS)
    }
    hydrated.value = true
  }

  function persist() {
    writeStorage(icons.value)
  }

  function addIcon(icon: string) {
    const key = normalizeIcon(icon)
    if (!key) return key
    hydrate()
    if (!icons.value.includes(key)) {
      icons.value = [key, ...icons.value].slice(0, MAX_ICONS)
      persist()
    }
    return key
  }

  function addIcons(list: string[]) {
    hydrate()
    const set = new Set(icons.value)
    let changed = false
    for (const item of list) {
      const key = normalizeIcon(item)
      if (!key || set.has(key)) continue
      set.add(key)
      changed = true
    }
    if (changed) {
      icons.value = [...set].slice(0, MAX_ICONS)
      persist()
    }
  }

  function removeIcon(icon: string) {
    const key = normalizeIcon(icon)
    if (!key) return
    hydrate()
    icons.value = icons.value.filter(item => item !== key)
    persist()
  }

  const imageIcons = computed(() =>
    icons.value.filter(icon => isSellerAdminIconImage(icon)),
  )

  const keyIcons = computed(() =>
    icons.value.filter(icon => !isSellerAdminIconImage(icon)),
  )

  return {
    icons,
    imageIcons,
    keyIcons,
    hydrate,
    addIcon,
    addIcons,
    removeIcon,
  }
}
