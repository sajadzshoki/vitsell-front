<template>
  <div class="max-lg:-mx-3 sm:max-lg:-mx-4">
    <h2 class="hidden lg:block font-bold text-highlighted mb-5 px-0">
      {{ $t('تنظیمات') }}
    </h2>

    <div class="bg-default lg:border-muted lg:(border border-muted rounded-2xl overflow-hidden)">
      <nav aria-label="settings">
        <NuxtLink
          v-for="item in settingsLinkItems"
          :key="item.id"
          :to="item.to"
          class="w-full flex items-center gap-3 px-4 py-3.5 text-start border-b border-muted transition hover:bg-muted/50 lg:px-5"
        >
          <div class="size-9 rounded-xl grid place-items-center shrink-0 bg-muted text-toned">
            <UIcon :name="item.icon" class="size-5" />
          </div>
          <span class="flex-1 text-sm text-default font-medium">{{ $t(item.label) }}</span>
          <UIcon name="i-tabler-chevron-left" class="size-4 text-dimmed shrink-0" />
        </NuxtLink>

        <div
          class="flex items-center gap-3 px-4 py-3.5 border-b border-muted lg:px-5"
        >
          <div class="size-9 rounded-xl grid place-items-center shrink-0 bg-muted text-toned">
            <UIcon :name="isDark ? 'i-tabler-moon' : 'i-tabler-sun'" class="size-5" />
          </div>
          <div class="flex-1 min-w-0 text-start">
            <div class="text-sm text-default font-medium">
              {{ isDark ? $t('حالت تاریک') : $t('حالت روشن') }}
            </div>
            <div class="text-[11px] text-muted mt-0.5">
              {{ $t('ظاهر برنامه را تغییر دهید') }}
            </div>
          </div>
          <USwitch
            v-model="isDark"
            color="primary"
            size="md"
            class="shrink-0"
            checked-icon="i-tabler-moon"
            unchecked-icon="i-tabler-sun"
            :aria-label="isDark ? $t('حالت تاریک') : $t('حالت روشن')"
          />
        </div>

        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-3.5 text-start transition hover:bg-error/5 lg:px-5"
          @click="onLogout"
        >
          <div class="size-9 rounded-xl grid place-items-center shrink-0 bg-error/10 text-error">
            <UIcon name="i-tabler-logout" class="size-5" />
          </div>
          <span class="flex-1 text-sm font-medium text-error">{{ $t('خروج از حساب کاربری') }}</span>
          <UIcon name="i-tabler-chevron-left" class="size-4 text-error/60 shrink-0" />
        </button>
      </nav>
    </div>

    <footer class="text-center py-8 lg:py-10">
      <div class="inline-flex items-center gap-2 text-primary font-bold text-lg mb-1">
        <UIcon name="i-tabler-shopping-bag" class="size-6" />
        <span>{{ $t('دیجی‌شاپ') }}</span>
      </div>
      <div class="text-[11px] text-dimmed num">
        {{ $t('نسخه') }} {{ appVersion }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { appVersion, settingsLinkItems } from '~/data/settings'

const { isDark } = useColorModeTransition()
const { requestLogout } = useAccountLogout()

function onLogout() {
  requestLogout()
}
</script>
