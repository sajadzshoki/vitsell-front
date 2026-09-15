import {
  formToRedirect,
  type SellerRedirect,
  type SellerRedirectForm,
  type SellerRedirectType,
} from '~/data/seller-redirects'

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function normalizePath(path: string) {
  const trimmed = path.trim()
  if (!trimmed) return '/'
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1)
  }
  return withSlash
}

function toRedirect(raw: any): SellerRedirect {
  const typeNum = Number(raw?.type)
  const type: SellerRedirectType =
    typeNum === 308 || typeNum === 302 || typeNum === 301 ? typeNum : 301
  const now = new Date().toISOString()
  return {
    id: String(raw?.id || `redir-${Date.now()}`),
    source: normalizePath(String(raw?.source || '/')),
    destination: String(raw?.destination || '').trim() || '/',
    type,
    active: raw?.active === false ? false : true,
    createdAt: raw?.createdAt ? String(raw.createdAt) : now,
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : now,
  }
}

export function useSellerRedirects() {
  const redirects = useState<SellerRedirect[]>('seller-seo-redirects', () => [])
  const loaded = useState('seller-seo-redirects-loaded', () => false)
  const pending = useState('seller-seo-redirects-pending', () => false)

  async function fetchRedirects(options?: { force?: boolean, admin?: boolean }) {
    if (loaded.value && !options?.force) {
      return { ok: true as const, error: null as null }
    }
    pending.value = true
    try {
      // Storefront uses public `/seo/redirects`; seller panel keeps admin CRUD path.
      const path = options?.admin ? '/seller/seo/redirects' : '/seo/redirects'
      const { result, error } = await useGet<{ items: SellerRedirect[] } | SellerRedirect[]>(
        path,
        { headers: { 'no-error': true }, server: false },
      )
      if (error || result == null) {
        // Stop retry storms on every route change when API is down / old deploy.
        loaded.value = true
        redirects.value = []
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'بارگذاری ریدایرکت‌ها ناموفق بود'),
        }
      }
      const items = Array.isArray(result) ? result : result.items
      redirects.value = Array.isArray(items) ? items.map(toRedirect) : []
      loaded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  function ensureLoaded() {
    if (!loaded.value && !pending.value) {
      void fetchRedirects()
    }
    return redirects.value
  }

  function findByPath(path: string) {
    ensureLoaded()
    const target = normalizePath(path)
    return redirects.value.find(item =>
      item.active && normalizePath(item.source) === target,
    )
  }

  async function createRedirect(form: SellerRedirectForm) {
    const draft = formToRedirect(form)
    const { result, error } = await usePost<SellerRedirect>('/seller/seo/redirects', {
      source: draft.source,
      destination: draft.destination,
      type: draft.type,
      active: draft.active,
    }, { headers: { 'no-error': true } })
    if (error || !result?.id) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'ثبت ریدایرکت ناموفق بود'),
        redirect: null as SellerRedirect | null,
      }
    }
    const item = toRedirect(result)
    redirects.value = [...redirects.value, item]
    loaded.value = true
    return { ok: true as const, error: null as null, redirect: item }
  }

  async function updateRedirect(id: string, form: SellerRedirectForm) {
    const previous = redirects.value.find(r => r.id === id)
    const draft = formToRedirect(form, previous)
    const { result, error } = await usePut<SellerRedirect>(
      `/seller/seo/redirects/${encodeURIComponent(id)}`,
      {
        source: draft.source,
        destination: draft.destination,
        type: draft.type,
        active: draft.active,
      },
      { headers: { 'no-error': true } },
    )
    if (error || !result?.id) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'به‌روزرسانی ریدایرکت ناموفق بود'),
        redirect: null as SellerRedirect | null,
      }
    }
    const item = toRedirect(result)
    redirects.value = redirects.value.map(r => (r.id === id ? item : r))
    return { ok: true as const, error: null as null, redirect: item }
  }

  async function deleteRedirect(id: string) {
    const { error } = await useDelete(`/seller/seo/redirects/${encodeURIComponent(id)}`, {
      headers: { 'no-error': true },
    })
    if (error) {
      return {
        ok: false as const,
        error: apiErrorMessage(error, 'حذف ریدایرکت ناموفق بود'),
      }
    }
    redirects.value = redirects.value.filter(r => r.id !== id)
    return { ok: true as const, error: null as null }
  }

  return {
    redirects: computed(() => redirects.value),
    pending,
    loaded,
    ensureLoaded,
    fetchRedirects,
    findByPath,
    createRedirect,
    updateRedirect,
    deleteRedirect,
  }
}
