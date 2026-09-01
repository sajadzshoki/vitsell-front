export type SellerRedirectType = 301 | 308 | 302

export type SellerRedirect = {
  id: string
  source: string
  destination: string
  type: SellerRedirectType
  active: boolean
  createdAt: string
  updatedAt: string
}

export type SellerRedirectForm = {
  id: string
  source: string
  destination: string
  type: SellerRedirectType
  active: boolean
}

export const sellerRedirectTypeMeta: Record<
  SellerRedirectType,
  { label: string, color: 'info' | 'success' | 'warning' }
> = {
  301: { label: '301 دائمی', color: 'success' },
  308: { label: '308 دائمی (حفظ متد)', color: 'info' },
  302: { label: '302 موقت', color: 'warning' },
}

export function emptyRedirectForm(): SellerRedirectForm {
  return {
    id: '',
    source: '',
    destination: '',
    type: 301,
    active: true,
  }
}

export function toRedirectForm(item: SellerRedirect): SellerRedirectForm {
  return {
    id: item.id,
    source: item.source,
    destination: item.destination,
    type: item.type,
    active: item.active,
  }
}

export function formToRedirect(
  form: SellerRedirectForm,
  previous?: SellerRedirect,
): SellerRedirect {
  const now = new Date().toISOString()
  const source = form.source.trim().startsWith('/')
    ? form.source.trim()
    : `/${form.source.trim()}`
  const destination = form.destination.trim()
  return {
    id: form.id.trim() || previous?.id || `redir-${Date.now()}`,
    source,
    destination,
    type: form.type,
    active: form.active,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}

export function buildDefaultSellerRedirects(): SellerRedirect[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'redir-1',
      source: '/old-blog',
      destination: '/blog',
      type: 301,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'redir-2',
      source: '/about-us',
      destination: '/about',
      type: 301,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ]
}
