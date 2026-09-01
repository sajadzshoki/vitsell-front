import {
  parseCsvText,
  sellerImportEntityMeta,
  validateImport,
  type SellerImportEntity,
  type SellerImportHistoryItem,
  type SellerImportPreview,
} from '~/data/seller-import'
import { downloadSellerCsv } from '~/data/seller-export'

export function useSellerImport() {
  const history = useState<SellerImportHistoryItem[]>('seller-import-history', () => [])
  const lastPreview = useState<SellerImportPreview | null>('seller-import-preview', () => null)

  function downloadTemplate(entity: SellerImportEntity) {
    const headers = sellerImportEntityMeta[entity].templateHeaders
    downloadSellerCsv(`template-${entity}.csv`, headers, [headers.map(() => '')])
  }

  function previewFromText(entity: SellerImportEntity, text: string) {
    const { headers, rows } = parseCsvText(text)
    const preview = validateImport(entity, headers, rows)
    lastPreview.value = preview
    return preview
  }

  function confirmImport(actor: { id: string, name: string }) {
    const preview = lastPreview.value
    if (!preview) return { ok: false as const, error: 'پیش‌نمایشی وجود ندارد' }
    if (preview.errors.some(e => e.row === 0)) {
      return { ok: false as const, error: 'ستون‌های الزامی ناقص است' }
    }
    // FE-only: record history; do not invent DB writes for products API
    // Valid rows are acknowledged as session overlay markers
    const item: SellerImportHistoryItem = {
      id: `imp-${Date.now()}`,
      entity: preview.entity,
      actorName: actor.name,
      createdAt: new Date().toISOString(),
      totalRows: preview.rows.length,
      successRows: preview.validCount,
      failedRows: preview.invalidCount,
      status: preview.invalidCount === 0 ? 'completed' : preview.validCount === 0 ? 'failed' : 'partial',
    }
    history.value = [item, ...history.value]
    const { appendLog } = useSellerAudit()
    appendLog({
      actorId: actor.id,
      actorName: actor.name,
      action: 'create',
      entity: 'system',
      entityId: item.id,
      summary: `ورود داده ${sellerImportEntityMeta[preview.entity].label}: ${item.successRows}/${item.totalRows} موفق`,
      newValue: item.status,
    })
    return { ok: true as const, item }
  }

  return {
    history,
    lastPreview,
    downloadTemplate,
    previewFromText,
    confirmImport,
    sellerImportEntityMeta,
  }
}
