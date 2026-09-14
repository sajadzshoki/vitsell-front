/**
 * App version format: `{channel}.{major}.{minor}` e.g. `beta.0.1` or `1.0.1`.
 * Combined display: `{channel}.{frontMajor}.{frontMinor}.{backMajor}.{backMinor}`
 * → `beta.0.1` + `beta.0.1` = `beta.0.1.0.1`
 */

export type AppVersionParts = {
  channel: string
  major: string
  minor: string
}

export function parseAppVersion(version: string): AppVersionParts | null {
  const parts = String(version || '')
    .trim()
    .split('.')
    .map(p => p.trim())
    .filter(Boolean)

  if (parts.length < 3) return null
  return {
    channel: parts[0]!,
    major: parts[1]!,
    minor: parts[2]!,
  }
}

/** Shared channel (from front) + front pair + back pair. */
export function combineAppVersions(frontVersion: string, backVersion: string): string {
  const front = parseAppVersion(frontVersion)
  const back = parseAppVersion(backVersion)
  if (!front || !back) {
    return [frontVersion, backVersion].filter(Boolean).join(' / ') || '—'
  }
  return `${front.channel}.${front.major}.${front.minor}.${back.major}.${back.minor}`
}
