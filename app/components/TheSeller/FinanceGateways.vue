<template>
  <div class="bg-default max-lg:(bg-transparent border-0 rounded-none) border border-muted rounded-2xl p-5 md:p-6 max-lg:p-0">
    <div
      v-if="loading && !loaded"
      class="space-y-3"
    >
      <USkeleton class="h-10 rounded-xl" />
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-28 rounded-2xl"
      />
    </div>

    <template v-else>
      <TheSellerPageHeader
        :title="$t('درگاه‌های پرداخت')"
        :description="$t('نمایش وضعیت درگاه‌ها. کلیدهای API فقط روی سرور نگهداری می‌شوند و در این پنل وارد یا ذخیره نمی‌شوند.')"
        :count-label="`${gateways.length.toLocaleString('fa-IR')} ${$t('درگاه')}`"
      />

      <div class="rounded-xl border border-info/30 bg-info/5 p-4 text-xs text-toned leading-6 mb-5">
        {{ $t('رازها و API Key فقط در متغیرهای محیطی سرور تنظیم می‌شوند. این صفحه فقط اولویت نمایش، فعال/غیرفعال بودن و وضعیت پیکربندی را نشان می‌دهد.') }}
      </div>

      <TheSellerEmptyState
        v-if="!gateways.length"
        icon="i-tabler-server"
        :message="$t('درگاهی تعریف نشده')"
      />

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="gw in gateways"
          :key="gw.id"
          class="bg-muted border border-muted rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-highlighted">
                  {{ gw.name }}
                </span>
                <UBadge
                  :color="sellerGatewayConfigStatusMeta[gw.configStatus].color"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t(sellerGatewayConfigStatusMeta[gw.configStatus].label) }}
                </UBadge>
                <UBadge
                  :color="gw.enabled ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                >
                  {{ gw.enabled ? $t('فعال') : $t('غیرفعال') }}
                </UBadge>
              </div>
              <p class="text-xs text-muted mt-2 leading-6">
                {{ gw.note }}
              </p>
              <div class="text-[11px] text-muted mt-2">
                {{ $t('روش‌ها') }}:
                {{ gw.supportedMethods.join('، ') }}
                · {{ $t('اولویت') }}:
                <span class="num">{{ gw.priority.toLocaleString('fa-IR') }}</span>
              </div>
            </div>

            <div
              v-if="can('finance.manage')"
              class="flex items-end gap-5 shrink-0 flex-wrap"
            >
              <UFormField :label="$t('اولویت')">
                <UInput
                  type="number"
                  :model-value="gw.priority"
                  class="w-20"
                  dir="ltr"
                  @update:model-value="onPriority(gw.id, $event)"
                />
              </UFormField>
              <USwitch
                :model-value="gw.enabled"
                @update:model-value="updateGateway(gw.id, { enabled: Boolean($event) })"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { sellerGatewayConfigStatusMeta } from '~/data/seller-finance-gateways'

const { t } = useI18n()
const toast = useAppToast()
const { can } = useSellerPermissions()
const {
  gateways,
  updateGateway,
  loaded,
  loading,
  ensureLoaded,
} = useSellerFinance()

function onPriority(id: string, raw: string | number | null | undefined) {
  const priority = Math.max(1, Math.round(Number(raw) || 1))
  updateGateway(id, { priority })
}

const boot = await ensureLoaded()
if (!boot.ok) toast.error(t(boot.error || 'بارگذاری درگاه‌ها ناموفق بود'))
</script>
