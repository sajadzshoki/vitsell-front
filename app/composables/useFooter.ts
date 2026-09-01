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

function normalizeFooter(result: Partial<FooterPayload> | null | undefined): FooterPayload {
  return {
    trustItems: Array.isArray(result?.trustItems) ? result.trustItems : [],
    columns: Array.isArray(result?.columns) ? result.columns : [],
    socials: Array.isArray(result?.socials) ? result.socials : [],
    about: typeof result?.about === 'string' ? result.about : '',
    copyright: typeof result?.copyright === 'string' ? result.copyright : '',
    contact: result?.contact ?? emptyContact(),
    appStores: Array.isArray(result?.appStores) ? result.appStores : [],
    badges: Array.isArray(result?.badges) ? result.badges : [],
  }
}

export function cloneFooter(payload: FooterPayload): FooterPayload {
  return JSON.parse(JSON.stringify(payload)) as FooterPayload
}

export function useFooter() {
  const footer = useState<FooterPayload>('site-footer', emptyFooter)
  const loaded = useState('site-footer-loaded', () => false)
  const pending = useState('site-footer-pending', () => false)

  async function fetchFooter(options?: { force?: boolean, admin?: boolean }) {
    if ((loaded.value || pending.value) && !options?.force) return footer.value
    pending.value = true
    try {
      const path = options?.admin ? '/seller/footer' : '/footer'
      const { result, error } = await useGet<FooterPayload>(path, {
        headers: { 'no-error': true },
      })
      if (error || !result) {
        if (!loaded.value) footer.value = emptyFooter()
        return footer.value
      }
      footer.value = normalizeFooter(result)
      loaded.value = true
      return footer.value
    }
    finally {
      pending.value = false
    }
  }

  async function saveFooter(payload: FooterPayload) {
    const { result, error } = await usePut<FooterPayload>('/seller/footer', payload, {
      headers: { 'no-error': true },
    })
    if (error || !result) {
      return { ok: false as const, error, footer: footer.value }
    }
    footer.value = normalizeFooter(result)
    loaded.value = true
    return { ok: true as const, error: null, footer: footer.value }
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
