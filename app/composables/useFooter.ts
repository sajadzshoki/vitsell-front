import type {
  FooterColumn,
  FooterSocial,
  FooterTrustItem,
} from '~/data/footer'

export type FooterPayload = {
  trustItems: FooterTrustItem[]
  columns: FooterColumn[]
  socials: FooterSocial[]
  about: string
  copyright: string
}

export function useFooter() {
  const footer = useState<FooterPayload>('site-footer', () => ({
    trustItems: [],
    columns: [],
    socials: [],
    about: '',
    copyright: '',
  }))
  const loaded = useState('site-footer-loaded', () => false)
  const pending = useState('site-footer-pending', () => false)

  async function fetchFooter() {
    if (loaded.value || pending.value) return footer.value
    pending.value = true
    try {
      const { result } = await useGet<FooterPayload>('/footer', {
        headers: { 'no-error': true },
      })
      if (result) {
        footer.value = {
          trustItems: result.trustItems ?? [],
          columns: result.columns ?? [],
          socials: result.socials ?? [],
          about: result.about ?? '',
          copyright: result.copyright ?? '',
        }
      }
      loaded.value = true
      return footer.value
    }
    finally {
      pending.value = false
    }
  }

  return {
    footer,
    loaded,
    pending,
    fetchFooter,
  }
}
