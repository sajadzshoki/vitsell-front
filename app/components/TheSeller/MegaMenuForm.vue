<template>
  <div class="bg-default border border-muted rounded-2xl p-5 md:p-6 max-lg:(bg-transparent border-0 rounded-none p-0)">
    <TheSellerPageHeader
      :title="isEdit ? $t('ویرایش مگا منو') : $t('افزودن مگا منو')"
      :description="$t('منوی ریشه ناوبری فروشگاه')"
    />

    <form
      class="space-y-4 max-w-xl"
      @submit.prevent="submit"
    >
      <UFormField
        :label="$t('عنوان')"
        required
      >
        <UInput
          v-model="form.title"
          :placeholder="$t('مثلاً گوشی موبایل و تجهیزات')"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="$t('اسلاگ')"
        :hint="$t('انگلیسی با خط تیره — برای عنوان فارسی حتماً پر کنید (مثلاً mobile-accessories)')"
        required
      >
        <UInput
          v-model="form.slug"
          dir="ltr"
          placeholder="mobile-gear"
          class="w-full"
          @update:model-value="slugTouched = true"
        />
      </UFormField>

      <UFormField :label="$t('آیکون')">
        <TheSellerIconPicker v-model="form.icon" />
      </UFormField>

      <UFormField :label="$t('ترتیب')">
        <UInput
          v-model.number="form.sortOrder"
          type="number"
          min="0"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="$t('وضعیت')">
        <USelect
          v-model="form.status"
          :items="statusItems"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <TheSellerFormActions>
        <UButton
          type="submit"
          color="primary"
          :loading="saving"
          class="cursor-pointer"
        >
          {{ isEdit ? $t('ذخیره') : $t('ایجاد منو') }}
        </UButton>
        <UButton
          to="/seller/mega-menus"
          color="neutral"
          variant="soft"
          class="cursor-pointer"
        >
          {{ $t('انصراف') }}
        </UButton>
      </TheSellerFormActions>
    </form>
  </div>
</template>

<script setup lang="ts">
import { emptyMegaMenuForm } from '~/data/mega-menu'

const props = defineProps<{
  menuId?: string
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { tree, fetchTree, createMenu, updateMenu, formFromSummary } = useSellerMegaMenus()

const form = ref(emptyMegaMenuForm())
const saving = ref(false)
const slugTouched = ref(false)
const isEdit = computed(() => Boolean(props.menuId))

const statusItems = [
  { value: 'active', label: t('فعال') },
  { value: 'inactive', label: t('غیرفعال') },
]

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

watch(
  () => form.value.title,
  (title) => {
    if (isEdit.value || slugTouched.value) return
    const next = slugifyLatin(title)
    if (next) form.value.slug = next
  },
)

onMounted(async () => {
  if (!props.menuId) return
  const result = await fetchTree(props.menuId)
  if (!result.ok || !tree.value) {
    toast.error(t(result.error || 'منوی مگا یافت نشد'))
    return
  }
  form.value = formFromSummary(tree.value)
  slugTouched.value = true
})

function asString(value: unknown) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value && 'value' in value) {
    return String((value as { value?: unknown }).value ?? '')
  }
  return String(value)
}

async function submit() {
  const title = asString(form.value.title).trim()
  let slug = asString(form.value.slug).trim().toLowerCase()
  if (!title) {
    toast.error(t('عنوان الزامی است'))
    return
  }
  if (!slug) {
    slug = slugifyLatin(title) || `menu-${Date.now().toString(36)}`
    form.value.slug = slug
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    toast.error(t('اسلاگ باید انگلیسی و با خط تیره باشد'))
    return
  }

  saving.value = true
  try {
    const payload = {
      ...form.value,
      title,
      slug,
      icon: asString(form.value.icon).trim(),
      status: asString(form.value.status) === 'inactive' ? 'inactive' as const : 'active' as const,
      sortOrder: Math.max(0, Math.round(Number(form.value.sortOrder) || 0)),
    }
    if (isEdit.value && props.menuId) {
      const result = await updateMenu(props.menuId, payload)
      if (!result.ok) {
        toast.error(t(result.error))
        return
      }
      toast.success(t('منو ذخیره شد'))
      await router.push(`/seller/mega-menus/${encodeURIComponent(props.menuId)}`)
      return
    }
    const result = await createMenu(payload)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    toast.success(t('منو ایجاد شد'))
    toast.warning(t('در مرحله بعد حداقل یک بخش با دسته‌بندی یا آیتم فیلتر بسازید تا لینک ریشه در فروشگاه کار کند.'))
    await router.push(`/seller/mega-menus/${encodeURIComponent(result.menu.id)}`)
  }
  catch (error) {
    toast.error(t(error instanceof Error ? error.message : 'ثبت منو ناموفق بود'))
  }
  finally {
    saving.value = false
  }
}
</script>
