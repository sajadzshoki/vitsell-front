export function useAccountLogout() {
  const open = useState('account-logout-open', () => false)
  const { logout } = useShop()

  function requestLogout() {
    open.value = true
  }

  async function confirmLogout() {
    await logout()
    open.value = false
    navigateTo('/')
  }

  function cancelLogout() {
    open.value = false
  }

  return {
    open,
    requestLogout,
    confirmLogout,
    cancelLogout,
  }
}
