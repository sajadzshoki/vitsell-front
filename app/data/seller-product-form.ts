import { categories, getCategoryById, getCategoryIcon } from '~/data/categories'
import { compareTemplates, type CompareSection } from '~/data/compare'
import { categoryLabels, type Product, type ProductColor, type ProductSpec } from '~/data/products'

export type SellerProductFieldType = 'text' | 'select' | 'number' | 'textarea'

export type SellerProductField = {
  key: string
  label: string
  type: SellerProductFieldType
  required?: boolean
  options?: string[]
  placeholder?: string
  group: string
  help?: string
}

export type SellerProductFormValues = {
  category: string
  title: string
  shortName: string
  brand: string
  shortDesc: string
  description: string
  price: string
  oldPrice: string
  stock: string
  image: string
  badge: string
  fastDelivery: boolean
  colors: ProductColor[]
  attrs: Record<string, string>
}

export const sellerProductBadges = [
  '',
  'پیشنهاد ویژه',
  'پرفروش',
  'جدید',
] as const

export const sellerProductColorPresets: ProductColor[] = [
  { name: 'مشکی', hex: '#1c1c1e' },
  { name: 'سفید', hex: '#f5f5f0' },
  { name: 'نقره‌ای', hex: '#c0c0c0' },
  { name: 'آبی', hex: '#3a4a5c' },
  { name: 'طلایی', hex: '#c9a227' },
  { name: 'قرمز', hex: '#b91c1c' },
  { name: 'سبز', hex: '#166534' },
  { name: 'صورتی', hex: '#db2777' },
]

/** گزینه‌های آماده برای فیلدهای پرتکرار هر دسته */
export const sellerProductFieldOptions: Record<string, string[]> = {
  'حافظه داخلی': ['۶۴ گیگابایت', '۱۲۸ گیگابایت', '۲۵۶ گیگابایت', '۵۱۲ گیگابایت', '۱ ترابایت'],
  'حافظه': ['۱۲۸ گیگابایت', '۲۵۶ گیگابایت', '۵۱۲ گیگابایت', '۱ ترابایت', '۲ ترابایت'],
  RAM: ['۴ گیگابایت', '۶ گیگابایت', '۸ گیگابایت', '۱۲ گیگابایت', '۱۶ گیگابایت', '۱۸ گیگابایت', '۳۲ گیگابایت', '۶۴ گیگابایت'],
  'سیستم‌عامل': ['Android', 'iOS', 'iPadOS', 'Windows 11', 'macOS', 'بدون سیستم‌عامل'],
  بلوتوث: ['دارد', 'ندارد', 'Bluetooth 5.0', 'Bluetooth 5.2', 'Bluetooth 5.3'],
  نویزکنسلینگ: ['فعال', 'غیرفعال', 'ندارد'],
  'مقاومت در برابر آب': ['ندارد', 'IPX4', 'IPX7', 'IP68', '۵۰ متر', '۱۰۰ متر'],
  'نوع پنل': ['OLED', 'QLED', 'LED', 'Mini-LED', 'LCD'],
  رزولوشن: ['Full HD', '2K', '4K UHD', '8K', 'HD'],
  'نرخ نوسازی': ['۶۰ هرتز', '۹۰ هرتز', '۱۲۰ هرتز', '۱۴۴ هرتز', '۱۶۵ هرتز'],
  سایز: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '۳۸', '۴۰', '۴۲', '۴۴'],
  حجم: ['۳۰ میلی‌لیتر', '۵۰ میلی‌لیتر', '۱۰۰ میلی‌لیتر', '۲۰۰ میلی‌لیتر', '۵۰۰ میلی‌لیتر'],
  رنگ: sellerProductColorPresets.map(c => c.name),
}

const brandOptionsByCategory: Record<string, string[]> = {
  mobile: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Honor', 'Nokia', 'Google', 'Nothing'],
  laptop: ['Apple', 'ASUS', 'Lenovo', 'HP', 'Acer', 'Microsoft', 'Dell', 'MSI'],
  audio: ['Apple', 'Sony', 'JBL', 'Anker', 'Sennheiser', 'Bose', 'Samsung'],
  tv: ['LG', 'Samsung', 'Sony', 'TCL', 'Xiaomi'],
  camera: ['Canon', 'Sony', 'Nikon', 'Fujifilm', 'GoPro'],
  watch: ['Apple', 'Samsung', 'Garmin', 'Huawei', 'Xiaomi'],
  gaming: ['Sony', 'Microsoft', 'Nintendo', 'Valve'],
  home: ['Xiaomi', 'Dyson', 'Philips', 'Bosch', 'LG', 'Samsung'],
  fashion: ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M'],
  beauty: ['Loreal', 'Maybelline', 'Nivea', 'The Ordinary', 'CeraVe'],
}

