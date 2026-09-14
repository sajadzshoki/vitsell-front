import { emptySeoMeta, type SeoMeta } from '~/data/seo'
import {
  contentToHtml,
  isEmptyHtml,
  textToContent,
} from '~/data/seller-blog'
import {
  faqCategories as defaultFaqCategories,
  faqItems as defaultFaqItems,
  staticPages,
  type StaticFaqCategory,
  type StaticFaqItem,
  type StaticPage,
  type StaticPageId,
  type StaticSection,
} from '~/data/static-pages'

export type SellerPageStatus = 'draft' | 'published' | 'archived'

export type SellerManagedPage = Omit<StaticPage, 'id'> & {
  id: string
  sourceId: StaticPageId | null
  status: SellerPageStatus
  seo: SeoMeta
  publishedAt: string | null
  template: string
  createdAt: string
  updatedAt: string
}

export type SellerFaqCategoryForm = StaticFaqCategory
export type SellerFaqItemForm = StaticFaqItem

export type SellerPageFormValues = {
  id: string
  path: string
  title: string
  subtitle: string
  icon: string
  status: SellerPageStatus
  template: string
  publishedAt: string
  seo: SeoMeta
  /** فقط سکشن‌های paragraphs / list برای ویرایش ساده */
  paragraphSections: { itemsText: string }[]
  listSections: { title: string, itemsText: string }[]
  faqCategories: SellerFaqCategoryForm[]
  faqItems: SellerFaqItemForm[]
}

export const sellerPageStatusMeta: Record<
  SellerPageStatus,
  { label: string, color: 'neutral' | 'success' | 'warning' }
> = {
  draft: { label: 'پیش‌نویس', color: 'neutral' },
  published: { label: 'منتشر شده', color: 'success' },
  archived: { label: 'بایگانی', color: 'warning' },
}

export const sellerPageTemplates = [
  { value: 'default', label: 'پیش‌فرض' },
  { value: 'guide', label: 'راهنما' },
  { value: 'legal', label: 'حقوقی' },
  { value: 'faq', label: 'سوالات متداول' },
] as const

export function emptyFaqCategory(): SellerFaqCategoryForm {
  return { id: '', label: '', icon: 'i-tabler-help-circle' }
}

export function emptyFaqItem(categoryId = ''): SellerFaqItemForm {
  return { categoryId, question: '', answer: '' }
}

export function extractFaqFromSections(sections: StaticSection[]): {
  categories: SellerFaqCategoryForm[]
  items: SellerFaqItemForm[]
} {
  const faq = sections.find((s): s is Extract<StaticSection, { type: 'faq' }> => s.type === 'faq')
  if (!faq) {
    return {
      categories: defaultFaqCategories.map(c => ({ ...c })),
      items: defaultFaqItems.map(i => ({ ...i })),
    }
  }
  return {
    categories: faq.categories.map(c => ({ ...c })),
    items: faq.items.map(i => ({ ...i })),
  }
}

function sectionsToEditable(sections: StaticSection[]) {
  const paragraphSections: { itemsText: string }[] = []
  const listSections: { title: string, itemsText: string }[] = []
  for (const section of sections) {
    if (section.type === 'paragraphs') {
      paragraphSections.push({ itemsText: contentToHtml(section.items) })
    }
    else if (section.type === 'list') {
      listSections.push({
        title: section.title || '',
        itemsText: section.items.join('\n'),
      })
    }
  }
  if (!paragraphSections.length) paragraphSections.push({ itemsText: '' })
  const faq = extractFaqFromSections(sections)
  return {
    paragraphSections,
    listSections,
    faqCategories: faq.categories,
    faqItems: faq.items,
  }
}

function buildFaqSection(form: SellerPageFormValues): Extract<StaticSection, { type: 'faq' }> | null {
  const categories = form.faqCategories
    .map(c => ({
      id: c.id.trim(),
      label: c.label.trim(),
      icon: c.icon.trim() || 'i-tabler-help-circle',
    }))
    .filter(c => c.id && c.label)
  const categoryIds = new Set(categories.map(c => c.id))
  const items = form.faqItems
    .map(i => ({
      categoryId: i.categoryId.trim(),
      question: i.question.trim(),
      answer: i.answer.trim(),
    }))
    .filter(i => i.question && i.answer && categoryIds.has(i.categoryId))

  if (!categories.length && !items.length) return null
  return { type: 'faq', categories, items }
}

