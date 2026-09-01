import { checkoutGateways } from '~/data/checkout'

/** Safe gateway display config — never store API secrets in FE */

export type SellerGatewayConfigStatus = 'live' | 'not_configured' | 'display_only'

export type SellerFinanceGateway = {
  id: string
  name: string
  enabled: boolean
  priority: number
  supportedMethods: string[]
  configStatus: SellerGatewayConfigStatus
  note: string
}

export const sellerGatewayConfigStatusMeta: Record<
  SellerGatewayConfigStatus,
  { label: string, color: 'success' | 'warning' | 'neutral' }
> = {
  live: { label: 'فعال (سرور)', color: 'success' },
  not_configured: { label: 'پیکربندی نشده', color: 'warning' },
  display_only: { label: 'نمایشی', color: 'neutral' },
}

export function buildDefaultGateways(): SellerFinanceGateway[] {
  const names = checkoutGateways.length ? [...checkoutGateways] : ['زرین‌پال']
  return names.map((name, index) => {
    const isZarin = name.includes('زرین')
    return {
      id: `gw-${index + 1}`,
      name,
      enabled: isZarin,
      priority: index + 1,
      supportedMethods: isZarin ? ['آنلاین'] : ['آنلاین'],
      configStatus: isZarin ? 'live' : 'display_only',
      note: isZarin
        ? 'کلیدها فقط در env سرور (ZARINPAL_*). فرانت کلید ذخیره نمی‌کند.'
        : 'فقط برچسب نمایشی در تسویه‌حساب مشتری — اتصال سرور پیکربندی نشده.',
    }
  })
}
