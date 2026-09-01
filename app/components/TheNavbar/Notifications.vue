<template>
  <div ref="wrapRef" class="relative">
    <button
      type="button"
      class="relative size-11 grid place-items-center rounded-xl transition"
      :class="open
        ? 'bg-primary/10 text-primary'
        : 'text-toned hover:bg-elevated'"
      :aria-label="$t('اعلان‌ها')"
      :aria-expanded="open"
      @click="open = !open"
    >
      <UIcon name="i-tabler-bell" class="size-5" />
      <span
        v-if="notificationCount > 0"
        class="absolute -top-0.5 -end-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-inverted text-[10px] font-bold grid place-items-center num"
      >
        {{ notificationCount }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute top-full end-0 mt-2 w-[min(24rem,calc(100vw-1.5rem))] bg-default border border-muted rounded-2xl shadow-xl overflow-hidden z-50"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-muted">
        <div class="flex items-center gap-2 min-w-0">
          <h3 class="text-sm font-bold text-highlighted">
            {{ $t('اعلان‌ها') }}
          </h3>
          <span
            v-if="notificationCount > 0"
            class="size-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold grid place-items-center num shrink-0"
          >
            {{ notificationCount }}
          </span>
        </div>
        <button
          v-if="notificationCount > 0"
          type="button"
          class="text-[11px] text-muted hover:text-primary transition shrink-0 text-start"
          @click="markAllNotificationsRead"
        >
          {{ $t('علامت‌گذاری همه به عنوان خوانده‌شده') }}
        </button>
      </div>

      <!-- List -->
      <div class="max-h-80 overflow-y-auto">
        <button
          v-for="item in notificationList"
          :key="item.id"
          type="button"
          class="w-full flex items-start gap-3 px-4 py-3 text-start border-b border-muted last:border-b-0 transition hover:bg-muted/60"
          :class="!item.read ? 'bg-primary/5' : ''"
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
              <p class="text-sm font-bold text-highlighted leading-6">
                {{ $t(item.title || '') }}
              </p>
              <span
                v-if="!item.read"
                class="mt-1.5 size-2 rounded-full bg-primary shrink-0"
                aria-hidden="true"
              />
            </div>
            <p class="text-xs text-toned leading-5 mt-0.5 line-clamp-2">
              {{ $t(item.description || '') }}
            </p>
            <p class="text-[11px] text-dimmed mt-1.5">
              {{ item.time || '' }}
            </p>
          </div>
        </button>

        <div
          v-if="!notificationList.length"
          class="px-4 py-10 text-center text-sm text-dimmed"
        >
          {{ $t('اعلانی وجود ندارد') }}
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-muted">
        <button
          type="button"
          class="w-full py-3 text-sm font-bold text-primary hover:bg-primary/5 transition"
          @click="viewAll"
        >
          {{ $t('مشاهده همه') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShopNotification } from '~/data/notifications'

const {
  notificationList,
  notificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} = useShop()

const open = ref(false)
const wrapRef = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

function onItemClick(item: ShopNotification) {
  markNotificationRead(item.id)
  if (item.to) {
    navigateTo(item.to)
  }
  close()
}

function viewAll() {
  navigateTo('/notifications')
  close()
}

onClickOutside(wrapRef, close)
</script>
