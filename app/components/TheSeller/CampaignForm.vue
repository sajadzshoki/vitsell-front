<template>
  <div class="space-y-5">
    <div class="md:hidden">
      <UButton
        to="/seller/campaigns"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-tabler-chevron-right"
        class="cursor-pointer"
      >
        {{ $t('بازگشت به کمپین‌ها') }}
      </UButton>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="font-bold text-highlighted">
            {{ isEdit ? $t('ویرایش کمپین') : $t('افزودن کمپین') }}
          </h2>
          <p class="text-xs text-muted mt-1 leading-6">
            {{ $t('اطلاعات پایه، تصویر، لینک‌های وابسته و هدف‌گیری را تنظیم کنید.') }}
          </p>
        </div>
        <UBadge
          :color="previewLifecycle.color"
          variant="subtle"
          size="md"
          class="font-medium"
        >
          {{ $t(previewLifecycle.label) }}
        </UBadge>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheFormInput
          v-model="form.id"
          :label="$t('شناسه (انگلیسی)')"
          :placeholder="$t('مثلاً norouz-sale')"
          dir="ltr"
          :disabled="isEdit"
          :error="errors.id"
          required
          icon="i-tabler-id"
          :help="isEdit ? $t('شناسه بعد از ایجاد قابل تغییر نیست') : $t('فقط حروف کوچک انگلیسی، عدد و خط تیره')"
        />

        <TheFormInput
          v-model="form.name"
          :label="$t('نام')"
          required
          :error="errors.name"
          icon="i-tabler-speakerphone"
        />

        <TheFormInput
          v-model="form.slug"
          :label="$t('اسلاگ')"
          dir="ltr"
          icon="i-tabler-link"
          :help="$t('خالی = همان شناسه')"
        />

        <UFormField :label="$t('وضعیت دستی')">
          <USelect
            v-model="form.manualStatus"
            :items="manualStatusItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <TheFormInput
          v-model="form.startsAt"
          type="datetime-local"
          :label="$t('شروع')"
          dir="ltr"
          :error="errors.startsAt"
          required
          icon="i-tabler-calendar-event"
        />

        <TheFormInput
          v-model="form.endsAt"
          type="datetime-local"
          :label="$t('پایان')"
          dir="ltr"
          :error="errors.endsAt"
          required
          icon="i-tabler-calendar-due"
        />

        <TheFormInput
          v-model.number="form.priority"
          type="number"
          :label="$t('اولویت')"
          dir="ltr"
          icon="i-tabler-arrows-sort"
          :help="$t('عدد کوچکتر = اولویت بالاتر')"
        />

        <TheFormInput
          v-model="form.landingUrl"
          :label="$t('لینک فرود')"
          dir="ltr"
          icon="i-tabler-external-link"
          :placeholder="$t('مثلاً /search')"
        />
      </div>

      <UFormField
        class="mt-4"
        :label="$t('توضیحات')"
      >
        <UTextarea
          v-model="form.description"
          :rows="3"
          autoresize
          class="w-full"
          :placeholder="$t('توضیح کوتاه درباره کمپین')"
        />
      </UFormField>

      <div class="mt-5 max-w-md">
        <TheSellerImageUpload
          v-model="form.image"
          :label="$t('تصویر کمپین')"
          :alt="form.name || $t('تصویر کمپین')"
        />
      </div>
    </div>

    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0 space-y-5">
      <div>
        <h3 class="font-bold text-highlighted">
          {{ $t('آیتم‌های وابسته') }}
        </h3>
        <p class="text-xs text-muted mt-1 leading-6">
          {{ $t('تخفیف‌ها، کوپن‌ها، شگفت‌انگیزها و بنرهای مرتبط با این کمپین را انتخاب کنید.') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="space-y-2">
          <div class="text-xs font-medium text-toned">
            {{ $t('تخفیف‌ها') }}
          </div>
          <div class="max-h-44 overflow-y-auto rounded-xl border border-muted p-3 space-y-2">
            <p
              v-if="!discountOptions.length"
              class="text-[11px] text-muted"
            >
              {{ $t('تخفیفی ثبت نشده است') }}
            </p>
            <UCheckbox
              v-for="item in discountOptions"
              :key="item.id"
              :model-value="form.discountIds.includes(item.id)"
              :label="item.label"
              @update:model-value="toggleId('discountIds', item.id, !!$event)"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-toned">
            {{ $t('کدهای تخفیف (کوپن)') }}
          </div>
          <div class="max-h-44 overflow-y-auto rounded-xl border border-muted p-3 space-y-2">
            <p
              v-if="!couponOptions.length"
              class="text-[11px] text-muted"
            >
              {{ $t('کوپنی ثبت نشده است') }}
            </p>
            <UCheckbox
              v-for="item in couponOptions"
              :key="item.id"
              :model-value="form.couponCodes.includes(item.id)"
              :label="item.label"
              @update:model-value="toggleId('couponCodes', item.id, !!$event)"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-toned">
            {{ $t('شگفت‌انگیزها') }}
          </div>
          <div class="max-h-44 overflow-y-auto rounded-xl border border-muted p-3 space-y-2">
            <p
              v-if="!dealOptions.length"
              class="text-[11px] text-muted"
            >
              {{ $t('شگفت‌انگیزی ثبت نشده است') }}
            </p>
            <UCheckbox
              v-for="item in dealOptions"
              :key="item.id"
              :model-value="form.dealIds.includes(item.id)"
              :label="item.label"
              @update:model-value="toggleId('dealIds', item.id, !!$event)"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-toned">
            {{ $t('بنرها') }}
          </div>
          <div class="max-h-44 overflow-y-auto rounded-xl border border-muted p-3 space-y-2">
            <p
              v-if="!bannerOptions.length"
              class="text-[11px] text-muted"
            >
              {{ $t('بنری ثبت نشده است') }}
            </p>
            <UCheckbox
              v-for="item in bannerOptions"
              :key="item.id"
              :model-value="form.bannerIds.includes(item.id)"
              :label="item.label"
              @update:model-value="toggleId('bannerIds', item.id, !!$event)"
            />
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-muted">
        <TheSellerMarketingTargetingFields v-model="form.targeting" />
      </div>
    </div>

    <TheSellerSeoFields
      v-model="form.seo"
      :preview-title="form.name"
      :preview-description="form.description"
      :preview-url="form.landingUrl || (form.slug ? `/campaign/${form.slug}` : '')"
    />

    <div class="flex items-center gap-3 flex-wrap pb-2">
      <UButton
        type="button"
        color="primary"
        size="lg"
        class="font-bold cursor-pointer"
        :loading="saving"
        @click="onSave"
      >
        {{ isEdit ? $t('ذخیره تغییرات') : $t('ثبت کمپین') }}
      </UButton>
      <UButton
        to="/seller/campaigns"
        color="neutral"
        variant="outline"
        size="lg"
        class="cursor-pointer"
      >
        {{ $t('انصراف') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  campaignIdPattern,
  campaignLifecycle,
  emptyCampaignForm,
  formToCampaign,
  toCampaignForm,
  type SellerCampaign,
  type SellerCampaignFormValues,
} from '~/data/seller-campaigns'
import { sellerScheduleStatusMeta } from '~/data/seller-marketing-shared'

const props = defineProps<{
  initial?: SellerCampaign | null
}>()

const { t } = useI18n()
const toast = useAppToast()
const router = useRouter()
const { createCampaign, updateCampaign } = useSellerCampaigns()
const { discounts, ensureLoaded: ensureDiscounts } = useSellerDiscounts()
const { codes, ensureLoaded: ensurePromos } = useSellerPromotions()
const { deals, ensureLoaded: ensureDeals } = useSellerDeals()
const { banners, ensureLoaded: ensureBanners } = useSellerBanners()

ensureDiscounts()
ensureBanners()
void ensurePromos()
void ensureDeals()

const isEdit = computed(() => Boolean(props.initial?.id))
const saving = ref(false)
const form = ref<SellerCampaignFormValues>(
  props.initial ? toCampaignForm(props.initial) : emptyCampaignForm(),
)
const errors = ref<Partial<Record<'id' | 'name' | 'startsAt' | 'endsAt', string>>>({})
const savedSnapshot = ref(JSON.stringify(form.value))
const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value)
const { allowNextNavigation } = useSellerUnsavedGuard(isDirty)

const manualStatusItems = computed(() => [
  { value: 'draft', label: t('پیش‌نویس') },
  { value: 'active', label: t('فعال') },
  { value: 'paused', label: t('متوقف') },
  { value: 'archived', label: t('بایگانی') },
])

const previewLifecycle = computed(() => {
  const draft = formToCampaign(form.value, props.initial ?? undefined)
  return sellerScheduleStatusMeta[campaignLifecycle(draft)]
})

const discountOptions = computed(() =>
  discounts.value.map(d => ({ id: d.id, label: `${d.name} (${d.id})` })),
)

const couponOptions = computed(() =>
  codes.value.map(c => ({
    id: c.code,
    label: c.name ? `${c.code} — ${c.name}` : c.code,
  })),
)

const dealOptions = computed(() =>
  deals.value.map(d => ({
    id: d.id,
    label: `${d.id} · ${d.discountPercent}٪`,
  })),
)

const bannerOptions = computed(() =>
  banners.value.map(b => ({
    id: b.id,
    label: `${b.id} · ${b.placement || b.type}`,
  })),
)

watch(
  () => props.initial,
  (value) => {
    form.value = value ? toCampaignForm(value) : emptyCampaignForm()
    savedSnapshot.value = JSON.stringify(form.value)
    errors.value = {}
  },
)

function toggleId(
  key: 'discountIds' | 'couponCodes' | 'dealIds' | 'bannerIds',
  id: string,
  on: boolean,
) {
  const current = [...form.value[key]]
  form.value[key] = on
    ? [...new Set([...current, id])]
    : current.filter(x => x !== id)
}

function validate() {
  const next: typeof errors.value = {}
  const id = form.value.id.trim()
  if (!form.value.name.trim()) next.name = t('نام الزامی است')
  if (!isEdit.value) {
    if (!id) next.id = t('شناسه الزامی است')
    else if (!campaignIdPattern.test(id)) next.id = t('شناسه فقط حروف کوچک، عدد و خط تیره')
  }
  if (!form.value.startsAt) next.startsAt = t('شروع الزامی است')
  if (!form.value.endsAt) next.endsAt = t('پایان الزامی است')
  if (form.value.startsAt && form.value.endsAt && form.value.endsAt <= form.value.startsAt) {
    next.endsAt = t('پایان باید بعد از شروع باشد')
  }
  errors.value = next
  return !Object.keys(next).length
}

async function onSave() {
  if (!validate()) {
    toast.warning(t('لطفاً فیلدهای الزامی را تکمیل کنید'))
    return
  }

  saving.value = true
  try {
    const result = isEdit.value
      ? updateCampaign(props.initial!.id, form.value)
      : createCampaign(form.value)

    if (!result.ok) {
      toast.error(t(result.error))
      if (result.error.includes('تکراری') || result.error.includes('شناسه')) {
        errors.value = { ...errors.value, id: t(result.error) }
      }
      return
    }

    toast.success(isEdit.value ? t('کمپین به‌روز شد') : t('کمپین اضافه شد'))
    allowNextNavigation()
    savedSnapshot.value = JSON.stringify(form.value)
    await router.push('/seller/campaigns')
  }
  finally {
    saving.value = false
  }
}
</script>
