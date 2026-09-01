export type SellerCustomerStatus = 'active' | 'inactive' | 'blocked'

export type SellerCustomerAddress = {
  id: string
  title: string
  recipient: string
  phone: string
  province: string
  city: string
  address: string
  postalCode: string
  isDefault: boolean
}

export type SellerCustomer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: SellerCustomerStatus
  registeredAt: string
  lastActivityAt: string
  orderCount: number
  completedOrders: number
  cancelledOrders: number
  returnedOrders: number
  totalSpent: number
  refundTotal: number
  reviewCount: number
  questionCount: number
  wishlistCount: number
  addresses: SellerCustomerAddress[]
}

export type SellerCustomerFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: SellerCustomerStatus
}

export const sellerCustomerStatusMeta: Record<SellerCustomerStatus, { label: string, color: 'success' | 'neutral' | 'error' }> = {
  active: { label: 'فعال', color: 'success' },
  inactive: { label: 'غیرفعال', color: 'neutral' },
  blocked: { label: 'مسدود', color: 'error' },
}

export function customerFullName(c: Pick<SellerCustomer, 'firstName' | 'lastName'>) {
  return `${c.firstName} ${c.lastName}`.trim()
}

export function emptyCustomerForm(): SellerCustomerFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'active',
  }
}

export function toCustomerForm(c: SellerCustomer): SellerCustomerFormValues {
  return {
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    status: c.status,
  }
}

export function buildDefaultCustomers(): SellerCustomer[] {
  const now = Date.now()
  return [
    {
      id: 'cust-1',
      firstName: 'علی',
      lastName: 'محمدی',
      email: 'ali.m@example.com',
      phone: '09121234567',
      status: 'active',
      registeredAt: new Date(now - 120 * 86400_000).toISOString(),
      lastActivityAt: new Date(now - 2 * 86400_000).toISOString(),
      orderCount: 8,
      completedOrders: 6,
      cancelledOrders: 1,
      returnedOrders: 1,
      totalSpent: 128_000_000,
      refundTotal: 4_200_000,
      reviewCount: 3,
      questionCount: 1,
      wishlistCount: 5,
      addresses: [
        {
          id: 'addr-1',
          title: 'منزل',
          recipient: 'علی محمدی',
          phone: '09121234567',
          province: 'تهران',
          city: 'تهران',
          address: 'ولیعصر، پلاک ۱۲',
          postalCode: '1234567890',
          isDefault: true,
        },
      ],
    },
    {
      id: 'cust-2',
      firstName: 'سارا',
      lastName: 'احمدی',
      email: 'sara.a@example.com',
      phone: '09129876543',
      status: 'active',
      registeredAt: new Date(now - 60 * 86400_000).toISOString(),
      lastActivityAt: new Date(now - 1 * 86400_000).toISOString(),
      orderCount: 3,
      completedOrders: 3,
      cancelledOrders: 0,
      returnedOrders: 0,
      totalSpent: 45_500_000,
      refundTotal: 0,
      reviewCount: 1,
      questionCount: 2,
      wishlistCount: 2,
      addresses: [],
    },
    {
      id: 'cust-3',
      firstName: 'رضا',
      lastName: 'کریمی',
      email: 'reza.k@example.com',
      phone: '09351234567',
      status: 'blocked',
      registeredAt: new Date(now - 200 * 86400_000).toISOString(),
      lastActivityAt: new Date(now - 40 * 86400_000).toISOString(),
      orderCount: 12,
      completedOrders: 9,
      cancelledOrders: 2,
      returnedOrders: 2,
      totalSpent: 210_000_000,
      refundTotal: 18_000_000,
      reviewCount: 0,
      questionCount: 0,
      wishlistCount: 0,
      addresses: [],
    },
    {
      id: 'cust-4',
      firstName: 'مریم',
      lastName: 'حسینی',
      email: 'maryam.h@example.com',
      phone: '09121112233',
      status: 'inactive',
      registeredAt: new Date(now - 300 * 86400_000).toISOString(),
      lastActivityAt: new Date(now - 90 * 86400_000).toISOString(),
      orderCount: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      returnedOrders: 0,
      totalSpent: 0,
      refundTotal: 0,
      reviewCount: 0,
      questionCount: 0,
      wishlistCount: 1,
      addresses: [],
    },
  ]
}
