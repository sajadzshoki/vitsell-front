import {
  type SellerAuditEntity,
  type SellerAuditLog,
  type SellerAuditAction,
} from '~/data/seller-audit'

export type SellerAuditQuery = {
  q?: string
  action?: string
  entity?: string
  actorId?: string
  mode?: 'audit' | 'activity'
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
  all?: boolean
}

export type SellerAuditPage = {
  items: SellerAuditLog[]
  total: number
  page: number
  pageSize: number
  statusCounts: Record<string, number>
  actors: Array<{ id: string; name: string }>
}

function apiErrorMessage(error: any, fallback: string) {
  return (
    error?.data?.errors?.map((e: any) => e.message).filter(Boolean).join(' ، ')
    || error?.data?.message
    || error?.message
    || fallback
  )
}

function toLog(raw: any): SellerAuditLog {
  return {
    id: String(raw?.id || ''),
    actorId: String(raw?.actorId || ''),
    actorName: String(raw?.actorName || ''),
    action: (raw?.action || 'other') as SellerAuditAction,
    entity: (raw?.entity || 'system') as SellerAuditEntity,
    entityId: String(raw?.entityId || ''),
    summary: String(raw?.summary || ''),
    previousValue: raw?.previousValue == null ? null : String(raw.previousValue),
    newValue: raw?.newValue == null ? null : String(raw.newValue),
    createdAt: raw?.createdAt ? String(raw.createdAt) : new Date().toISOString(),
  }
}

export function useSellerAudit() {
  const logs = useState<SellerAuditLog[]>('seller-audit-logs', () => [])
  const listMeta = useState('seller-audit-meta', () => ({
    total: 0,
    page: 1,
    pageSize: 12,
    statusCounts: {
      all: 0,
      create: 0,
      update: 0,
      delete: 0,
      status_change: 0,
      login: 0,
      permission_change: 0,
      other: 0,
    } as Record<string, number>,
    actors: [] as Array<{ id: string; name: string }>,
  }))
  const seeded = useState('seller-audit-seeded', () => false)
  const pending = useState('seller-audit-pending', () => false)

  function upsertLocal(entry: SellerAuditLog) {
    const index = logs.value.findIndex(l => l.id === entry.id)
    if (index === -1) logs.value = [entry, ...logs.value]
    else {
      const copy = [...logs.value]
      copy[index] = entry
      logs.value = copy
    }
  }

  async function fetchList(query?: SellerAuditQuery) {
    pending.value = true
    try {
      const params: Record<string, string | number | boolean> = {}
      if (query?.q?.trim()) params.q = query.q.trim()
      if (query?.action && query.action !== 'all') params.action = query.action
      if (query?.entity && query.entity !== 'all') params.entity = query.entity
      if (query?.actorId && query.actorId !== 'all') params.actorId = query.actorId
      if (query?.mode) params.mode = query.mode
      if (query?.dateFrom) params.dateFrom = query.dateFrom
      if (query?.dateTo) params.dateTo = query.dateTo
      if (query?.all) {
        params.all = true
        params.pageSize = query.pageSize || 200
      }
      else {
        if (query?.page != null) params.page = query.page
        params.pageSize = query?.pageSize || 12
      }

      const { result, error } = await useGet<SellerAuditPage | SellerAuditLog[]>(
        '/seller/audit',
        { query: params, headers: { 'no-error': true }, server: false },
      )

      if (error || result == null) {
        return { ok: false as const, error: error ?? { message: 'audit-fetch-failed' } }
      }

      if (Array.isArray(result)) {
        logs.value = result.map(toLog)
        listMeta.value = {
          total: logs.value.length,
          page: 1,
          pageSize: logs.value.length,
          statusCounts: { all: logs.value.length },
          actors: [],
        }
      }
      else {
        logs.value = Array.isArray(result.items) ? result.items.map(toLog) : []
        listMeta.value = {
          total: Number(result.total) || logs.value.length,
          page: Number(result.page) || 1,
          pageSize: Number(result.pageSize) || 12,
          statusCounts: {
            all: Number(result.statusCounts?.all) || logs.value.length,
            create: Number(result.statusCounts?.create) || 0,
            update: Number(result.statusCounts?.update) || 0,
            delete: Number(result.statusCounts?.delete) || 0,
            status_change: Number(result.statusCounts?.status_change) || 0,
            login: Number(result.statusCounts?.login) || 0,
            permission_change: Number(result.statusCounts?.permission_change) || 0,
            other: Number(result.statusCounts?.other) || 0,
          },
          actors: Array.isArray(result.actors)
            ? result.actors.map(a => ({ id: String(a.id || ''), name: String(a.name || '') }))
            : [],
        }
      }
      seeded.value = true
      return { ok: true as const, error: null as null }
    }
    finally {
      pending.value = false
    }
  }

  async function ensureLoaded(options?: { force?: boolean }) {
    if (seeded.value && !options?.force) return logs.value
    await fetchList({ page: 1, pageSize: 50, all: true })
    return logs.value
  }

  async function appendLog(input: {
    actorId?: string
    actorName?: string
    action: SellerAuditAction
    entity: SellerAuditEntity
    entityId: string
    summary: string
    previousValue?: string | null
    newValue?: string | null
  }) {
    const { result, error } = await usePost<any>('/seller/audit', {
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      summary: input.summary,
      previousValue: input.previousValue ?? null,
      newValue: input.newValue ?? null,
    }, {
      headers: { 'no-error': true },
      server: false,
    })

    if (!error && result) {
      const entry = toLog(result)
      upsertLocal(entry)
      listMeta.value = {
        ...listMeta.value,
        total: (listMeta.value.total || 0) + 1,
        statusCounts: {
          ...listMeta.value.statusCounts,
          all: (listMeta.value.statusCounts.all || 0) + 1,
        },
      }
      return entry
    }

    // Optimistic local fallback if API unavailable
    const entry: SellerAuditLog = {
      id: `aud-local-${Date.now()}`,
      actorId: input.actorId || '',
      actorName: input.actorName || 'سیستم',
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      summary: input.summary,
      previousValue: input.previousValue ?? null,
      newValue: input.newValue ?? null,
      createdAt: new Date().toISOString(),
    }
    upsertLocal(entry)
    return entry
  }

  function recent(limit = 8) {
    return logs.value.slice(0, limit)
  }

  return {
    logs,
    listMeta,
    pending,
    fetchList,
    ensureLoaded,
    appendLog,
    recent,
    apiErrorMessage,
  }
}
