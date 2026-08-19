<template>
  <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative overflow-hidden"
  >
    <!-- Glow circles background -->
    <div
        class="pointer-events-none absolute -top-32 -left-32 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl"
    ></div>
    <div
        class="pointer-events-none absolute -bottom-40 -right-24 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"
    ></div>

    <!-- Subtle grid / noise overlay -->
    <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#ffffff0a,_transparent_55%)] mix-blend-soft-light"
    ></div>

    <div
        class="relative z-10 max-w-md w-full mx-4 text-center
             backdrop-blur-xl bg-white/5 border border-white/10
             rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,0.55)] p-8
             before:absolute before:-inset-px before:-z-10 before:rounded-[1.6rem]
             before:bg-[conic-gradient(from_220deg_at_50%_50%,#22d3ee33,#a855f733,#22d3ee33)] before:opacity-0
             hover:before:opacity-100 before:transition-opacity before:duration-700"
    >
      <!-- Icon / status badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 border border-white/10 mb-6">
        <span
            class="inline-flex h-2 w-2 rounded-full bg-rose-400 animate-[ping_1.5s_ease-out_infinite]"
        ></span>
        <span class="text-xs font-medium tracking-wide text-slate-300">
          {{ error.statusCode === 404 ? 'صفحه پیدا نشد' : 'خطای غیرمنتظره' }}
        </span>
      </div>

      <!-- Error code with animation -->
      <div class="relative inline-block mb-4">
        <div
            class="absolute -inset-4 bg-gradient-to-tr from-fuchsia-500/15 via-cyan-400/0 to-emerald-400/15 blur-2xl"
        ></div>
        <div
            class="relative text-[140px] sm:text-[160px] font-black leading-none
                 bg-gradient-to-br from-slate-50 via-cyan-300 to-fuchsia-400
                 bg-clip-text text-transparent
                 drop-shadow-[0_10px_35px_rgba(0,0,0,0.7)]
                 animate-[float_4s_ease-in-out_infinite]"
        >
          {{ error.statusCode || 'خطا' }}
        </div>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-3 justify-center mb-6">
        <span class="h-px w-10 bg-gradient-to-l from-transparent via-white/40 to-transparent"></span>
        <span class="w-1 h-1 rounded-full bg-cyan-300"></span>
        <span class="h-px w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"></span>
      </div>

      <!-- Title & message -->
      <h2 class="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">
        {{ titleText }}
      </h2>

      <p class="text-sm sm:text-[15px] text-slate-300/90 leading-relaxed mb-8">
        {{ messageText }}
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
            @click="handleError"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2
                 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide
                 bg-gradient-to-r from-cyan-500 via-sky-500 to-fuchsia-500
                 text-slate-950 shadow-lg shadow-cyan-500/25
                 hover:shadow-fuchsia-500/30 hover:scale-[1.02]
                 transition-all duration-200"
        >
          <span>
            {{ error.statusCode === 404 ? 'بازگشت به صفحه قبلی' : 'تلاش مجدد' }}
          </span>
          <svg
              v-if="error.statusCode === 404"
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
          >
            <path
                d="M5 12h14M5 12l5-5M5 12l5 5"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
          </svg>
          <svg
              v-else
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
          >
            <path
                d="M12 5v6l3 3M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
            @click="goHome"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2
                 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide
                 border border-white/15 text-slate-200 bg-slate-900/60
                 hover:bg-slate-800/80 hover:border-cyan-400/60
                 transition-all duration-200"
        >
          <span>صفحه اصلی</span>
        </button>
      </div>

      <!-- Extra hint -->
      <p class="mt-6 text-[11px] text-slate-400/80">
        اگر فکر می‌کنید این یک باگ است، مسیر وارد شده را دوباره بررسی کنید یا با پشتیبانی تماس بگیرید.
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})
const router = useRouter()
// Nuxt's clearError is available in error pages;
// if not in your setup, inject via useError or router.
const handleError = () => {
  // clearError({ redirect: '/' })
  router.back()
}

const goHome = () => {
  clearError({ redirect: '/' })
}

const titleText = computed(() => {
  if (props.error.statusCode === 404) return 'اینجا خبری نیست!'
  return 'یه چیزی این وسط اشتباه شد'
})

const messageText = computed(() => {
  if (props.error.statusCode === 404) {
    return 'آدرس وارد شده اشتباه است یا صفحه‌ای که دنبالش بودید جابه‌جا شده. بیا برگردیم به جایی که همه‌چیز از آن‌جا شروع شد.'
  }
  return props.error.message || 'در پردازش درخواست شما مشکلی پیش آمد. چند لحظه بعد دوباره امتحان کنید.'
})
</script>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
