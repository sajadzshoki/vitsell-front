/**
 * Nuxt SPA generate (ssr:false) can emit HTML that still references Vite HMR
 * (`/_nuxt/@vite/client` and absolute Windows paths like
 * `/_nuxt/D:/.../entry.async.js`). Those break on any static host.
 *
 * Rewrite to the hashed production entry from the import map (`#entry`) and
 * inject global `entry.*.css` stylesheets (Vite does not put them in the JS
 * graph for this SPA shell, so without <link> the site has no CSS).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

async function walkHtml(dir) {
  /** @type {string[]} */
  const out = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '_nuxt' || entry.name === 'images') continue
      out.push(...(await walkHtml(full)))
    }
    else if (entry.name.endsWith('.html')) {
      out.push(full)
    }
  }
  return out
}

/**
 * @param {string} nuxtDir
 */
async function resolveEntryAssets(nuxtDir) {
  /** @type {{ entryJs: string | null, entryCss: string[] }} */
  const assets = { entryJs: null, entryCss: [] }
  try {
    const files = await readdir(nuxtDir)
    for (const name of files) {
      if (/^entry\.[^.]+\.css$/.test(name)) {
        assets.entryCss.push(`/_nuxt/${name}`)
      }
    }
    assets.entryCss.sort()
  }
  catch {
    /* _nuxt may be missing mid-build */
  }
  return assets
}

/**
 * @param {string} html
 * @param {{ entryJs: string | null, entryCss: string[] }} assets
 */
export function rewriteSpaHtml(html, assets = { entryJs: null, entryCss: [] }) {
  const broken =
    html.includes('@vite/client')
    || html.includes('entry.async.js')
    || /\/_nuxt\/[A-Za-z]:\//.test(html)

  let entry = assets.entryJs
  const mapMatch = html.match(/<script type="importmap">([\s\S]*?)<\/script>/)
  if (mapMatch?.[1]) {
    try {
      const map = JSON.parse(mapMatch[1])
      const fromMap = map?.imports?.['#entry']
      if (typeof fromMap === 'string' && fromMap.startsWith('/_nuxt/')) {
        entry = fromMap
      }
    }
    catch {
      /* keep assets.entryJs */
    }
  }

  if (broken && (!entry || typeof entry !== 'string' || !entry.startsWith('/_nuxt/'))) {
    throw new Error('SPA HTML is broken but no usable #entry importmap was found')
  }

  let next = html
  let changed = false

  if (broken) {
    next = next
      .replace(/<link[^>]*href="[^"]*entry\.async\.js"[^>]*>/g, '')
      .replace(/<script[^>]*src="[^"]*@vite\/client"[^>]*><\/script>/g, '')
      .replace(/<script[^>]*src="[^"]*entry\.async\.js"[^>]*><\/script>/g, '')
      .replace(/<link[^>]*href="\/_nuxt\/[A-Za-z]:[^"]*"[^>]*>/g, '')
      .replace(/<script[^>]*src="\/_nuxt\/[A-Za-z]:[^"]*"[^>]*><\/script>/g, '')
    changed = true
  }

  /** @type {string[]} */
  const cssTags = []
  /** @type {string[]} */
  const jsTags = []

  for (const href of assets.entryCss) {
    if (!next.includes(`href="${href}"`)) {
      cssTags.push(`<link rel="stylesheet" href="${href}" crossorigin>`)
    }
  }

  if (entry && !next.includes(`src="${entry}"`)) {
    jsTags.push(
      `<link rel="modulepreload" as="script" crossorigin href="${entry}">`,
      `<script type="module" src="${entry}" crossorigin></script>`,
    )
  }

  const inject = [...cssTags, ...jsTags]
  if (inject.length) {
    if (!next.includes('</head>')) {
      throw new Error('SPA HTML is missing </head>; cannot inject assets')
    }
    // Prefer CSS before existing module scripts to avoid unstyled flash.
    if (cssTags.length && next.includes('<script type="module"')) {
      next = next.replace(
        /<script type="module"/,
        `${cssTags.join('')}<script type="module"`,
      )
      if (jsTags.length) {
        next = next.replace('</head>', `${jsTags.join('')}</head>`)
      }
    }
    else {
      next = next.replace('</head>', `${inject.join('')}</head>`)
    }
    changed = true
  }

  return { html: next, changed }
}

/**
 * @param {string} publicDir
 */
export async function fixSpaHtmlInDir(publicDir) {
  const assets = await resolveEntryAssets(join(publicDir, '_nuxt'))
  const files = await walkHtml(publicDir)
  let fixed = 0
  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { html, changed } = rewriteSpaHtml(raw, assets)
    if (changed) {
      await writeFile(file, html, 'utf8')
      fixed++
    }
  }
  return {
    files: files.length,
    fixed,
    entryCss: assets.entryCss,
  }
}

const isMain = process.argv[1] && /fix-spa-html\.mjs$/.test(process.argv[1].replaceAll('\\', '/'))
if (isMain) {
  const dir = process.argv[2] || join(process.cwd(), '.output', 'public')
  const result = await fixSpaHtmlInDir(dir)
  console.log(
    `[fix-spa-html] scanned ${result.files} html, fixed ${result.fixed}, css=${result.entryCss.join(',') || '(none)'} → ${dir}`,
  )
}
