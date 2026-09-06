import type {
  FooterAppStore,
  FooterBadge,
  FooterColumn,
  FooterContact,
  FooterSocial,
  FooterTrustItem,
} from '~/data/footer'

export type FooterPayload = {
  trustItems: FooterTrustItem[]
  columns: FooterColumn[]
  socials: FooterSocial[]
  about: string
  copyright: string
  contact?: FooterContact
  appStores?: FooterAppStore[]
  badges?: FooterBadge[]
}

function emptyContact(): FooterContact {
  return {
    phones: [],
    email: { label: '', href: '' },
  }
}

function emptyFooter(): FooterPayload {
  return {
    trustItems: [],
    columns: [],
    socials: [],
    about: '',
    copyright: '',
    contact: emptyContact(),
    appStores: [],
    badges: [],
  }
}

function normalizeContact(raw: unknown): FooterContact {
  const src = raw && typeof raw === 'object' ? (raw as FooterContact) : null
  const phones = Array.isArray(src?.phones)
    ? src.phones
      .map(p => ({
        label: String(p?.label || '').trim(),
        href: String(p?.href || '').trim(),
      }))
      .filter(p => p.label || p.href)
    : []
  const emailLabel = String(src?.email?.label || '').trim()
  const emailHref = String(src?.email?.href || '').trim()
    || (emailLabel ? `mailto:${emailLabel}` : '')
  return {
    phones,
    email: { label: emailLabel, href: emailHref },
  }
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function normalizeFooter(result: Partial<FooterPayload> | null | undefined): FooterPayload {
  return {
    trustItems: asArray<FooterTrustItem>(result?.trustItems),
    columns: asArray<FooterColumn>(result?.columns),
    socials: asArray<FooterSocial>(result?.socials),
    about: typeof result?.about === 'string' ? result.about : '',
    copyright: typeof result?.copyright === 'string' ? result.copyright : '',
    contact: normalizeContact(result?.contact),
    appStores: asArray<FooterAppStore>(result?.appStores),
    badges: asArray<FooterBadge>(result?.badges),
  }
}

function apiErrorMessage(error: any, fallback: string) {
  const fromFields = error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
  return fromFields || error?.data?.message || fallback
}

export function cloneFooter(payload: FooterPayload): FooterPayload {
  return JSON.parse(JSON.stringify(payload)) as FooterPayload
}

export function useFooter() {
  const footer = useState<FooterPayload>('site-footer', emptyFooter)
  const loaded = useState('site-footer-loaded', () => false)
  const pending = useState('site-footer-pending', () => false)

  async function fetchFooter(options?: { force?: boolean, admin?: boolean }) {
    if (loaded.value && !options?.force) {
      return { ok: true as const, error: null as null, footer: footer.value }
    }

    pending.value = true
    try {
      const path = options?.admin ? '/seller/footer' : '/footer'
      const { result, error } = await useGet<FooterPayload>(path, {
        headers: { 'no-error': true },
        // Admin routes need the browser auth cookie — skip SSR
        ...(options?.admin ? { server: false } : {}),
      })

      if (error || result == null) {
        if (!loaded.value) footer.value = emptyFooter()
        return {
          ok: false as const,
          error: apiErrorMessage(error, 'بارگذاری اطلاعات فوتر ناموفق بود'),
          footer: footer.value,
        }
      }

      footer.value = normalizeFooter(result)
      loaded.value = true
      return { ok: true as const, error: null as null, footer: footer.value }
    }
    finally {
      pending.value = false
    }
  }

  async function saveFooter(payload: FooterPayload) {
    pending.value = true
    try {
      const { result, error } = await usePut<FooterPayload>('/seller/footer', payload, {
        headers: { 'no-error': true },
      })
      if (error || result == null) {
        return {
          ok: false as const,
          error,
          footer: footer.value,
        }
      }
      footer.value = normalizeFooter(result)
      loaded.value = true
      return { ok: true as const, error: null, footer: footer.value }
    }
    finally {
      pending.value = false
    }
  }

  function updateFooter(payload: FooterPayload) {
    footer.value = cloneFooter(payload)
    loaded.value = true
    return footer.value
  }

  return {
    footer,
    loaded,
    pending,
    fetchFooter,
    saveFooter,
    updateFooter,
  }
}
