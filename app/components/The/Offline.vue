<script setup lang="ts">
const retryConnection = () => {
  window.location.reload()
}
onMounted(() => {
  window.addEventListener("online", () => {
    window.location.reload()
  })
})
const {t} = useI18n()
</script>

<template>
  <div
      class="min-h-screen flex items-center justify-center
           bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
           text-slate-100 relative overflow-hidden"
  >
    <!-- Glow background -->
    <div class="absolute -top-32 -left-32 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-40 -right-24 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>

    <div
        class="relative z-10 max-w-md w-full mx-4 text-center
             backdrop-blur-xl bg-white/5 border border-white/10
             rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,0.55)]
             p-8"
    >
      <!-- icon -->
      <div
          class="w-16 h-16 mx-auto mb-6 rounded-2xl
               bg-gradient-to-br from-rose-500/20 to-cyan-400/20
               flex items-center justify-center
               border border-white/10"
      >
        <svg
            class="w-8 h-8 text-rose-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
          <path
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2 8.82C4.94 6.6 8.31 5.5 12 5.5c3.69 0 7.06 1.1 10 3.32M5 12.5c2.06-1.52 4.47-2.28 7-2.28s4.94.76 7 2.28M8.5 16.2c1.04-.77 2.25-1.15 3.5-1.15s2.46.38 3.5 1.15M12 20h.01"
          />
          <line
              x1="3"
              y1="3"
              x2="21"
              y2="21"
              stroke-width="1.7"
              stroke-linecap="round"
          />
        </svg>
      </div>

      <!-- title -->
      <h2 class="text-xl font-semibold text-white mb-2">
        {{ t('        اینترنت شما قطع است') }}
      </h2>

      <!-- description -->
      <p class="text-slate-300 text-sm leading-relaxed mb-8">
        {{ t('اتصال اینترنت برقرار نیست. لطفاً Wi‑Fi یا داده‌ی موبایل خود را بررسیکنید و سپس دوباره تلاش کنید.') }}
      </p>

      <!-- action -->
      <button
          @click="retryConnection"
          class="inline-flex items-center justify-center gap-2
               px-6 py-2.5 rounded-full text-sm font-medium
               bg-gradient-to-r from-cyan-500 via-sky-500 to-fuchsia-500
               text-slate-950 shadow-lg shadow-cyan-500/25
               hover:scale-[1.03] hover:shadow-fuchsia-500/30
               transition-all duration-200"
      >
        {{ t('        تلاش مجدد') }}
      </button>

      <!-- hint -->
      <p class="mt-6 text-xs text-slate-400">
        {{ t('        پس از اتصال اینترنت، این صفحه به صورت خودکار نیز قابل رفرش است.') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
