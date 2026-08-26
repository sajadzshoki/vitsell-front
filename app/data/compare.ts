import type { Product } from '~/data/products'

export const COMPARE_MAX = 4

export type CompareSection = {
  title: string
  rows: string[]
}

export const compareTemplates: Record<string, CompareSection[]> = {
  mobile: [
    { title: 'اطلاعات عمومی', rows: ['مدل', 'رنگ'] },
    { title: 'نمایشگر', rows: ['نمایشگر', 'اندازه صفحه', 'رزولوشن'] },
    { title: 'عملکرد', rows: ['پردازنده', 'حافظه داخلی', 'RAM'] },
    { title: 'دوربین و باتری', rows: ['دوربین', 'باتری'] },
    { title: 'سیستم و شبکه', rows: ['سیستم‌عامل', 'شبکه و ارتباطات'] },
    { title: 'مشخصات فیزیکی', rows: ['وزن', 'ابعاد'] },
  ],
  laptop: [
    { title: 'اطلاعات عمومی', rows: ['مدل', 'رنگ'] },
    { title: 'عملکرد', rows: ['پردازنده', 'RAM', 'حافظه', 'کارت گرافیک'] },
    { title: 'نمایشگر', rows: ['نوع نمایشگر', 'اندازه صفحه', 'رزولوشن'] },
    { title: 'سایر', rows: ['باتری', 'سیستم‌عامل', 'وزن'] },
  ],
  audio: [
    { title: 'اطلاعات عمومی', rows: ['مدل', 'رنگ'] },
    { title: 'صدا و اتصال', rows: ['نوع', 'بلوتوث', 'نویزکنسلینگ'] },
    { title: 'باتری و شارژ', rows: ['مدت پخش', 'شارژ', 'مقاومت در برابر آب'] },
    { title: 'مشخصات فیزیکی', rows: ['وزن'] },
  ],
  watch: [
    { title: 'اطلاعات عمومی', rows: ['مدل', 'رنگ'] },
    { title: 'نمایشگر', rows: ['نمایشگر', 'اندازه صفحه'] },
    { title: 'باتری و مقاومت', rows: ['باتری', 'مقاومت در برابر آب'] },
    { title: 'سایر', rows: ['سنسورها', 'وزن'] },
  ],
  gaming: [
    { title: 'اطلاعات عمومی', rows: ['مدل'] },
    { title: 'عملکرد', rows: ['پردازنده', 'RAM', 'حافظه'] },
    { title: 'سیستم', rows: ['درایو', 'پورت‌ها'] },
    { title: 'مشخصات فیزیکی', rows: ['وزن'] },
  ],
  tv: [
    { title: 'اطلاعات عمومی', rows: ['مدل'] },
    { title: 'نمایشگر', rows: ['اندازه صفحه', 'رزولوشن', 'نوع پنل', 'نرخ نوسازی'] },
    { title: 'سیستم و خروجی', rows: ['سیستم هوشمند', 'پورت‌ها'] },
    { title: 'مشخصات فیزیکی', rows: ['وزن'] },
  ],
  camera: [
    { title: 'اطلاعات عمومی', rows: ['مدل'] },
    { title: 'تصویربرداری', rows: ['سنسور', 'رزولوشن', 'فیلم‌برداری', 'ویسفر'] },
    { title: 'حافظه و باتری', rows: ['کارت حافظه', 'باتری'] },
    { title: 'مشخصات فیزیکی', rows: ['وزن', 'ابعاد'] },
  ],
  home: [
    { title: 'اطلاعات عمومی', rows: ['مدل'] },
    { title: 'مشخصات', rows: ['قدرت', 'ظرفیت', 'شارژ/باتری'] },
    { title: 'ویژگی‌ها', rows: ['ویژگی‌ها', 'وزن'] },
  ],
  fashion: [
    { title: 'اطلاعات عمومی', rows: ['مدل', 'رنگ'] },
    { title: 'سایر', rows: ['سایز', 'ویژگی‌ها'] },
  ],
  beauty: [
    { title: 'اطلاعات عمومی', rows: ['مدل'] },
    { title: 'سایر', rows: ['حجم', 'ویژگی‌ها'] },
  ],
}

