import type { AccountProfile } from '~/data/account'

export type AuthVerifyResult = {
  token: string
  profile: AccountProfile
}

export function useAuth() {
  const token = useCookie<string | null>('token', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

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
    requestOtp,
    verifyOtp,
    fetchMe,
    logoutRemote,
    setToken,
  }
}