const defaultTemplate: CompareSection[] = [
  { title: 'اطلاعات عمومی', rows: ['مدل', 'رنگ'] },
  { title: 'مشخصات', rows: ['ویژگی‌ها'] },
]

export function getSellerCategoryOptions() {
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    icon: getCategoryIcon(category.id),
  }))
}

export function getBrandOptions(categoryId: string): string[] {
  const fromMap = brandOptionsByCategory[categoryId]
  if (fromMap?.length) return fromMap

  const category = getCategoryById(categoryId)
  const brandSub = category?.subs.find(sub =>
    sub.name.includes('برند') || sub.name === 'برندها',
  )
  if (brandSub?.items.length) return brandSub.items

  return ['متفرقه']
}

export function getCategoryAttributeSections(categoryId: string): CompareSection[] {
  return compareTemplates[categoryId] ?? defaultTemplate
}

export function getCategoryAttributeFields(categoryId: string): SellerProductField[] {
  if (!categoryId) return []

  const sections = getCategoryAttributeSections(categoryId)
  const fields: SellerProductField[] = []

  for (const section of sections) {
    for (const row of section.rows) {
      if (row === 'رنگ') continue
      const options = sellerProductFieldOptions[row]
      fields.push({
        key: row,
        label: row,
        type: options?.length ? 'select' : 'text',
        options,
        required: row === 'مدل',
        group: section.title,
        placeholder: `${row} را وارد کنید`,
      })
    }
  }

  return fields
}

export function emptySellerProductForm(category = ''): SellerProductFormValues {
  return {
    category,
    title: '',
    shortName: '',
    brand: '',
    shortDesc: '',
    description: '',
    price: '',
    oldPrice: '',
    stock: '',
    image: '',
    badge: '',
    fastDelivery: false,
    colors: [],
    attrs: {},
  }
}

export function parsePriceInput(value: string): number {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

function slugifyTitle(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/gi, '')
    .slice(0, 40)
  return base || 'product'
}

export function buildSellerProductFromForm(form: SellerProductFormValues): Product | null {
  const title = form.title.trim()
  const brand = form.brand.trim()
  const category = form.category
  const price = parsePriceInput(form.price)
  const stock = Number.parseInt(form.stock.replace(/[^\d]/g, '') || '0', 10)
  const oldPrice = parsePriceInput(form.oldPrice)

  if (!title || !brand || !category || price <= 0) return null

  const specs: ProductSpec[] = Object.entries(form.attrs)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => ({ key, value: value.trim() }))

  const id = `seller-${slugifyTitle(form.shortName || title)}-${Date.now().toString().slice(-5)}`

  return {
    id,
    title,
    shortName: form.shortName.trim() || undefined,
    brand,
    category,
    categoryLabel: categoryLabels[category] ?? getCategoryById(category)?.name ?? category,
    price,
    oldPrice: oldPrice > 0 && oldPrice > price ? oldPrice : undefined,
    rating: 0,
    reviews: 0,
    image: form.image.trim() || '/images/noImage.png',
    badge: form.badge || undefined,
    colors: form.colors.length ? form.colors : undefined,
    inStock: stock > 0,
    fastDelivery: form.fastDelivery,
    shortDesc: form.shortDesc.trim() || undefined,
    specs: specs.length ? specs : undefined,
  }
}

export function validateSellerProductForm(
  form: SellerProductFormValues,
  fields: SellerProductField[],
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.category) errors.category = 'دسته‌بندی را انتخاب کنید'
  if (!form.title.trim()) errors.title = 'عنوان محصول الزامی است'
  if (!form.brand.trim()) errors.brand = 'برند الزامی است'

  const price = parsePriceInput(form.price)
  if (price <= 0) errors.price = 'قیمت معتبر وارد کنید'

  const stockRaw = form.stock.trim()
  if (!stockRaw) errors.stock = 'موجودی الزامی است'
  else if (Number.isNaN(Number.parseInt(stockRaw.replace(/[^\d]/g, ''), 10))) {
    errors.stock = 'موجودی معتبر نیست'
  }

  const oldPrice = parsePriceInput(form.oldPrice)
  if (oldPrice > 0 && oldPrice <= price) {
    errors.oldPrice = 'قیمت قبلی باید بیشتر از قیمت فروش باشد'
  }

  for (const field of fields) {
    if (field.required && !form.attrs[field.key]?.trim()) {
      errors[`attr:${field.key}`] = `${field.label} الزامی است`
    }
  }

  return errors
}
