import type { AccountProfile } from '~/data/account'
import { getAuthCookieName } from '~/composables/fetch'

export type AuthVerifyResult = {
  token: string
  profile: AccountProfile
}

export function useAuth() {
  const { isAdminApp } = useAppMode()
  const token = useCookie<string | null>(getAuthCookieName(), {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

  async function checkPhone(phone: string) {
    const path = isAdminApp ? '/auth/admin/check' : '/auth/check'
    return usePost<{ hasPassword: boolean, isAdmin?: boolean }>(
      path,
      { phone },
      { headers: { 'no-error': true } },
    )
  }

  async function requestOtp(phone: string) {
    return usePost<{ message: string, expiresIn: number, devCode?: string }>(
      '/auth/otp/request',
      { phone },
      { headers: { 'no-error': true } },
    )
  }

  async function verifyOtp(phone: string, code: string) {
    return usePost<AuthVerifyResult>(
      '/auth/otp/verify',
      { phone, code },
      { headers: { 'no-error': true } },
    )
  }

  async function loginWithPassword(phone: string, password: string) {
    const path = isAdminApp ? '/auth/admin/login' : '/auth/login'
    return usePost<AuthVerifyResult>(
      path,
      { phone, password },
      { headers: { 'no-error': true } },
    )
  }

  async function resetPassword(payload: {
    phone: string
    code: string
    password: string
    passwordConfirmation: string
  }) {
    return usePost<AuthVerifyResult & { message?: string }>(
      '/auth/password/reset',
      payload,
      { headers: { 'no-error': true } },
    )
  }

  async function fetchMe() {
    return useGet<AccountProfile>('/auth/me', {
      headers: { 'no-error': true },
    })
  }

  async function logoutRemote() {
    if (!token.value) return { result: true }
    return usePost<{ message: string }>(
      '/auth/logout',
      {},
      { headers: { 'no-error': true } },
    )
  }

  function setToken(value: string | null) {
    token.value = value
  }

  return {
    token,
    checkPhone,
    requestOtp,
    verifyOtp,
    loginWithPassword,
    resetPassword,
    fetchMe,
    logoutRemote,
    setToken,
  }
}
