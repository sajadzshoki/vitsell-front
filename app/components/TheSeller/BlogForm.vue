<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/blog"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به وبلاگ') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ isEdit ? $t('ویرایش مطلب') : $t('افزودن مطلب') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('عنوان، تصویر، دسته، محتوا، سئو و تنظیمات انتشار را تکمیل کنید.') }}
          </p>
        </div>
        <UBadge
          :color="statusMeta.color"
          variant="subtle"
          size="md"
          class="font-medium"
        >
          {{ $t(statusMeta.label) }}
        </UBadge>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.id"
          :label="$t('شناسه (انگلیسی)')"
          :placeholder="$t('مثلاً buy-guide-phone')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.id"
          required
          icon="i-tabler-id"
          :help="isEdit ? $t('شناسه بعد از ایجاد قابل تغییر نیست') : $t('فقط حروف کوچک انگلیسی، عدد و خط تیره')"
        />

        <TheFormInput
          v-model="form.title"
          :label="$t('عنوان')"
          :placeholder="$t('عنوان مطلب')"
          :error="errors.title"
          required
          icon="i-tabler-heading"
        />

        <TheFormInput
          v-model="form.author"
          :label="$t('نویسنده')"
          required
          :error="errors.author"
          icon="i-tabler-user"
        />

        <TheFormInput
          v-model="form.date"
          :label="$t('تاریخ نمایش')"
          :placeholder="$t('مثلاً ۱۵ مرداد ۱۴۰۵')"
          required
          :error="errors.date"
          icon="i-tabler-calendar"
        />

        <UFormField
          :label="$t('دسته مطلب')"
          required
          :error="errors.category"
        >
          <USelectMenu
            v-model="form.category"
            :items="categoryOptions"
            value-key="value"
            create-item
            :placeholder="$t('انتخاب یا نوشتن دسته')"
            class="w-full"
            @create="onCreateCategory"
          />
        </UFormField>

        <TheFormInput
          v-model="form.readTime"
          :label="$t('زمان مطالعه')"
          :placeholder="$t('مثلاً ۸ دقیقه')"
          required
          :error="errors.readTime"
          icon="i-tabler-clock"
        />

        <UFormField
          :label="$t('وضعیت انتشار')"
          required
        >
          <USelect
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-if="form.status === 'scheduled'"
          v-model="form.scheduledAt"
          type="datetime-local"
          :label="$t('زمان‌بندی انتشار')"
          dir="ltr"
          :error="errors.scheduledAt"
          icon="i-tabler-calendar-time"
          required
        />

        <TheFormInput
          v-model="form.engagement"
          :label="$t('تعداد تعامل')"
          placeholder="0"
          dir="ltr"
          digits-only
          icon="i-tabler-flame"
          :help="$t('عدد نمایشی برای شمارش تعامل در لیست بلاگ')"
        />

        <div class="flex flex-col gap-3 justify-end pb-1">
          <UCheckbox
            v-model="form.featured"
            :label="$t('مطلب ویژه')"
          />
          <UCheckbox
            v-model="form.popular"
            :label="$t('مورد علاقه کاربران')"
          />
        </div>

        <div class="md:col-span-2">
          <TheSellerImageUpload
            v-model="form.image"
            :label="$t('تصویر کاور')"
            icon="i-tabler-photo"
            :alt="form.imageAlt || form.title || $t('کاور مطلب')"
            :error="errors.image"
            :hint="$t('تصویر را از دستگاه انتخاب یا رها کنید؛ آپلود می‌شود')"
            @error="form.image = ''"
          />
        </div>

        <TheFormInput
          v-model="form.imageAlt"
          class="md:col-span-2"
          :label="$t('متن جایگزین تصویر')"
          :placeholder="$t('توضیح تصویر برای دسترس‌پذیری و سئو')"
          icon="i-tabler-text-caption"
        />

        <UFormField
          class="md:col-span-2"
          :label="$t('برچسب‌ها')"
          :help="$t('برچسب موجود را انتخاب کنید یا نام جدید بنویسید')"
        >
          <USelectMenu
            v-model="form.tags"
            multiple
            create-item
            :items="tagOptions"
            value-key="value"
            :placeholder="$t('انتخاب برچسب')"
            class="w-full"
            @create="onCreateTag"
          />
        </UFormField>

        <UFormField
          class="md:col-span-2"
          :label="$t('مطالب مرتبط')"
        >
          <USelectMenu
            v-model="form.relatedPostIds"
            multiple
            :items="relatedPostOptions"
            value-key="value"
            :placeholder="$t('انتخاب مطالب مرتبط')"
            class="w-full"
          />
        </UFormField>

        <UFormField
          class="md:col-span-2"
          :label="$t('خلاصه')"
          required
          :error="errors.excerpt"
        >
          <UTextarea
            v-model="form.excerpt"
            :rows="3"
            :placeholder="$t('خلاصه کوتاه برای کارت و SEO')"
            class="w-full"
          />
        </UFormField>

        <UFormField
          class="md:col-span-2"
          :label="$t('متن مطلب')"
          required
          :error="errors.contentText"
          :help="$t('هر پاراگراف را با یک خط خالی از هم جدا کنید')"
        >
          <UTextarea
            v-model="form.contentText"
            :rows="12"
            :placeholder="$t('متن کامل مطلب...')"
            class="w-full"
          />
        </UFormField>

        <UFormField
          class="md:col-span-2"
          :label="$t('دسته‌های محصول مرتبط')"
          :help="$t('اختیاری — برای لینک به فروشگاه و پیشنهاد مطالب')"
        >
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="opt in productCategoryOptions"
              :key="opt.value"
              type="button"
              size="sm"
              :color="form.relatedCategories.includes(opt.value) ? 'primary' : 'neutral'"
              :variant="form.relatedCategories.includes(opt.value) ? 'soft' : 'outline'"
              class="cursor-pointer"
              @click="toggleRelatedCategory(opt.value)"
            >
              {{ opt.label }}
            </UButton>
          </div>
        </UFormField>
      </div>

      <div class="mt-6">
        <div class="flex items-center justify-between gap-3 mb-3">
          <h3 class="text-sm font-bold text-highlighted">
            {{ $t('نکات کلیدی') }}
          </h3>
          <UButton
            type="button"
            color="primary"
            variant="soft"
            size="xs"
            icon="i-tabler-plus"
            class="cursor-pointer"
            @click="addHighlight"
          >
            {{ $t('افزودن نکته') }}
          </UButton>
        </div>
        <div class="space-y-2">
          <div
            v-for="(_, index) in form.highlights"
            :key="index"
            class="flex items-start gap-2"
          >
            <TheFormInput
              v-model="form.highlights[index]"
              class="flex-1"
              :placeholder="$t('نکته کلیدی')"
              icon="i-tabler-list-check"
            />
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-tabler-trash"
              class="cursor-pointer shrink-0 mt-7"
              :disabled="form.highlights.length <= 1"
              @click="removeHighlight(index)"
            />
          </div>
        </div>
      </div>

      <div
        v-if="isEdit && (initial?.createdAt || initial?.updatedAt)"
        class="mt-4 flex flex-wrap gap-4 text-[11px] text-muted"
      >
        <span
          v-if="initial?.createdAt"
          class="num"
          dir="ltr"
        >
          {{ $t('ایجاد') }}: {{ initial.createdAt }}
        </span>
        <span
          v-if="initial?.updatedAt"
          class="num"
          dir="ltr"
        >
          {{ $t('به‌روزرسانی') }}: {{ initial.updatedAt }}
        </span>
      </div>
    </div>

    <TheSellerSeoFields
      v-model="form.seo"
      :preview-title="form.title"
      :preview-description="form.excerpt"
      :preview-url="form.id ? `/blog/${form.id}` : ''"
    />

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        v-if="canSave"
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت مطلب') }}
      </UButton>
      <UButton
        v-if="isEdit && form.id"
        type="button"
        color="neutral"
        variant="soft"
        size="lg"
        icon="i-tabler-eye"
        class="cursor-pointer"
        :to="`/blog/${form.id}?preview=1`"
        target="_blank"
      >
        {{ $t('پیش‌نمایش') }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        size="lg"
        class="cursor-pointer"
        to="/seller/blog"
      >
        {{ $t('انصراف') }}
      </UButton>
      <span
        v-if="draftHint"
        class="text-[11px] text-muted"
      >
        {{ draftHint }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  blogCategoryChips,
  blogPostIdPattern,
  emptyBlogForm,
  sellerBlogStatusMeta,
  toBlogForm,
  type SellerBlogFormValues,
  type SellerBlogPost,
  type SellerBlogStatus,
} from '~/data/seller-blog'

const props = defineProps<{
  initial?: SellerBlogPost | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { can } = useSellerPermissions()
const { createPost, updatePost, ensureSeeded, posts } = useBlog()
const { categories, fetchCategories } = useCategories()
const blogCategories = useSellerBlogCategories()
const blogTags = useSellerBlogTags()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref(props.initial ? toBlogForm(props.initial) : emptyBlogForm())
const errors = ref<Partial<Record<'id' | 'title' | 'excerpt' | 'image' | 'category' | 'author' | 'date' | 'readTime' | 'contentText' | 'scheduledAt', string>>>({})
const savedSnapshot = ref(JSON.stringify(form.value))
const draftHint = ref('')
const allowLeave = ref(false)

const draftKey = `seller-blog-draft-${props.initial?.id || 'new'}`
const draftStore = useState<SellerBlogFormValues | null>(draftKey, () => null)

const canSave = computed(() =>
  isEdit.value ? can('blog.update') : can('blog.create'),
)

const statusMeta = computed(() => sellerBlogStatusMeta[form.value.status])

const statusItems = computed(() =>
  (Object.keys(sellerBlogStatusMeta) as SellerBlogStatus[]).map(value => ({
    value,
    label: t(sellerBlogStatusMeta[value].label),
  })),
)

const categoryOptions = computed(() => {
  blogCategories.ensureLoaded()
  const fromTaxonomy = blogCategories.activeCategories.value.map(c => c.name)
  const fromPosts = posts.value.map(p => p.category).filter(Boolean)
  const merged = new Set([
    ...blogCategoryChips.map(c => c.id),
    ...fromTaxonomy,
    ...fromPosts,
    form.value.category,
  ].filter(Boolean))
  return [...merged].map(value => ({ label: value, value }))
})

const tagOptions = computed(() => {
  blogTags.ensureLoaded()
  const names = new Set([
    ...blogTags.tags.value.map(t => t.name),
    ...form.value.tags,
  ])
  return [...names].map(value => ({ label: value, value }))
})

const relatedPostOptions = computed(() =>
  posts.value
    .filter(p => p.id !== form.value.id)
    .map(p => ({ label: p.title, value: p.id })),
)

const productCategoryOptions = computed(() =>
  categories.value.map(c => ({
    label: c.name,
    value: c.id,
  })),
)

const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value)

watch(
  () => props.initial,
  (value) => {
    const base = value ? toBlogForm(value) : emptyBlogForm()
    const draft = draftStore.value
    if (draft && draft.id === base.id) {
      form.value = draft
      draftHint.value = t('پیش‌نویس خودکار بازیابی شد')
    }
    else {
      form.value = base
      draftHint.value = ''
    }
    savedSnapshot.value = JSON.stringify(value ? toBlogForm(value) : emptyBlogForm())
    errors.value = {}
  },
)

watch(
  form,
  (value) => {
    draftStore.value = JSON.parse(JSON.stringify(value)) as SellerBlogFormValues
    draftHint.value = t('ذخیره موقت شد')
  },
  { deep: true },
)

onBeforeRouteLeave(() => {
  if (allowLeave.value || !isDirty.value) return true
  // eslint-disable-next-line no-alert
  return window.confirm(t('تغییرات ذخیره نشده دارید. خارج می‌شوید؟'))
})

ensureSeeded()
blogCategories.ensureLoaded()
blogTags.ensureLoaded()
await fetchCategories({ withCounts: false })

if (!props.initial && draftStore.value && !draftStore.value.id) {
  form.value = draftStore.value
  draftHint.value = t('پیش‌نویس خودکار بازیابی شد')
}

function onCreateCategory(item: string) {
  const value = item.trim()
  if (!value) return
  form.value.category = value
}

function onCreateTag(item: string) {
  const tag = blogTags.ensureTagByName(item)
  if (!tag) return
  if (!form.value.tags.includes(tag.name)) {
    form.value.tags = [...form.value.tags, tag.name]
  }
}

function toggleRelatedCategory(id: string) {
  const list = form.value.relatedCategories
  const index = list.indexOf(id)
  if (index === -1) list.push(id)
  else list.splice(index, 1)
}

function addHighlight() {
  form.value.highlights.push('')
}

function removeHighlight(index: number) {
  if (form.value.highlights.length <= 1) return
  form.value.highlights.splice(index, 1)
}

function validate() {
  const next: typeof errors.value = {}
  const id = form.value.id.trim()

  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!blogPostIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  if (!form.value.title.trim()) next.title = t('عنوان الزامی است')
  if (!form.value.excerpt.trim()) next.excerpt = t('خلاصه الزامی است')
  if (!form.value.image.trim()) next.image = t('تصویر الزامی است')
  if (!form.value.category.trim()) next.category = t('دسته الزامی است')
  if (!form.value.author.trim()) next.author = t('نویسنده الزامی است')
  if (!form.value.date.trim()) next.date = t('تاریخ الزامی است')
  if (!form.value.readTime.trim()) next.readTime = t('زمان مطالعه الزامی است')
  if (!form.value.contentText.trim()) next.contentText = t('متن مطلب الزامی است')
  if (form.value.status === 'scheduled' && !form.value.scheduledAt.trim()) {
    next.scheduledAt = t('زمان‌بندی الزامی است')
  }

  errors.value = next
  return !Object.keys(next).length
}

async function onSave() {
  if (!canSave.value) {
    toast.error(t('دسترسی ندارید'))
    return
  }
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }

  for (const name of form.value.tags) {
    blogTags.ensureTagByName(name)
  }

  saving.value = true
  try {
    const result = isEdit.value
      ? updatePost(props.initial!.id, form.value)
      : createPost(form.value)

    if (!result.ok) {
      toast.error(t(result.error))
      if (result.error.includes('تکراری')) {
        errors.value = { ...errors.value, id: t(result.error) }
      }
      return
    }

    draftStore.value = null
    savedSnapshot.value = JSON.stringify(form.value)
    allowLeave.value = true
    toast.success(isEdit.value ? t('مطلب به‌روز شد') : t('مطلب اضافه شد'))
    await router.push('/seller/blog')
  }
  finally {
    saving.value = false
  }
}
</script>
