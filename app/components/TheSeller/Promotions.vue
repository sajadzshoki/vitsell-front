<template>
  <div class="space-y-5">
    <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
      <div class="hidden lg:flex items-center justify-between mb-5 gap-3">
        <h2 class="font-bold text-highlighted">
          {{ $t('تخفیف و پروموشن') }}
        </h2>
        <UButton
          :to="activeTab === 'codes' ? '/seller/promotions/codes/new' : '/seller/promotions/promos/new'"
          color="primary"
          size="sm"
          icon="i-tabler-plus"
          class="font-medium"
        >
          {{ activeTab === 'codes' ? $t('افزودن کد تخفیف') : $t('افزودن پرومو') }}
        </UButton>
      </div>

      <div class="lg:hidden mb-4">
        <UButton
          :to="activeTab === 'codes' ? '/seller/promotions/codes/new' : '/seller/promotions/promos/new'"
          color="primary"
          block
          icon="i-tabler-plus"
          class="font-medium"
        >
          {{ activeTab === 'codes' ? $t('افزودن کد تخفیف') : $t('افزودن پرومو') }}
        </UButton>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
        <UButton
          :color="activeTab === 'codes' ? 'primary' : 'neutral'"
          :variant="activeTab === 'codes' ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="setTab('codes')"
        >
          {{ $t('کدهای تخفیف') }}
          <span class="num ms-1">{{ codes.length.toLocaleString('fa-IR') }}</span>
        </UButton>
        <UButton
          :color="activeTab === 'promos' ? 'primary' : 'neutral'"
          :variant="activeTab === 'promos' ? 'soft' : 'ghost'"
          size="sm"
          class="shrink-0"
          @click="setTab('promos')"
        >
          {{ $t('پروموها') }}
          <span class="num ms-1">{{ promos.length.toLocaleString('fa-IR') }}</span>
        </UButton>
      </div>

      <TheFormInput
        v-model="query"
        icon="i-tabler-search"
        :placeholder="activeTab === 'codes' ? $t('جستجوی کد') : $t('جستجوی پرومو')"
        class="mb-4"
      />

      <!-- Codes -->
      <div
        v-if="activeTab === 'codes'"
        class="space-y-3"
      >
        <div
          v-if="pending && !codes.length"
          class="py-16 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-8 text-primary animate-spin"
          />
        </div>

        <div
          v-else-if="!filteredCodes.length"
          class="text-center py-12"
        >
          <UIcon
            name="i-tabler-ticket"
            class="size-16 text-dimmed mx-auto mb-4"
          />
          <p class="text-sm text-muted">
            {{ $t('کد تخفیفی پیدا نشد') }}
          </p>
        </div>

        <div
          v-for="item in filteredCodes"
          :key="item.code"
          class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <div
                class="text-sm font-bold text-highlighted num"
                dir="ltr"
              >
                {{ item.code }}
              </div>
              <div class="mt-1 flex flex-wrap gap-2">
                <UBadge
                  color="error"
                  variant="subtle"
                  size="sm"
                  class="font-medium num"
                >
                  {{ item.percent.toLocaleString('fa-IR') }}٪
                </UBadge>
                <UBadge
                  :color="item.active ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ item.active ? $t('فعال') : $t('غیرفعال') }}
                </UBadge>
                <UBadge
                  v-if="isDiscountCodeLive(item)"
                  color="warning"
                  variant="subtle"
                  size="sm"
                >
                  {{ $t('در بازه') }}
                </UBadge>
                <UBadge
                  v-if="item.oncePerUser"
                  color="info"
                  variant="subtle"
                  size="sm"
                >
                  {{ $t('یک‌بار برای هر کاربر') }}
                </UBadge>
              </div>
              <div class="mt-2 text-[11px] text-muted num">
                {{ formatPromoRange(item.startsAt, item.endsAt) }}
              </div>
              <div class="mt-1 text-[11px] text-muted">
                {{ $t('حداقل مبلغ') }}:
                <span class="font-bold num text-highlighted">
                  {{ formatMoneyFa(item.minAmount) }}
                </span>
                {{ $t('تومان') }}
              </div>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <UButton
                :to="`/seller/promotions/codes/${item.code}`"
                color="primary"
                variant="soft"
                size="xs"
                icon="i-tabler-pencil"
              >
                {{ $t('ویرایش') }}
              </UButton>
              <UButton
                type="button"
                :color="item.active ? 'neutral' : 'success'"
                variant="ghost"
                size="xs"
                @click="toggleCode(item)"
              >
                {{ item.active ? $t('غیرفعال') : $t('فعال') }}
              </UButton>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-tabler-trash"
                @click="openDeleteCode(item)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Promos -->
      <div
        v-else
        class="space-y-3"
      >
        <div
          v-if="pending && !promos.length"
          class="py-16 grid place-items-center"
        >
          <UIcon
            name="i-tabler-loader-2"
            class="size-8 text-primary animate-spin"
          />
        </div>

        <div
          v-else-if="!filteredPromos.length"
          class="text-center py-12"
        >
          <UIcon
            name="i-tabler-megaphone"
            class="size-16 text-dimmed mx-auto mb-4"
          />
          <p class="text-sm text-muted">
            {{ $t('پرومویی پیدا نشد') }}
          </p>
        </div>

        <div
          v-for="item in filteredPromos"
          :key="item.id"
          class="bg-muted border border-muted rounded-2xl p-3 sm:p-4"
        >
          <div class="flex items-start gap-3">
            <div
              class="size-11 rounded-xl grid place-items-center shrink-0"
              :class="item.tone === 'warning' ? 'bg-warning/15 text-warning' : 'bg-primary/10 text-primary'"
            >
              <UIcon
                :name="`i-tabler-${item.icon}`"
                class="size-5"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 flex-wrap">
                <div class="min-w-0">
                  <div class="text-[11px] text-muted">
                    {{ item.eyebrow }}
                  </div>
                  <div class="text-sm font-medium text-highlighted mt-0.5">
                    {{ item.title }}
                  </div>
                  <div class="text-xs text-muted mt-1 line-clamp-2 leading-5">
                    {{ item.subtitle }}
                  </div>
                </div>
                <UBadge
                  :color="item.active ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ item.active ? $t('فعال') : $t('غیرفعال') }}
                </UBadge>
              </div>
              <div class="mt-3 flex items-center gap-2 flex-wrap">
                <UButton
                  :to="`/seller/promotions/promos/${item.id}`"
                  color="primary"
                  variant="soft"
                  size="xs"
                  icon="i-tabler-pencil"
                >
                  {{ $t('ویرایش') }}
                </UButton>
                <UButton
                  type="button"
                  :color="item.active ? 'neutral' : 'success'"
                  variant="ghost"
                  size="xs"
                  @click="togglePromo(item)"
                >
                  {{ item.active ? $t('غیرفعال') : $t('فعال') }}
                </UButton>
                <UButton
                  type="button"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-tabler-trash"
                  @click="openDeletePromo(item)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="deleteOpen"
      :title="deleteMode === 'code' ? $t('حذف کد تخفیف') : $t('حذف پرومو')"
      :description="$t('این عمل فقط در نشست فعلی فرانت اعمال می‌شود.')"
    >
      <template #body>
        <div class="rounded-xl border border-muted bg-muted/40 p-4 text-sm font-medium text-highlighted">
          {{ deleteLabel }}
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            @click="deleteOpen = false"
          >
            {{ $t('انصراف') }}
          </UButton>
          <UButton
            color="error"
            class="font-bold"
            @click="confirmDelete"
          >
            {{ $t('حذف') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  formatMoneyFa,
  formatPromoRange,
  isDiscountCodeLive,
  type SellerContentPromo,
  type SellerDiscountCode,
} from '~/data/seller-promotions'

const { t } = useI18n()
const toast = useAppToast()
const route = useRoute()
const router = useRouter()
const {
  codes,
  promos,
  pending,
  ensureLoaded,
  deleteCode,
  setCodeActive,
  deletePromo,
  setPromoActive,
} = useSellerPromotions()

type TabId = 'codes' | 'promos'

const query = ref('')
const activeTab = ref<TabId>(route.query.tab === 'promos' ? 'promos' : 'codes')
const deleteOpen = ref(false)
const deleteMode = ref<'code' | 'promo'>('code')
const pendingCode = ref<SellerDiscountCode | null>(null)
const pendingPromo = ref<SellerContentPromo | null>(null)
const actionBusy = ref(false)

await ensureLoaded({ force: true })

const filteredCodes = computed(() => {
  const q = query.value.trim().toUpperCase()
  if (!q) return codes.value
  return codes.value.filter(c => c.code.includes(q))
})

const filteredPromos = computed(() => {
  const q = query.value.trim()
  if (!q) return promos.value
  const lower = q.toLowerCase()
  return promos.value.filter(
    p =>
      p.title.includes(q)
      || p.eyebrow.includes(q)
      || p.id.toLowerCase().includes(lower),
  )
})

const deleteLabel = computed(() => {
  if (deleteMode.value === 'code') return pendingCode.value?.code ?? ''
  return pendingPromo.value?.title ?? ''
})

function setTab(tab: TabId) {
  activeTab.value = tab
  query.value = ''
  router.replace({ query: { ...route.query, tab } })
}

async function toggleCode(item: SellerDiscountCode) {
  if (actionBusy.value) return
  actionBusy.value = true
  try {
    const result = await setCodeActive(item.code, !item.active)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(item.active ? t('کد غیرفعال شد') : t('کد فعال شد'))
  }
  finally {
    actionBusy.value = false
  }
}

async function togglePromo(item: SellerContentPromo) {
  if (actionBusy.value) return
  actionBusy.value = true
  try {
    const result = await setPromoActive(item.id, !item.active)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(item.active ? t('پرومو غیرفعال شد') : t('پرومو فعال شد'))
  }
  finally {
    actionBusy.value = false
  }
}

function openDeleteCode(item: SellerDiscountCode) {
  deleteMode.value = 'code'
  pendingCode.value = item
  pendingPromo.value = null
  deleteOpen.value = true
}

function openDeletePromo(item: SellerContentPromo) {
  deleteMode.value = 'promo'
  pendingPromo.value = item
  pendingCode.value = null
  deleteOpen.value = true
}

async function confirmDelete() {
  if (actionBusy.value) return
  actionBusy.value = true
  try {
    if (deleteMode.value === 'code' && pendingCode.value) {
      const result = await deleteCode(pendingCode.value.code)
      deleteOpen.value = false
      pendingCode.value = null
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(t('کد تخفیف حذف شد'))
      return
    }
    if (pendingPromo.value) {
      const result = await deletePromo(pendingPromo.value.id)
      deleteOpen.value = false
      pendingPromo.value = null
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(t('پرومو حذف شد'))
    }
  }
  finally {
    actionBusy.value = false
  }
}
</script>
