/** Shared CSV export helper for seller list modules */
export function downloadSellerCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
) {
  const escape = (value: string | number | boolean | null | undefined) => {
    const raw = value == null ? '' : String(value)
    if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`
    return raw
  }
  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
