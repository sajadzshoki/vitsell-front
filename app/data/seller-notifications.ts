export type SellerNotificationAudienceType = 'all' | 'group' | 'users'

export type SellerNotificationAudienceGroup =
  | 'all_customers'
  | 'has_orders'
  | 'new_users'
  | 'inactive'

export type SellerNotificationStatus =
  | 'draft'
  | 'scheduled'
  | 'sent'
  | 'failed'
  | 'cancelled'

export type SellerNotificationType =
  | 'promotional'
  | 'order'
  | 'system'
  | 'inventory'
  | 'marketing'
  | 'announcement'

export type SellerNotificationRelatedEntity = {
  type: string
  id: string
}

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
  type: SellerNotificationType
  audienceType: SellerNotificationAudienceType
  audienceGroup: SellerNotificationAudienceGroup | null
  userIds: number[]
  recipientCount: number
  status: SellerNotificationStatus
  scheduledAt: string | null
  image: string | null
  relatedEntity: SellerNotificationRelatedEntity | null
  createdAt: string
  sentAt: string | null
}

export type SellerNotificationFormValues = {
  title: string
  description: string
  link: string
  icon: string
  type: SellerNotificationType
  audienceType: SellerNotificationAudienceType
  audienceGroup: SellerNotificationAudienceGroup
  userIds: number[]
  scheduledAt: string
  image: string
  relatedEntityType: string
  relatedEntityId: string
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

export const sellerNotificationStatusMeta: Record<
  SellerNotificationStatus,
  { label: string, color: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info' }
> = {
  draft: { label: 'پیش‌نویس', color: 'neutral' },
  scheduled: { label: 'زمان‌بندی‌شده', color: 'info' },
  sent: { label: 'ارسال‌شده', color: 'success' },
  failed: { label: 'ناموفق', color: 'error' },
  cancelled: { label: 'لغو شده', color: 'error' },
}

export const sellerNotificationTypeMeta: Record<
  SellerNotificationType,
  { label: string }
> = {
  promotional: { label: 'پروموشنال' },
  order: { label: 'سفارش' },
  system: { label: 'سیستم' },
  inventory: { label: 'موجودی' },
  marketing: { label: 'بازاریابی' },
  announcement: { label: 'اطلاعیه' },
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

function normalizeStatus(raw?: string): SellerNotificationStatus {
  if (raw === 'draft' || raw === 'scheduled' || raw === 'failed' || raw === 'cancelled') return raw
  return 'sent'
}

function normalizeType(raw?: string): SellerNotificationType {
  if (
    raw === 'order'
    || raw === 'system'
    || raw === 'inventory'
    || raw === 'marketing'
    || raw === 'announcement'
  ) {
    return raw
  }
  return 'promotional'
}

export function emptyNotificationForm(): SellerNotificationFormValues {
  return {
    title: '',
    description: '',
    link: '',
    icon: 'bell',
    type: 'promotional',
    audienceType: 'all',
    audienceGroup: 'all_customers',
    userIds: [],
    scheduledAt: '',
    image: '',
    relatedEntityType: '',
    relatedEntityId: '',
  }
}

/** Resolve users for local preview (users mode). Prefer API preview for groups/all. */
export function resolveAudienceUsers(
  audienceType: SellerNotificationAudienceType,
  audienceGroup: SellerNotificationAudienceGroup | null,
  userIds: number[],
  pool: SellerMockUser[] = sellerMockUsers,
): SellerMockUser[] {
  if (audienceType === 'all') {
    return [...pool]
  }
  if (audienceType === 'users') {
    const set = new Set(userIds)
    return pool.filter(u => set.has(u.id))
  }
  const group = audienceGroup ?? 'all_customers'
  if (group === 'all_customers') return [...pool]
  return pool.filter(u => u.groupHints.includes(group))
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

export function toNotificationCampaign(
  raw: Partial<SellerNotificationCampaign> & { id: string, title: string },
): SellerNotificationCampaign {
  const related = raw.relatedEntity
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? '',
    link: raw.link ?? null,
    icon: raw.icon || 'i-tabler-bell',
    type: normalizeType(raw.type),
    audienceType: raw.audienceType ?? 'all',
    audienceGroup: raw.audienceGroup ?? null,
    userIds: Array.isArray(raw.userIds) ? raw.userIds.map(Number) : [],
    recipientCount: Number(raw.recipientCount ?? 0),
    status: normalizeStatus(raw.status),
    scheduledAt: raw.scheduledAt ?? null,
    image: raw.image ?? null,
    relatedEntity: related?.type && related?.id
      ? { type: String(related.type), id: String(related.id) }
      : null,
    createdAt: raw.createdAt || new Date().toISOString(),
    sentAt: raw.sentAt ?? null,
  }
}

export function createCampaignId() {
  return `ntf-${Date.now().toString(36)}`
}
