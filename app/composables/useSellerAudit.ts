import {
  buildDefaultSellerAuditLogs,
  type SellerAuditEntity,
  type SellerAuditLog,
  type SellerAuditAction,
} from '~/data/seller-audit'

export function useSellerAudit() {
  const logs = useState<SellerAuditLog[]>('seller-audit-logs', () => [])
  const seeded = useState('seller-audit-seeded', () => false)

  function ensureLoaded() {
    if (!seeded.value) {
      logs.value = buildDefaultSellerAuditLogs()
      seeded.value = true
    }
    return logs.value
  }

  function appendLog(input: {
    actorId: string
    actorName: string
    action: SellerAuditAction
    entity: SellerAuditEntity
    entityId: string
    summary: string
    previousValue?: string | null
    newValue?: string | null
  }) {
    ensureLoaded()
    const entry: SellerAuditLog = {
      id: `aud-${Date.now()}`,
      createdAt: new Date().toISOString(),
      previousValue: input.previousValue ?? null,
      newValue: input.newValue ?? null,
      ...input,
    }
    logs.value = [entry, ...logs.value]
    return entry
  }

  function recent(limit = 8) {
    ensureLoaded()
    return logs.value.slice(0, limit)
  }

  return {
    logs,
    ensureLoaded,
    appendLog,
    recent,
  }
}
