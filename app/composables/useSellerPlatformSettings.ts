import {
  defaultPlatformSettings,
  type SellerPlatformSettings,
} from '~/data/seller-platform-settings'

export function useSellerPlatformSettings() {
  const settings = useState<SellerPlatformSettings>(
    'seller-platform-settings',
    () => ({ ...defaultPlatformSettings }),
  )
  const loaded = useState('seller-platform-settings-loaded', () => false)

  function ensureLoaded() {
    loaded.value = true
    return settings.value
  }

  function updateSettings(patch: Partial<SellerPlatformSettings>, actor?: { id: string, name: string }) {
    ensureLoaded()
    const prev = { ...settings.value }
    settings.value = { ...settings.value, ...patch }
    if (actor) {
      const { appendLog } = useSellerAudit()
      appendLog({
        actorId: actor.id,
        actorName: actor.name,
        action: 'update',
        entity: 'settings',
        entityId: 'platform',
        summary: 'تنظیمات پلتفرم به‌روزرسانی شد',
        previousValue: JSON.stringify(prev).slice(0, 200),
        newValue: JSON.stringify(settings.value).slice(0, 200),
      })
    }
    return { ok: true as const, settings: settings.value }
  }

  function resetToDefaults() {
    settings.value = { ...defaultPlatformSettings }
    return settings.value
  }

  return {
    settings,
    loaded,
    ensureLoaded,
    updateSettings,
    resetToDefaults,
  }
}