function editableToSections(form: SellerPageFormValues, previous?: StaticSection[]): StaticSection[] {
  const preserved = (previous || []).filter(
    s => s.type !== 'paragraphs' && s.type !== 'list' && s.type !== 'faq',
  )
  const paragraphs: StaticSection[] = form.paragraphSections
    .map((s) => {
      const items = textToContent(s.itemsText)
      return { type: 'paragraphs' as const, items }
    })
    .filter(s => s.items.length && !isEmptyHtml(s.items.join('')))
  const lists: StaticSection[] = form.listSections
    .map(s => ({
      type: 'list' as const,
      title: s.title.trim() || undefined,
      items: s.itemsText
        .split('\n')
        .map(i => i.trim())
        .filter(Boolean),
    }))
    .filter(s => s.items.length)
  const faq = buildFaqSection(form)
  const faqSections: StaticSection[] = faq ? [faq] : []
  // FAQ template: Q&A first; other templates keep paragraphs/lists then FAQ if present
  if (form.template === 'faq' || form.id === 'faq') {
    return [...faqSections, ...paragraphs, ...lists, ...preserved]
  }
  return [...paragraphs, ...lists, ...faqSections, ...preserved]
}

export function normalizeStaticPage(page: StaticPage): SellerManagedPage {
  const now = new Date().toISOString()
  return {
    ...page,
    id: page.id,
    sourceId: page.id,
    status: 'published',
    seo: emptySeoMeta(),
    publishedAt: now,
    template: page.id.startsWith('guide-')
      ? 'guide'
      : (page.id === 'terms' || page.id === 'privacy' || page.id === 'returns')
          ? 'legal'
          : page.id === 'faq'
            ? 'faq'
            : 'default',
    createdAt: now,
    updatedAt: now,
  }
}

export function buildDefaultSellerPages(): SellerManagedPage[] {
  return Object.values(staticPages).map(normalizeStaticPage)
}

export function emptyPageForm(): SellerPageFormValues {
  return {
    id: '',
    path: '/',
    title: '',
    subtitle: '',
    icon: 'i-tabler-file-text',
    status: 'draft',
    template: 'default',
    publishedAt: '',
    seo: emptySeoMeta(),
    paragraphSections: [{ itemsText: '' }],
    listSections: [],
    faqCategories: [],
    faqItems: [],
  }
}

export function toPageForm(page: SellerManagedPage): SellerPageFormValues {
  const editable = sectionsToEditable(page.sections)
  return {
    id: page.id,
    path: page.path,
    title: page.title,
    subtitle: page.subtitle,
    icon: page.icon,
    status: page.status,
    template: page.template,
    publishedAt: page.publishedAt ? page.publishedAt.slice(0, 16) : '',
    seo: { ...emptySeoMeta(), ...page.seo },
    paragraphSections: editable.paragraphSections,
    listSections: editable.listSections,
    faqCategories: editable.faqCategories,
    faqItems: editable.faqItems,
  }
}

export function isFaqPage(page: Pick<SellerPageFormValues, 'id' | 'template'> | SellerManagedPage) {
  return page.id === 'faq' || page.template === 'faq'
}

export function formToSellerPage(
  form: SellerPageFormValues,
  previous?: SellerManagedPage | null,
): SellerManagedPage {
  const now = new Date().toISOString()
  const status = form.status
  const publishedAt = status === 'published'
    ? (form.publishedAt.trim()
        ? new Date(form.publishedAt).toISOString()
        : (previous?.publishedAt || now))
    : previous?.publishedAt ?? null

  return {
    id: form.id.trim(),
    sourceId: previous?.sourceId ?? null,
    path: form.path.trim().startsWith('/') ? form.path.trim() : `/${form.path.trim()}`,
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    icon: form.icon.trim() || 'i-tabler-file-text',
    sections: editableToSections(form, previous?.sections),
    status,
    seo: { ...emptySeoMeta(), ...form.seo },
    publishedAt,
    template: form.template || 'default',
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function pageIdPattern() {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/
}
