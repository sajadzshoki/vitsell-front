import type { SellerShop } from '~/data/seller'
import { defaultSellerShop } from '~/data/seller'

export type SiteSettings = SellerShop

function normalizeSite(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  return {
    ...defaultSellerShop,
    ...(raw && typeof raw === 'object' ? raw : {}),
    name: String(raw?.name ?? defaultSellerShop.name),
    slug: String(raw?.slug ?? defaultSellerShop.slug),
    phone: String(raw?.phone ?? defaultSellerShop.phone),
    email: String(raw?.email ?? defaultSellerShop.email),
    city: String(raw?.city ?? defaultSellerShop.city),
    about: String(raw?.about ?? defaultSellerShop.about),
    rating: Number(raw?.rating ?? defaultSellerShop.rating) || 0,
    reviewCount: Number(raw?.reviewCount ?? defaultSellerShop.reviewCount) || 0,
    joinDate: String(raw?.joinDate ?? defaultSellerShop.joinDate ?? ''),
  }
}

export function useSiteSettings() {
  const site = useState<SiteSettings>('site-settings', () => ({ ...defaultSellerShop }))
  const loaded = useState('site-settings-loaded', () => false)
  const pending = useState('site-settings-pending', () => false)

  async function fetchSite(options?: { force?: boolean, admin?: boolean }) {
    if (loaded.value && !options?.force) return site.value
    pending.value = true
    try {
      const path = options?.admin ? '/seller/shop' : '/site'
      const { result, error } = await useGet<Partial<SiteSettings>>(path, {
        headers: { 'no-error': true },
      })
      if (error || !result) {
        if (!loaded.value) site.value = { ...defaultSellerShop }
        return site.value
      }
      site.value = normalizeSite(result)
      loaded.value = true
      return site.value
    }
    finally {
      pending.value = false
    }
  }

  function applySite(payload: Partial<SiteSettings>) {
    site.value = normalizeSite({ ...site.value, ...payload })
    loaded.value = true
    return site.value
  }

  return {
    site,
    loaded,
    pending,
    fetchSite,
    applySite,
  }
}
