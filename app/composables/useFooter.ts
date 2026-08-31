import type {
  FooterAppStore,
  FooterBadge,
  FooterColumn,
  FooterContact,
  FooterSocial,
  FooterTrustItem,
} from '~/data/footer'
import {
  footerAbout as defaultAbout,
  footerAppStores as defaultAppStores,
  footerBadges as defaultBadges,
  footerColumns as defaultColumns,
  footerContact as defaultContact,
  footerCopyright as defaultCopyright,
  footerSocials as defaultSocials,
  footerTrustItems as defaultTrustItems,
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

function emptyFooter(): FooterPayload {
  return {
    trustItems: [],
    columns: [],
    socials: [],
    about: '',
    copyright: '',
    contact: defaultContact,
    appStores: defaultAppStores,
    badges: defaultBadges,
  }
}

export function cloneFooter(payload: FooterPayload): FooterPayload {
  return JSON.parse(JSON.stringify(payload)) as FooterPayload
}

export function useFooter() {
  const footer = useState<FooterPayload>('site-footer', emptyFooter)
  const loaded = useState('site-footer-loaded', () => false)
  const pending = useState('site-footer-pending', () => false)

  async function fetchFooter(options?: { force?: boolean }) {
    if ((loaded.value || pending.value) && !options?.force) return footer.value
    pending.value = true
    try {
      const { result } = await useGet<FooterPayload>('/footer', {
        headers: { 'no-error': true },
      })
      if (result) {
        footer.value = {
          trustItems: result.trustItems?.length ? result.trustItems : defaultTrustItems,
          columns: (result.columns?.length ?? 0) >= 6 ? result.columns! : defaultColumns,
          socials: result.socials?.length ? result.socials : defaultSocials,
          about: result.about || defaultAbout,
          copyright: result.copyright || defaultCopyright,
          contact: result.contact ?? defaultContact,
          appStores: result.appStores?.length ? result.appStores : defaultAppStores,
          badges: result.badges?.length ? result.badges : defaultBadges,
        }
      }
      else {
        footer.value = {
          trustItems: defaultTrustItems,
          columns: defaultColumns,
          socials: defaultSocials,
          about: defaultAbout,
          copyright: defaultCopyright,
          contact: defaultContact,
          appStores: defaultAppStores,
          badges: defaultBadges,
        }
      }
      loaded.value = true
      return footer.value
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
    updateFooter,
  }
}
