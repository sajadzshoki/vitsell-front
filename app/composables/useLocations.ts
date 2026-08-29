export function useLocations() {
  const citiesByProvince = useState<Record<string, string[]>>(
    'cities-by-province',
    () => ({}),
  )
  const loaded = useState('locations-loaded', () => false)
  const pending = useState('locations-pending', () => false)

  const provinces = computed(() => Object.keys(citiesByProvince.value).sort((a, b) =>
    a.localeCompare(b, 'fa'),
  ))

  function getCitiesForProvince(province: string) {
    if (!province) return []
    return citiesByProvince.value[province] ?? []
  }

  function getProvinceOptions() {
    return provinces.value
  }

  async function fetchLocations() {
    if (loaded.value || pending.value) return citiesByProvince.value
    pending.value = true
    try {
      const { result } = await useGet<Record<string, string[]>>('/locations', {
        headers: { 'no-error': true },
      })
      citiesByProvince.value = result && typeof result === 'object' ? result : {}
      loaded.value = true
      return citiesByProvince.value
    }
    finally {
      pending.value = false
    }
  }

  return {
    citiesByProvince,
    provinces,
    loaded,
    pending,
    getCitiesForProvince,
    getProvinceOptions,
    fetchLocations,
  }
}
