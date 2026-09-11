<template>
  <div class="space-y-5">
    <div class="bg-default border border-muted rounded-2xl p-5 md:p-6 max-lg:(bg-transparent border-0 rounded-none p-0)">
      <TheSellerPageHeader
        :title="tree?.title || $t('ویرایش مگا منو')"
        :description="$t('بخش‌ها و آیتم‌های ناوبری این منو')"
      >
        <template #actions>
          <UButton
            to="/seller/mega-menus"
            color="neutral"
            variant="soft"
            size="sm"
            class="cursor-pointer"
          >
            {{ $t('بازگشت') }}
          </UButton>
          <UButton
            v-if="tree && can('mega_menu.update')"
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            class="cursor-pointer"
            @click="openMenuMeta = true"
          >
            {{ $t('مشخصات منو') }}
          </UButton>
        </template>
      </TheSellerPageHeader>

      <div
        v-if="treePending && !tree"
        class="py-16 flex justify-center"
      >
        <UIcon
          name="i-tabler-loader-2"
          class="size-8 text-muted animate-spin"
        />
      </div>

      <template v-else-if="tree">
        <UAlert
          v-if="adminWarnings.length"
          color="warning"
          variant="subtle"
          icon="i-tabler-alert-triangle"
          class="mb-4"
          :title="$t('نکات مهم برای نمایش در فروشگاه')"
          :description="adminWarnings.join(' ')"
        />

        <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <UBadge
            :color="tree.status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ tree.status === 'active' ? $t('فعال') : $t('غیرفعال') }}
          </UBadge>
          <UButton
            v-if="can('mega_menu.create') || can('mega_menu.update')"
            type="button"
            color="primary"
            size="sm"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="openSectionModal(null)"
          >
            {{ $t('افزودن بخش') }}
          </UButton>
        </div>

        <TheSellerEmptyState
          v-if="!tree.sections.length"
          icon="i-tabler-folders"
          :title="$t('بخشی ثبت نشده')"
          :message="$t('مثلاً «گوشی موبایل» یا «لوازم جانبی»')"
        />

        <div
          v-else
          class="space-y-3"
        >
          <TheSellerMegaMenuSectionCard
            v-for="(section, index) in tree.sections"
            :key="section.id"
            :section="section"
            :siblings="tree.sections"
            :index="index"
            :depth="0"
            @edit-section="openSectionModal"
            @add-child="openSectionModal"
            @add-item="openItemModal"
            @edit-item="openItemModal"
            @move-section="onMoveSection"
            @move-item="onMoveItem"
            @toggle-section="onToggleSection"
            @toggle-item="onToggleItem"
            @delete-section="onDeleteSection"
            @delete-item="onDeleteItem"
          />
        </div>
      </template>
    </div>

    <UModal v-model:open="openMenuMeta">
      <template #content>
        <form
          class="p-5 space-y-4"
          @submit.prevent="saveMenuMeta"
        >
          <h3 class="font-bold text-highlighted">
            {{ $t('مشخصات منو') }}
          </h3>
          <UFormField
            :label="$t('عنوان')"
            required
          >
            <UInput
              v-model="menuMeta.title"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="$t('اسلاگ')"
            :hint="$t('انگلیسی با خط تیره — برای عنوان فارسی حتماً پر کنید')"
            required
          >
            <UInput
              v-model="menuMeta.slug"
              dir="ltr"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="$t('آیکون')">
            <UInput
              v-model="menuMeta.icon"
              dir="ltr"
              placeholder="device-mobile"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="$t('وضعیت')">
            <USelect
              v-model="menuMeta.status"
              :items="statusItems"
              class="w-full"
            />
          </UFormField>
          <div class="flex items-center gap-2 justify-end">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              class="cursor-pointer"
              @click="openMenuMeta = false"
            >
              {{ $t('انصراف') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="saving"
              class="cursor-pointer"
            >
              {{ $t('ذخیره') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UModal v-model:open="sectionModal.open">
      <template #content>
        <form
          class="p-5 space-y-4"
          @submit.prevent="saveSection"
        >
          <h3 class="font-bold text-highlighted">
            {{ sectionModal.editingId ? $t('ویرایش بخش') : $t('افزودن بخش') }}
          </h3>
          <UFormField
            :label="$t('عنوان')"
            required
          >
            <UInput
              v-model="sectionForm.title"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="$t('اسلاگ')"
            :hint="$t('انگلیسی با خط تیره — مثلاً phones-by-tier')"
            required
          >
            <UInput
              v-model="sectionForm.slug"
              dir="ltr"
              placeholder="phones-by-tier"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="$t('بخش والد')">
            <USelect
              v-model="sectionForm.parentId"
              :items="sectionParentItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="$t('دسته‌بندی مرتبط (اختیاری)')"
            :help="$t('همان دسته‌های بخش دسته‌بندی‌ها — برای لینک به صفحه دسته')"
          >
            <USelect
              v-model="sectionForm.categoryId"
              :items="categoryItems"
              value-key="value"
              class="w-full"
              :placeholder="$t('انتخاب دسته‌بندی')"
            />
          </UFormField>
          <UFormField :label="$t('وضعیت')">
            <USelect
              v-model="sectionForm.status"
              :items="statusItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <div class="flex items-center gap-2 justify-end">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              class="cursor-pointer"
              @click="sectionModal.open = false"
            >
              {{ $t('انصراف') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="saving"
              class="cursor-pointer"
            >
              {{ $t('ذخیره') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UModal v-model:open="itemModal.open">
      <template #content>
        <form
          class="p-5 space-y-4 max-h-[80vh] overflow-y-auto"
          @submit.prevent="saveItem"
        >
          <h3 class="font-bold text-highlighted">
            {{ itemModal.editingId ? $t('ویرایش آیتم') : $t('افزودن آیتم') }}
          </h3>
          <UFormField
            :label="$t('عنوان')"
            required
          >
            <UInput
              v-model="itemForm.title"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="$t('اسلاگ')"
            :hint="$t('انگلیسی با خط تیره — مثلاً samsung-mid-range')"
            required
          >
            <UInput
              v-model="itemForm.slug"
              dir="ltr"
              placeholder="samsung-mid-range"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="$t('نوع')">
            <USelect
              v-model="itemForm.type"
              :items="typeItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="itemForm.type === 'category'"
            :label="$t('دسته‌بندی')"
            :help="$t('همان دسته‌های بخش دسته‌بندی‌ها')"
            required
          >
            <USelect
              v-model="itemForm.categoryId"
              :items="categoryItems.filter(i => i.value !== NONE)"
              value-key="value"
              class="w-full"
              :placeholder="$t('انتخاب دسته‌بندی')"
            />
          </UFormField>

          <template v-if="itemForm.type === 'filter'">
            <UFormField
              :label="$t('دسته فیلتر')"
              :help="$t('همان دسته‌های سایت')"
            >
              <USelect
                v-model="itemForm.filter.category"
                :items="categoryItems"
                value-key="value"
                class="w-full"
                :placeholder="$t('انتخاب دسته‌بندی')"
              />
            </UFormField>
            <UFormField :label="$t('برندها')">
              <USelectMenu
                v-model="itemForm.filter.brands"
                :items="brandItems"
                multiple
                class="w-full"
              />
            </UFormField>
            <div class="grid grid-cols-2 gap-3">
              <UFormField :label="$t('حداقل قیمت')">
                <UInput
                  v-model.number="itemForm.filter.minPrice"
                  type="number"
                  min="0"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="$t('حداکثر قیمت')">
                <UInput
                  v-model.number="itemForm.filter.maxPrice"
                  type="number"
                  min="0"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField :label="$t('جستجوی متنی (اختیاری)')">
              <UInput
                v-model="itemForm.filter.q"
                class="w-full"
              />
            </UFormField>
            <div
              v-for="attr in filterableAttributes"
              :key="attr.id"
              class="space-y-1"
            >
              <UFormField :label="attr.name">
                <USelectMenu
                  :model-value="itemForm.filter.attrs[attr.slug] || []"
                  :items="attr.values.filter(v => v.status !== 'inactive').map(v => v.value || v.label)"
                  multiple
                  class="w-full"
                  @update:model-value="setAttrValues(attr.slug, $event)"
                />
              </UFormField>
            </div>
          </template>

          <UFormField
            v-if="itemForm.type === 'link'"
            :label="$t('آدرس')"
            required
          >
            <UInput
              v-model="itemForm.url"
              dir="ltr"
              placeholder="/search یا https://..."
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('وضعیت')">
            <USelect
              v-model="itemForm.status"
              :items="statusItems"
              class="w-full"
            />
          </UFormField>

          <div class="flex items-center gap-2 justify-end">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              class="cursor-pointer"
              @click="itemModal.open = false"
            >
              {{ $t('انصراف') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="saving"
              class="cursor-pointer"
            >
              {{ $t('ذخیره') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  compactMegaMenuFilter,
  flattenMegaMenuSectionIds,
  moveIdInList,
  type MegaMenuFilterDefinition,
  type MegaMenuItemType,
  type MegaMenuStatus,
  type SellerMegaMenuItem,
  type SellerMegaMenuSection,
} from '~/data/mega-menu'
import {
  categoryParentOptions,
  SELLER_CATEGORY_ROOT_PARENT,
  toSellerCategory,
} from '~/data/seller-categories'

const props = defineProps<{
  menuId: string
}>()

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  tree,
  treePending,
  fetchTree,
  createSection,
  updateSection,
  updateMenu,
  formFromSummary,
  setSectionStatus,
  reorderSections,
  destroySection,
  createItem,
  updateItem,
  setItemStatus,
  reorderItems,
  destroyItem,
} = useSellerMegaMenus()
const { categories: sellerCategories, ensureLoaded: loadSellerCategories } = useSellerCategories()
const { list: storefrontCategories, fetchCategories } = useCategories()
const { attributes, ensureLoaded: loadAttributes } = useSellerAttributes()
const { brands, ensureLoaded: loadBrands } = useSellerBrands()

const openMenuMeta = ref(false)
const saving = ref(false)
const menuMeta = reactive({
  title: '',
  slug: '',
  icon: '',
  sortOrder: 0,
  status: 'active' as MegaMenuStatus,
})

const statusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
]
const typeItems = [
  { value: 'category', label: t('دسته‌بندی') },
  { value: 'filter', label: t('فیلتر') },
  { value: 'link', label: t('لینک') },
]

/** SelectItem cannot use empty string — maps to null on save. */
const NONE = '__none__'

function orNone(value: string | null | undefined) {
  return value && value !== NONE ? value : NONE
}

function fromNone(value: string | null | undefined) {
  const raw = String(value || '').trim()
  return !raw || raw === NONE ? null : raw
}

const sectionModal = reactive({
  open: false,
  editingId: '' as string | null,
  parentId: null as string | null,
})
const sectionForm = reactive({
  title: '',
  slug: '',
  parentId: NONE as string,
  categoryId: NONE as string,
  status: 'active' as MegaMenuStatus,
})

const itemModal = reactive({
  open: false,
  editingId: '' as string | null,
  sectionId: '',
})
const itemForm = reactive({
  title: '',
  slug: '',
  type: 'category' as MegaMenuItemType,
  categoryId: NONE,
  url: '',
  status: 'active' as MegaMenuStatus,
  filter: {
    category: NONE,
    brands: [] as string[],
    minPrice: 0,
    maxPrice: 0,
    q: '',
    attrs: {} as Record<string, string[]>,
  },
})

const categorySource = computed(() => {
  if (sellerCategories.value.length) {
    return sellerCategories.value.filter(c => c.status !== 'inactive')
  }
  return storefrontCategories.value.map(c =>
    toSellerCategory({
      id: c.id,
      name: c.name,
      icon: c.icon,
      image: c.image ?? null,
      text: c.text ?? null,
      parentId: null,
      status: 'active',
      sortOrder: 0,
      subs: c.subs ?? [],
    }),
  )
})

const categoryItems = computed(() => {
  const treeOptions = categoryParentOptions(categorySource.value)
    .filter(o => o.value !== SELLER_CATEGORY_ROOT_PARENT)
  return [
    { value: NONE, label: t('بدون دسته') },
    ...treeOptions,
  ]
})

const brandItems = computed(() =>
  brands.value.filter(b => b.status === 'active').map(b => b.name),
)

const sectionParentItems = computed(() => {
  const rows: Array<{ value: string, label: string }> = [{ value: NONE, label: t('بدون والد (ریشه)') }]
  function walk(list: SellerMegaMenuSection[], prefix: string) {
    for (const section of list) {
      if (section.id === sectionModal.editingId) continue
      rows.push({ value: section.id, label: `${prefix}${section.title}` })
      walk(section.sections, `${prefix}— `)
    }
  }
  walk(tree.value?.sections || [], '')
  return rows
})

const filterableAttributes = computed(() => {
  const categoryId = fromNone(itemForm.filter.category)
  return attributes.value.filter((attr) => {
    if (attr.status !== 'active' || !attr.filterable) return false
    if (!categoryId) return true
    return !attr.categoryIds.length || attr.categoryIds.includes(categoryId)
  })
})

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function slugifyLatin(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)
}

function validateSlug(slug: string): string | null {
  const next = slug.trim().toLowerCase()
  if (!next) return t('اسلاگ الزامی است — برای عنوان فارسی یک اسلاگ انگلیسی وارد کنید')
  if (!SLUG_RE.test(next)) return t('اسلاگ باید انگلیسی و با خط تیره باشد')
  return null
}

function sectionHasLinkedCategory(section: SellerMegaMenuSection): boolean {
  if (section.categoryId) return true
  if (section.items.some(i => i.type === 'category' && i.categoryId)) return true
  if (section.items.some(i => i.type === 'filter' && i.filter?.category)) return true
  return section.sections.some(sectionHasLinkedCategory)
}

const adminWarnings = computed(() => {
  const warnings: string[] = []
  if (!tree.value) return warnings
  if (!tree.value.sections.length) {
    warnings.push(t('هنوز بخشی ثبت نشده؛ کلیک روی ریشه منو در فروشگاه مقصدی ندارد.'))
    return warnings
  }
  const hasAnyCategory = tree.value.sections.some(sectionHasLinkedCategory)
  if (!hasAnyCategory) {
    warnings.push(t('هیچ بخش/آیتمی به دسته‌بندی محصول وصل نیست؛ فیلتر کاتالوگ از مسیر SEO خالی می‌ماند.'))
  }
  const categoryIds = new Set(categorySource.value.map(c => c.id))
  if (tree.value.slug && !categoryIds.has(tree.value.slug)) {
    warnings.push(t('اسلاگ منو با شناسه هیچ دسته‌بندی‌ای یکی نیست؛ لینک ریشه به اولین بخش می‌رود (نه صفحه دسته).'))
  }
  return warnings
})

onMounted(async () => {
  await Promise.all([
    fetchTree(props.menuId),
    loadSellerCategories({ force: true }),
    fetchCategories({ withCounts: false, force: true }),
    loadAttributes(),
    loadBrands(),
  ])
  if (tree.value) {
    Object.assign(menuMeta, formFromSummary(tree.value))
  }
})

watch(tree, (next) => {
  if (next) Object.assign(menuMeta, formFromSummary(next))
})

async function saveMenuMeta() {
  if (!menuMeta.title.trim()) {
    toast.error(t('عنوان الزامی است'))
    return
  }
  let slug = menuMeta.slug.trim().toLowerCase()
  if (!slug) {
    slug = slugifyLatin(menuMeta.title)
    menuMeta.slug = slug
  }
  const slugError = validateSlug(slug)
  if (slugError) {
    toast.error(slugError)
    return
  }
  menuMeta.slug = slug
  saving.value = true
  try {
    const result = await updateMenu(props.menuId, { ...menuMeta, slug })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    openMenuMeta.value = false
    toast.success(t('منو ذخیره شد'))
    const categoryIds = new Set(categorySource.value.map(c => c.id))
    if (!categoryIds.has(slug)) {
      toast.warning(t('اسلاگ منو با دسته محصول یکی نیست؛ در فروشگاه لینک ریشه به اولین بخش می‌رود.'))
    }
  }
  finally {
    saving.value = false
  }
}

function openSectionModal(section: SellerMegaMenuSection | null, parentId?: string | null) {
  sectionModal.editingId = section?.id || null
  sectionModal.parentId = section?.parentId ?? parentId ?? null
  sectionForm.title = section?.title || ''
  sectionForm.slug = section?.slug || ''
  sectionForm.parentId = orNone(section?.parentId ?? parentId)
  sectionForm.categoryId = orNone(section?.categoryId)
  sectionForm.status = section?.status || 'active'
  sectionModal.open = true
}

watch(
  () => sectionForm.title,
  (title) => {
    if (sectionModal.editingId || sectionForm.slug.trim()) return
    const next = slugifyLatin(title)
    if (next) sectionForm.slug = next
  },
)

watch(
  () => itemForm.title,
  (title) => {
    if (itemModal.editingId || itemForm.slug.trim()) return
    const next = slugifyLatin(title)
    if (next) itemForm.slug = next
  },
)

function openItemModal(payload: { sectionId: string, item?: SellerMegaMenuItem | null }) {
  itemModal.sectionId = payload.sectionId
  itemModal.editingId = payload.item?.id || null
  itemForm.title = payload.item?.title || ''
  itemForm.slug = payload.item?.slug || ''
  itemForm.type = payload.item?.type || 'category'
  itemForm.categoryId = orNone(payload.item?.categoryId)
  itemForm.url = payload.item?.url || ''
  itemForm.status = payload.item?.status || 'active'
  const filter = payload.item?.filter
  itemForm.filter = {
    category: orNone(filter?.category),
    brands: [...(filter?.brands || [])],
    minPrice: filter?.minPrice || 0,
    maxPrice: filter?.maxPrice || 0,
    q: filter?.q || '',
    attrs: { ...(filter?.attrs || {}) },
  }
  itemModal.open = true
}

function setAttrValues(slug: string, values: unknown) {
  const list = Array.isArray(values) ? values.map(v => String(v)) : []
  if (list.length) itemForm.filter.attrs[slug] = list
  else delete itemForm.filter.attrs[slug]
}

async function reload() {
  await fetchTree(props.menuId)
}

async function saveSection() {
  if (!sectionForm.title.trim()) {
    toast.error(t('عنوان الزامی است'))
    return
  }
  let slug = sectionForm.slug.trim().toLowerCase()
  if (!slug) {
    slug = slugifyLatin(sectionForm.title)
    sectionForm.slug = slug
  }
  const slugError = validateSlug(slug)
  if (slugError) {
    toast.error(slugError)
    return
  }
  saving.value = true
  try {
    const payload = {
      title: sectionForm.title,
      slug,
      parentId: fromNone(sectionForm.parentId),
      categoryId: fromNone(sectionForm.categoryId),
      status: sectionForm.status,
    }
    const result = sectionModal.editingId
      ? await updateSection(sectionModal.editingId, payload)
      : await createSection({ menuId: props.menuId, ...payload })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    sectionModal.open = false
    await reload()
    if (!payload.categoryId) {
      toast.warning(t('بخش بدون دسته‌بندی ذخیره شد؛ عنوان در فروشگاه فقط مسیر SEO دارد مگر آیتم دسته/فیلتر اضافه کنید.'))
    }
  }
  finally {
    saving.value = false
  }
}

async function saveItem() {
  if (!itemForm.title.trim()) {
    toast.error(t('عنوان الزامی است'))
    return
  }
  let slug = itemForm.slug.trim().toLowerCase()
  if (!slug) {
    slug = slugifyLatin(itemForm.title)
    itemForm.slug = slug
  }
  const slugError = validateSlug(slug)
  if (slugError) {
    toast.error(slugError)
    return
  }
  let filter: MegaMenuFilterDefinition | null = null
  if (itemForm.type === 'filter') {
    filter = compactMegaMenuFilter({
      category: fromNone(itemForm.filter.category) || undefined,
      brands: itemForm.filter.brands,
      minPrice: itemForm.filter.minPrice,
      maxPrice: itemForm.filter.maxPrice,
      q: itemForm.filter.q || undefined,
      attrs: itemForm.filter.attrs,
    })
    if (!filter) {
      toast.error(t('حداقل یک شرط فیلتر لازم است (دسته، برند، قیمت، ویژگی یا جستجو)'))
      return
    }
    const onlyCategory = Boolean(filter.category)
      && !filter.brands?.length
      && !filter.minPrice
      && !filter.maxPrice
      && !filter.q
      && !Object.keys(filter.attrs || {}).length
    if (onlyCategory) {
      toast.warning(t('این فیلتر فقط دسته دارد؛ برای تمایز از آیتم «دسته‌بندی» برند/قیمت/ویژگی هم بگذارید.'))
    }
  }
  if (itemForm.type === 'category' && !fromNone(itemForm.categoryId)) {
    toast.error(t('دسته‌بندی را انتخاب کنید'))
    return
  }
  if (itemForm.type === 'link' && !itemForm.url.trim()) {
    toast.error(t('آدرس لینک الزامی است'))
    return
  }
  saving.value = true
  try {
    const payload = {
      title: itemForm.title,
      slug,
      type: itemForm.type,
      categoryId: fromNone(itemForm.categoryId),
      filter,
      url: itemForm.url.trim() || null,
      status: itemForm.status,
    }
    const result = itemModal.editingId
      ? await updateItem(itemModal.editingId, payload)
      : await createItem({ sectionId: itemModal.sectionId, ...payload })
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    itemModal.open = false
    await reload()
  }
  finally {
    saving.value = false
  }
}

function findSection(list: SellerMegaMenuSection[], id: string): SellerMegaMenuSection | null {
  for (const section of list) {
    if (section.id === id) return section
    const nested = findSection(section.sections, id)
    if (nested) return nested
  }
  return null
}

function siblingsOf(sectionId: string): SellerMegaMenuSection[] {
  const roots = tree.value?.sections || []
  if (roots.some(s => s.id === sectionId)) return roots
  function walk(list: SellerMegaMenuSection[]): SellerMegaMenuSection[] | null {
    for (const section of list) {
      if (section.sections.some(s => s.id === sectionId)) return section.sections
      const nested = walk(section.sections)
      if (nested) return nested
    }
    return null
  }
  return walk(roots) || roots
}

async function onMoveSection(sectionId: string, dir: -1 | 1) {
  const siblings = siblingsOf(sectionId).map(s => s.id)
  const nextSiblings = moveIdInList(siblings, sectionId, dir)
  if (!nextSiblings || !tree.value) return
  const all = flattenMegaMenuSectionIds(applySiblingOrder(tree.value.sections, sectionId, nextSiblings))
  const result = await reorderSections(all)
  if (!result.ok) toast.error(t(result.error))
  else await reload()
}

function applySiblingOrder(
  list: SellerMegaMenuSection[],
  movedId: string,
  orderedSiblingIds: string[],
): SellerMegaMenuSection[] {
  if (list.some(s => s.id === movedId)) {
    const byId = new Map(list.map(s => [s.id, s]))
    return orderedSiblingIds.map(id => byId.get(id)).filter((s): s is SellerMegaMenuSection => Boolean(s))
  }
  return list.map(section => ({
    ...section,
    sections: applySiblingOrder(section.sections, movedId, orderedSiblingIds),
  }))
}

async function onMoveItem(payload: { sectionId: string, itemId: string, dir: -1 | 1 }) {
  const section = findSection(tree.value?.sections || [], payload.sectionId)
  if (!section) return
  const next = moveIdInList(section.items.map(i => i.id), payload.itemId, payload.dir)
  if (!next) return
  const result = await reorderItems(next)
  if (!result.ok) toast.error(t(result.error))
  else await reload()
}

async function onToggleSection(section: SellerMegaMenuSection) {
  const result = await setSectionStatus(section.id, section.status === 'active' ? 'inactive' : 'active')
  if (!result.ok) toast.error(t(result.error))
  else await reload()
}

async function onToggleItem(item: SellerMegaMenuItem) {
  const result = await setItemStatus(item.id, item.status === 'active' ? 'inactive' : 'active')
  if (!result.ok) toast.error(t(result.error))
  else await reload()
}

async function onDeleteSection(id: string) {
  if (!import.meta.client) return
  if (!window.confirm(t('این بخش و زیربخش‌ها و آیتم‌هایش حذف می‌شود. ادامه می‌دهید؟'))) return
  const result = await destroySection(id)
  if (!result.ok) toast.error(t(result.error))
  else await reload()
}

async function onDeleteItem(id: string) {
  if (!import.meta.client) return
  if (!window.confirm(t('این آیتم حذف شود؟'))) return
  const result = await destroyItem(id)
  if (!result.ok) toast.error(t(result.error))
  else await reload()
}
</script>
