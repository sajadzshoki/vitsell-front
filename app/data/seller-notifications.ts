export type SellerNotificationAudienceType = 'all' | 'group' | 'users'

export type SellerNotificationAudienceGroup =
  | 'all_customers'
  | 'has_orders'
  | 'new_users'
  | 'inactive'

export type SellerMockUser = {
  id: number
  name: string
  phone: string
  groupHints: SellerNotificationAudienceGroup[]
}

export type SellerNotificationCampaign = {
  id: string
  title: string
  description: string
  link: string | null
  icon: string
  audienceType: SellerNotificationAudienceType
  audienceGroup: SellerNotificationAudienceGroup | null
  userIds: number[]
  recipientCount: number
  status: 'sent' | 'draft'
  createdAt: string
  sentAt: string | null
}

export type SellerNotificationFormValues = {
  title: string
  description: string
  link: string
  icon: string
  audienceType: SellerNotificationAudienceType
  audienceGroup: SellerNotificationAudienceGroup
  userIds: number[]
}

export const sellerNotificationAudienceMeta: Record<
  SellerNotificationAudienceType,
  { label: string }
> = {
  all: { label: 'همه کاربران' },
  group: { label: 'گروه کاربران' },
  users: { label: 'کاربران انتخابی' },
}

export const sellerNotificationGroupMeta: Record<
  SellerNotificationAudienceGroup,
  { label: string, description: string }
> = {
  all_customers: {
    label: 'همه مشتریان',
    description: 'تمام کاربران ثبت‌نام‌شده',
  },
  has_orders: {
    label: 'دارای سفارش',
    description: 'کاربرانی که حداقل یک سفارش دارند',
  },
  new_users: {
    label: 'کاربران جدید',
    description: 'ثبت‌نام‌های اخیر',
  },
  inactive: {
    label: 'غیرفعال',
    description: 'بدون خرید در بازه اخیر',
  },
}

export const sellerNotificationIcons = [
  'i-tabler-bell',
  'i-tabler-package',
  'i-tabler-discount-2',
  'i-tabler-truck',
  'i-tabler-ticket',
  'i-tabler-megaphone',
  'i-tabler-heart',
  'i-tabler-info-circle',
] as const

/** کاربران نمونه برای انتخاب مخاطب (فرانت‌only) */
export const sellerMockUsers: SellerMockUser[] = [
  { id: 1, name: 'نگار موسوی', phone: '09123334455', groupHints: ['has_orders', 'all_customers'] },
  { id: 2, name: 'رضا کریمی', phone: '09351234567', groupHints: ['has_orders', 'all_customers'] },
  { id: 3, name: 'الهام جعفری', phone: '09125556677', groupHints: ['has_orders', 'all_customers'] },
  { id: 4, name: 'سارا محمدی', phone: '09127654321', groupHints: ['has_orders', 'all_customers'] },
  { id: 5, name: 'کیانوش مرادی', phone: '09361112233', groupHints: ['has_orders', 'all_customers'] },
  { id: 6, name: 'امیر حسینی', phone: '09199887766', groupHints: ['has_orders', 'all_customers'] },
  { id: 7, name: 'نیلوفر اکبری', phone: '09134445566', groupHints: ['new_users', 'all_customers'] },
  { id: 8, name: 'مینا رضایی', phone: '09211223344', groupHints: ['new_users', 'all_customers'] },
  { id: 9, name: 'فرهاد صالحی', phone: '09127778899', groupHints: ['inactive', 'all_customers'] },
  { id: 10, name: 'مهدی کاظمی', phone: '09390001122', groupHints: ['inactive', 'all_customers'] },
  { id: 11, name: 'زهرا نوری', phone: '09121110022', groupHints: ['new_users', 'all_customers'] },
  { id: 12, name: 'پارسا احمدی', phone: '09120001122', groupHints: ['inactive', 'all_customers'] },
]

export function emptyNotificationForm(): SellerNotificationFormValues {
  return {
    title: '',
    description: '',
    link: '',
    icon: 'i-tabler-bell',
    audienceType: 'all',
    audienceGroup: 'all_customers',
    userIds: [],
  }
}

export function resolveAudienceUsers(
  audienceType: SellerNotificationAudienceType,
  audienceGroup: SellerNotificationAudienceGroup | null,
  userIds: number[],
): SellerMockUser[] {
  if (audienceType === 'all') {
    return [...sellerMockUsers]
  }
  if (audienceType === 'users') {
    const set = new Set(userIds)
    return sellerMockUsers.filter(u => set.has(u.id))
  }
  const group = audienceGroup ?? 'all_customers'
  if (group === 'all_customers') return [...sellerMockUsers]
  return sellerMockUsers.filter(u => u.groupHints.includes(group))
}

export function audienceSummary(campaign: SellerNotificationCampaign) {
  if (campaign.audienceType === 'all') {
    return sellerNotificationAudienceMeta.all.label
  }
  if (campaign.audienceType === 'group' && campaign.audienceGroup) {
    return sellerNotificationGroupMeta[campaign.audienceGroup].label
  }
  if (campaign.audienceType === 'users') {
    return `${campaign.userIds.length} کاربر`
  }
  return '—'
}

export function buildDefaultNotificationCampaigns(): SellerNotificationCampaign[] {
  const now = new Date()
  const iso = (hoursAgo: number) =>
    new Date(now.getTime() - hoursAgo * 3600_000).toISOString()

  return [
    {
      id: 'ntf-1001',
      title: 'جشنواره شگفت‌انگیز شروع شد',
      description: 'تا ۴۰٪ تخفیف روی منتخب کالاهای دیجیتال — فرصت محدود.',
      link: '/search?q=تخفیف',
      icon: 'i-tabler-discount-2',
      audienceType: 'all',
      audienceGroup: null,
      userIds: [],
      recipientCount: sellerMockUsers.length,
      status: 'sent',
      createdAt: iso(26),
      sentAt: iso(26),
    },
    {
      id: 'ntf-1002',
      title: 'سفارش‌های شما منتظر بررسی است',
      description: 'چند سفارش در وضعیت آماده‌سازی دارید؛ جزئیات را ببینید.',
      link: '/account/orders',
      icon: 'i-tabler-package',
      audienceType: 'group',
      audienceGroup: 'has_orders',
      userIds: [],
      recipientCount: resolveAudienceUsers('group', 'has_orders', []).length,
      status: 'sent',
      createdAt: iso(10),
      sentAt: iso(10),
    },
    {
      id: 'ntf-1003',
      title: 'خوش آمدید به دیجی‌شاپ',
      description: 'برای اولین خرید کد WELCOME را امتحان کنید.',
      link: '/account',
      icon: 'i-tabler-heart',
      audienceType: 'group',
      audienceGroup: 'new_users',
      userIds: [],
      recipientCount: resolveAudienceUsers('group', 'new_users', []).length,
      status: 'sent',
      createdAt: iso(4),
      sentAt: iso(4),
    },
  ]
}

export function createCampaignId() {
  return `ntf-${Date.now().toString(36)}`
}
