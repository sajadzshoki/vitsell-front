/** Curated Tabler icon keys (without `i-tabler-` prefix) for admin pickers. */
export const sellerAdminIconOptions: { key: string, label: string }[] = [
  { key: 'category', label: 'دسته' },
  { key: 'device-mobile', label: 'موبایل' },
  { key: 'device-laptop', label: 'لپ‌تاپ' },
  { key: 'device-tablet', label: 'تبلت' },
  { key: 'device-desktop', label: 'دسکتاپ' },
  { key: 'device-watch', label: 'ساعت' },
  { key: 'device-tv', label: 'تلویزیون' },
  { key: 'device-gamepad-2', label: 'گیمینگ' },
  { key: 'headphones', label: 'هدفون' },
  { key: 'camera', label: 'دوربین' },
  { key: 'speakerphone', label: 'اسپیکر' },
  { key: 'battery-charging', label: 'باتری' },
  { key: 'plug', label: 'شارژر' },
  { key: 'home', label: 'خانه' },
  { key: 'sofa', label: 'مبلمان' },
  { key: 'lamp', label: 'لامپ' },
  { key: 'shirt', label: 'پوشاک' },
  { key: 'shoe', label: 'کفش' },
  { key: 'hanger', label: 'مد' },
  { key: 'sparkles', label: 'زیبایی' },
  { key: 'bottle', label: 'بطری' },
  { key: 'perfume', label: 'عطر' },
  { key: 'car', label: 'خودرو' },
  { key: 'bike', label: 'دوچرخه' },
  { key: 'book', label: 'کتاب' },
  { key: 'baby-carriage', label: 'کودک' },
  { key: 'paw', label: 'حیوانات' },
  { key: 'ball-football', label: 'ورزش' },
  { key: 'tools', label: 'ابزار' },
  { key: 'building-store', label: 'فروشگاه' },
  { key: 'tag', label: 'برچسب' },
  { key: 'discount', label: 'تخفیف' },
  { key: 'gift', label: 'هدیه' },
  { key: 'heart', label: 'علاقه‌مندی' },
  { key: 'star', label: 'ویژه' },
  { key: 'trademark', label: 'برند' },
  { key: 'package', label: 'بسته' },
  { key: 'box', label: 'جعبه' },
  { key: 'shopping-bag', label: 'خرید' },
  { key: 'world', label: 'جهانی' },
]

export function resolveSellerAdminIconName(icon: string) {
  const raw = String(icon || '').trim()
  if (!raw) return 'i-tabler-category'
  if (raw.startsWith('i-')) return raw
  return `i-tabler-${raw}`
}