export function compareSectionsFor(categories: string[]): CompareSection[] {
  const order: string[] = []
  const map: Record<string, string[]> = {}

  for (const category of categories) {
    const template = compareTemplates[category]
    if (!template) continue

    for (const section of template) {
      if (!map[section.title]) {
        map[section.title] = []
        order.push(section.title)
      }
      for (const row of section.rows) {
        if (!map[section.title]!.includes(row)) {
          map[section.title]!.push(row)
        }
      }
    }
  }

  if (!order.length) {
    return [{ title: 'مشخصات', rows: ['مدل', 'رنگ'] }]
  }

  return order.map(title => ({ title, rows: map[title]! }))
}

export const radarCriteriaByCategory: Record<string, string[]> = {
  mobile: ['عملکرد', 'دوربین', 'باتری', 'نمایشگر', 'طراحی', 'ارزش خرید'],
  laptop: ['عملکرد', 'نمایشگر', 'باتری', 'قابلیت حمل', 'کیفیت ساخت', 'ارزش خرید'],
  audio: ['کیفیت صدا', 'حذف نویز', 'باتری', 'راحتی', 'امکانات', 'ارزش خرید'],
  watch: ['نمایشگر', 'باتری', 'سنسورها', 'قابلیت حمل', 'امکانات', 'ارزش خرید'],
  camera: ['کیفیت تصویر', 'فیلم‌برداری', 'فوکوس خودکار', 'باتری', 'قابلیت حمل', 'ارزش خرید'],
  gaming: ['عملکرد', 'گرافیک', 'حافظه', 'سرعت', 'ارزش خرید'],
  tv: ['کیفیت تصویر', 'صدا', 'سیستم هوشمند', 'پورت‌ها', 'ارزش خرید'],
  home: ['قدرت', 'کیفیت ساخت', 'باتری', 'امکانات', 'ارزش خرید'],
  fashion: ['کیفیت ساخت', 'راحتی', 'طراحی', 'ارزش خرید'],
  beauty: ['کیفیت', 'پایداری', 'بسته‌بندی', 'ارزش خرید'],
}

/** Chart series colors aligned with digishop brand tokens */
export const radarChartColors = ['#2563EB', '#111827', '#16a34a', '#f59e0b'] as const

export function radarCriteriaFor(categories: string[]): string[] {
  const list: string[] = []

  for (const category of categories) {
    for (const criterion of radarCriteriaByCategory[category] ?? []) {
      if (!list.includes(criterion)) list.push(criterion)
    }
  }

  if (!list.length) return ['عملکرد', 'کیفیت', 'ارزش خرید']
  return list.slice(0, 6)
}

const highlightLabels: Record<string, string> = {
  'دوربین': 'بهترین دوربین',
  'باتری': 'بهترین باتری',
  'عملکرد': 'بالاترین عملکرد',
  'نمایشگر': 'بهترین نمایشگر',
  'کیفیت تصویر': 'بهترین کیفیت تصویر',
  'کیفیت صدا': 'بهترین کیفیت صدا',
  'ارزش خرید': 'بیشترین ارزش خرید',
}

export function highlightLabel(criterion: string): string {
  return highlightLabels[criterion] ?? `بهترین ${criterion}`
}

const specAliases: Record<string, string[]> = {
  'سیستم‌عامل': ['سیستم عامل'],
  'سیستم عامل': ['سیستم‌عامل'],
  'RAM': ['رم'],
  'رم': ['RAM'],
}

function findSpecValue(product: Product, key: string): string | undefined {
  const direct = product.specs?.find(spec => spec.key === key)?.value
  if (direct) return direct

  const aliases = specAliases[key] ?? []
  for (const alias of aliases) {
    const value = product.specs?.find(spec => spec.key === alias)?.value
    if (value) return value
  }

  return undefined
}

export function compareSpecValue(product: Product, key: string): string {
  if (key === 'برند') return product.brand
  if (key === 'مدل') return product.shortName ?? product.title
  if (key === 'رنگ' && product.colors?.length) {
    return product.colors.map(color => color.name).join('، ')
  }

  return findSpecValue(product, key) ?? '—'
}

export function getProductShortName(product: Product): string {
  return product.shortName ?? product.brand
}

export function getProductScores(product: Product): Record<string, number> {
  if (product.scores) return product.scores

  const criteria = radarCriteriaFor([product.category])
  const scores: Record<string, number> = {}
  let hash = 0

  for (const char of product.id) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000
  }

  const ratingBoost = Math.round((product.rating - 4) * 12)

  criteria.forEach((criterion, index) => {
    const base = 48 + ((hash + index * 19) % 42)
    scores[criterion] = Math.min(98, Math.max(32, base + ratingBoost))
  })

  return scores
}
