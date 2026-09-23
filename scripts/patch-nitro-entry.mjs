import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const replacements = [
  ['"file:///_entry.js"', 'import.meta.url'],
  ['{url:"import.meta.url",env:process.env}', '{url:import.meta.url,env:process.env}'],
]
const serverDir = join(process.cwd(), '.output', 'server')
const stack = [serverDir]
let patched = 0

while (stack.length) {
  const dir = stack.pop()
  let entries = []
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    continue
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      stack.push(full)
      continue
    }
    if (!entry.name.endsWith('.mjs')) continue
    const source = await readFile(full, 'utf8')
    let next = source
    for (const [from, to] of replacements) {
      if (next.includes(from)) next = next.replaceAll(from, to)
    }
    if (next === source) continue
    await writeFile(full, next)
    patched += 1
    console.log(`[ssr-entry] patched ${full}`)
  }
}

if (!patched) console.log('[ssr-entry] nothing to patch')
