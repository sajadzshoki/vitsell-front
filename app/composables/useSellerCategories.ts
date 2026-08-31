import { categories as staticCategories, type Category } from '~/data/categories'
import {
  formToSellerCategory,
  sellerCategoryToListItem,
  toSellerCategory,
  type SellerCategory,
  type SellerCategoryFormValues,
} from '~/data/seller-categories'

const categoryOrder = [
  'mobile',
  'laptop',
  'audio',
  'tv',
  'camera',
  'watch',
  'gaming',
  'home',
  'fashion',
  'beauty',
] as const

function sortSellerCategories(list: Category[]) {
  return [...list].sort((a, b) => {
    const ai = categoryOrder.indexOf(a.id as (typeof categoryOrder)[number])
    const bi = categoryOrder.indexOf(b.id as (typeof categoryOrder)[number])
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

export function useSellerCategories() {
  const { list: storefrontList, fetchCategories, pending: fetchPending } = useCategories()

  const items = useState<SellerCategory[]>('seller-categories-items', () => [])
  const seeded = useState('seller-categories-seeded', () => false)
  const pending = useState('seller-categories-pending', () => false)

  const categories = computed(() => items.value)

  function syncStorefront() {
    storefrontList.value = sortSellerCategories(items.value.map(sellerCategoryToListItem))
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && items.value.length && !options?.force) {
      return items.value
    }

    pending.value = true
    try {
      const { categories: fetched } = await fetchCategories({
        withCounts: false,
        force: options?.force,
      })
      const source = fetched.length ? fetched : staticCategories
      items.value = source.map(toSellerCategory)
      seeded.value = true
      syncStorefront()
      return items.value
    }
    finally {
      pending.value = false
    }
  }

  function getById(id: string) {
    return items.value.find(c => c.id === id)
  }

  function createCategory(form: SellerCategoryFormValues) {
    const id = form.id.trim()
    if (getById(id)) {
      return { ok: false as const, error: 'شناسه دسته‌بندی تکراری است' }
    }

    const next = formToSellerCategory(form)
    items.value = [...items.value, next]
    syncStorefront()
    return { ok: true as const, category: next }
  }

  function updateCategory(id: string, form: SellerCategoryFormValues) {
    const index = items.value.findIndex(c => c.id === id)
    if (index === -1) {
      return { ok: false as const, error: 'دسته‌بندی پیدا نشد' }
    }

    const previous = items.value[index]!
    const next = formToSellerCategory({ ...form, id: previous.id }, previous)
    const copy = [...items.value]
    copy[index] = next
    items.value = copy
    syncStorefront()
    return { ok: true as const, category: next }
  }

  function deleteCategory(id: string) {
    const exists = items.value.some(c => c.id === id)
    if (!exists) {
      return { ok: false as const, error: 'دسته‌بندی پیدا نشد' }
    }
    items.value = items.value.filter(c => c.id !== id)
    syncStorefront()
    return { ok: true as const }
  }

  return {
    categories,
    items,
    pending: computed(() => pending.value || fetchPending.value),
    seeded,
    ensureLoaded,
    getById,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
