import type { FooterContact, FooterPayload } from '~/data/footer'
import type { SiteSettings } from '~/composables/useSiteSettings'

export type StoreContact = {
  phones: { label: string, href: string }[]
  email: { label: string, href: string }
  address: string
  workingHours: string
}

/** Same contact fields the footer renders: phones, hours, and address. */
export function resolveStoreContact(
  footer: Pick<FooterPayload, 'contact'> | { contact?: FooterContact | null },
  site: Pick<
    SiteSettings,
    'supportEmail' | 'email' | 'supportPhone' | 'phone' | 'salesPhone' | 'address' | 'workingHours'
  >,
): StoreContact {
  const fromFooter = footer.contact
  const phones = (fromFooter?.phones || []).filter(phone => phone?.label && phone?.href)
  const emailLabel = fromFooter?.email?.label?.trim()
    || site.supportEmail?.trim()
    || site.email?.trim()
    || ''
  const emailHref = fromFooter?.email?.href?.trim()
    || (emailLabel ? `mailto:${emailLabel}` : '')

  const fallbackPhones: { label: string, href: string }[] = []
  if (!phones.length) {
    const support = site.supportPhone?.trim() || site.phone?.trim()
    const sales = site.salesPhone?.trim()
    if (support) {
      fallbackPhones.push({
        label: support,
        href: `tel:${support.replace(/\D/g, '') || support}`,
      })
    }
    if (sales) {
      fallbackPhones.push({
        label: sales,
        href: `tel:${sales.replace(/\D/g, '') || sales}`,
      })
    }
  }

  return {
    phones: phones.length ? phones : fallbackPhones,
    email: { label: emailLabel, href: emailHref },
    address: site.address?.trim() || '',
    workingHours: site.workingHours?.trim() || '',
  }
}

export async function useStoreContact() {
  const { footer, fetchFooter } = useFooter()
  const { site, fetchSite } = useSiteSettings()

  await Promise.all([fetchFooter(), fetchSite()])

  const contact = computed(() => resolveStoreContact(footer.value, site.value))

  return { contact }
}
