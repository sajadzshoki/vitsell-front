type ColorModePreference = 'light' | 'dark' | 'system'

function prefersReducedMotion() {
  return import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function applyWithViewTransition(apply: () => void) {
  if (!import.meta.client || prefersReducedMotion() || !document.startViewTransition) {
    apply()
    return
  }

  document.startViewTransition(apply)
}

export function useColorModeTransition() {
  const colorMode = useColorMode()

  function setPreference(value: ColorModePreference) {
    applyWithViewTransition(() => {
      colorMode.preference = value
    })
  }

  function toggle() {
    setPreference(colorMode.value === 'dark' ? 'light' : 'dark')
  }

  const isDark = computed({
    get: () => colorMode.value === 'dark',
    set: (value: boolean) => setPreference(value ? 'dark' : 'light'),
  })

  return {
    colorMode,
    isDark,
    toggle,
    setPreference,
  }
}
