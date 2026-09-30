<template>
  <div>
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="hidden md:flex items-center gap-2">
        <h1 class="text-lg font-bold text-highlighted">{{ $t('اعلان‌ها') }}</h1>
        <span
          v-if="notificationCount > 0"
          class="size-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold grid place-items-center num"
        >
          {{ notificationCount }}
        </span>
      </div>
      <UButton
        v-if="notificationCount > 0"
        color="neutral"
        variant="ghost"
        size="sm"
        class="ms-auto md:ms-0"
        @click="markAllNotificationsRead"
      >
        {{ $t('علامت‌گذاری همه به عنوان خوانده‌شده') }}
      </UButton>
    </div>

    <div class="bg-default border border-muted rounded-2xl overflow-hidden ">
      <button
        v-for="item in notificationList"
        :key="item.id"
        type="button"
        class="w-full flex items-start gap-3 px-4 py-3 text-start border-b border-muted last:border-b-0 transition-all  cursor-pointer hover:(scale-[102%] shadow-lg bg-muted) "
        :class="!item.read ? 'bg-primary/5 first:rounded-t-2xl' : ''"
        @click="onItemClick(item)"
      >
        <div
          class="size-10 rounded-xl grid place-items-center shrink-0"
          :class="!item.read ? 'bg-primary/10 text-primary' : 'bg-elevated text-muted'"
        >
          <UIcon :name="item.icon" class="size-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-bold text-highlighted">{{ $t(item.title) }}</p>
            <span
              v-if="!item.read"
              class="mt-1.5 size-2 rounded-full bg-primary shrink-0"
            />
          </div>
          <p class="text-xs text-toned mt-0.5">{{ $t(item.description) }}</p>
          <p class="text-[11px] text-dimmed mt-1.5">{{ $t(item.time) }}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShopNotification } from '~/data/notifications'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()

const {
  notificationList,
  notificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} = useShop()

useMobileBackwardTitle(() => t('اعلان‌ها'))

function onItemClick(item: ShopNotification) {
  markNotificationRead(item.id)
  if (item.to) {
    navigateTo(item.to)
  }
}
</script>
