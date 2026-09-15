/** Curated Tabler icon keys (without `i-tabler-` prefix) for admin pickers. */
export const sellerAdminIconKeys: string[] = [
  // nav / ui
  'menu-2',
  'category',
  'layout-grid',
  'layout-navbar',
  'home',
  'home-2',
  'apps',
  'dots',
  'search',
  'filter',
  'settings',
  'adjustments',
  'user',
  'users',
  'user-circle',
  'login',
  'logout',
  'bell',
  'bell-ringing',
  'mail',
  'message',
  'message-circle',
  'messages',
  'phone',
  'phone-call',
  'map-pin',
  'map',
  'world',
  'world-www',
  'link',
  'external-link',
  'share',
  'share-2',
  'copy',
  'clipboard',
  'eye',
  'eye-off',
  'lock',
  'lock-open',
  'key',
  'shield',
  'shield-check',
  'shield-lock',
  'circle-check',
  'circle-x',
  'alert-circle',
  'alert-triangle',
  'info-circle',
  'help',
  'question-mark',
  'plus',
  'minus',
  'x',
  'check',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'chevron-down',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-down',
  'arrows-exchange',
  'refresh',
  'reload',
  'trash',
  'edit',
  'pencil',
  'photo',
  'photo-plus',
  'camera',
  'camera-plus',
  'video',
  'player-play',
  'player-pause',
  'microphone',
  'volume',
  'headphones',
  'speakerphone',
  // devices / categories
  'device-mobile',
  'device-laptop',
  'device-tablet',
  'device-desktop',
  'device-watch',
  'device-tv',
  'device-gamepad-2',
  'device-floppy',
  'cpu',
  'circuit-board',
  'battery-charging',
  'plug',
  'usb',
  'wifi',
  'bluetooth',
  'router',
  'printer',
  'keyboard',
  'mouse',
  'qrcode',
  'barcode',
  // commerce
  'building-store',
  'building',
  'building-skyscraper',
  'shopping-bag',
  'shopping-cart',
  'basket',
  'package',
  'package-export',
  'box',
  'boxes',
  'truck',
  'truck-delivery',
  'plane',
  'ship',
  'tag',
  'tags',
  'discount',
  'discount-2',
  'receipt',
  'receipt-2',
  'cash',
  'coin',
  'coins',
  'wallet',
  'credit-card',
  'building-bank',
  'chart-bar',
  'chart-line',
  'chart-pie',
  'trending-up',
  'trending-down',
  'gift',
  'gift-card',
  'ticket',
  'percentage',
  'currency-dollar',
  'currency-euro',
  // lifestyle
  'heart',
  'heart-filled',
  'star',
  'star-filled',
  'thumb-up',
  'thumb-down',
  'mood-smile',
  'mood-happy',
  'flame',
  'bolt',
  'sparkles',
  'award',
  'trophy',
  'medal',
  'crown',
  'diamond',
  'rosette',
  'certificate',
  'license',
  // home / fashion / beauty
  'sofa',
  'lamp',
  'bed',
  'bath',
  'microwave',
  'fridge',
  'washing-machine',
  'shirt',
  'hanger',
  'shoe',
  'glasses',
  'perfume',
  'bottle',
  'scissors',
  'cut',
  // kids / pets / sport
  'baby-carriage',
  'baby-bottle',
  'paw',
  'dog',
  'cat',
  'ball-football',
  'ball-basketball',
  'ball-tennis',
  'run',
  'swim',
  'bike',
  'motorbike',
  'car',
  'car-suv',
  'bus',
  'train',
  // content
  'book',
  'book-2',
  'notebook',
  'news',
  'article',
  'file',
  'file-text',
  'files',
  'folder',
  'folder-open',
  'bookmark',
  'bookmarks',
  'calendar',
  'calendar-event',
  'clock',
  'history',
  'hourglass',
  'tools',
  'tool',
  'hammer',
  'screwdriver',
  'ruler',
  'palette',
  'brush',
  'paint',
  'music',
  'movie',
  'trademark',
  'brand-instagram',
  'brand-telegram',
  'brand-whatsapp',
  'brand-x',
  'brand-facebook',
  'brand-youtube',
  'brand-linkedin',
  'brand-apple',
  'brand-android',
  'brand-google',
  'brand-google-play',
]

/** @deprecated Prefer `sellerAdminIconKeys`; kept for older imports that expect `{ key, label }`. */
export const sellerAdminIconOptions: { key: string, label: string }[] = sellerAdminIconKeys.map(key => ({
  key,
  label: key,
}))

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i

/**
 * Legacy / shorthand keys stored on categories (and older seeds) → Tabler slug.
 * Without this, `mobile` becomes `i-tabler-mobile` which does not exist.
 */
export const sellerAdminIconAliases: Record<string, string> = {
  mobile: 'device-mobile',
  phone: 'device-mobile',
  cellphone: 'device-mobile',
  laptop: 'device-laptop',
  notebook: 'device-laptop',
  audio: 'headphones',
  headphone: 'headphones',
  headphones: 'headphones',
  tv: 'device-tv',
  television: 'device-tv',
  watch: 'device-watch',
  smartwatch: 'device-watch',
  gaming: 'device-gamepad-2',
  game: 'device-gamepad-2',
  gamepad: 'device-gamepad-2',
  fashion: 'shirt',
  clothing: 'shirt',
  beauty: 'sparkles',
  cosmetics: 'sparkles',
}

/** True when the value is an uploaded/custom image URL or path (not a Tabler key). */
export function isSellerAdminIconImage(icon: string) {
  const raw = String(icon || '').trim()
  if (!raw) return false
  if (
    raw.startsWith('http://')
    || raw.startsWith('https://')
    || raw.startsWith('blob:')
    || raw.startsWith('data:')
  ) {
    return true
  }
  if (raw.startsWith('/uploads/') || raw.startsWith('/images/')) return true
  if (IMAGE_EXT_RE.test(raw)) return true
  return false
}

function applySellerAdminIconAlias(slug: string) {
  const key = String(slug || '').trim().replace(/^tabler-/i, '')
  if (!key) return 'category'
  return sellerAdminIconAliases[key] || key
}

/** Normalize stored icon to a Nuxt Icon / UIcon name (`i-tabler-…`). Image URLs are returned as-is. */
export function resolveSellerAdminIconName(icon: string) {
  const raw = String(icon || '').trim()
  if (!raw) return 'i-tabler-category'
  if (isSellerAdminIconImage(raw)) return raw

  if (raw.startsWith('i-tabler-')) {
    return `i-tabler-${applySellerAdminIconAlias(raw.slice('i-tabler-'.length))}`
  }
  if (raw.startsWith('tabler:')) {
    return `i-tabler-${applySellerAdminIconAlias(raw.slice('tabler:'.length))}`
  }
  if (raw.startsWith('i-')) {
    // Unknown collection prefix — keep as-is unless it is a bare alias without collection
    return raw
  }
  return `i-tabler-${applySellerAdminIconAlias(raw)}`
}

/** Strip `i-tabler-` / `tabler:` for storage as a short key. Images stay as URL. */
export function normalizeSellerAdminIconKey(icon: string) {
  const raw = String(icon || '').trim()
  if (!raw) return ''
  if (isSellerAdminIconImage(raw)) return raw
  if (raw.startsWith('i-tabler-')) return raw.slice('i-tabler-'.length)
  if (raw.startsWith('tabler:')) return raw.slice('tabler:'.length)
  if (raw.startsWith('i-')) return raw
  return raw.replace(/^tabler-/i, '')
}
