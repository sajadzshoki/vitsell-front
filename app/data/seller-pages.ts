import { emptySeoMeta, type SeoMeta } from '~/data/seo'
import {
  staticPages,
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

function sectionsToEditable(sections: StaticSection[]) {
  const paragraphSections: { itemsText: string }[] = []
  const listSections: { title: string, itemsText: string }[] = []
  for (const section of sections) {
    if (section.type === 'paragraphs') {
      paragraphSections.push({ itemsText: section.items.join('\n\n') })
    }
    else if (section.type === 'list') {
      listSections.push({
        title: section.title || '',
        itemsText: section.items.join('\n'),
      })
    }
  }
  if (!paragraphSections.length) paragraphSections.push({ itemsText: '' })
  return { paragraphSections, listSections }
}

function editableToSections(form: SellerPageFormValues, previous?: StaticSection[]): StaticSection[] {
  const preserved = (previous || []).filter(s => s.type !== 'paragraphs' && s.type !== 'list')
  const paragraphs: StaticSection[] = form.paragraphSections
    .map(s => ({
      type: 'paragraphs' as const,
      items: s.itemsText
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(Boolean),
    }))
    .filter(s => s.items.length)
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
  return [...paragraphs, ...lists, ...preserved]
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
  }
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
