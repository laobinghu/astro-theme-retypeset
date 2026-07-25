const fs = require('node:fs/promises')
const path = require('node:path')
const process = require('node:process')

const DIST_DIR = path.resolve('dist')
const OUTPUT_FILE = path.resolve('urls.txt')
const CONFIG_FILE = path.resolve('src/config.ts')

async function getBaseUrl() {
  const configuredUrl = process.env.SITE_URL || process.env.PUBLIC_SITE_URL
    || (await fs.readFile(CONFIG_FILE, 'utf8')).match(/\burl:\s*['"]([^'"]+)['"]/)?.[1]
  if (!configuredUrl) {
    throw new Error(`No site URL found in ${CONFIG_FILE}`)
  }
  const url = new URL(configuredUrl)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`SITE_URL must use http or https: ${configuredUrl}`)
  }
  return url.toString().replace(/\/$/, '')
}

async function findHtmlFiles(directory, relative = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const relativePath = path.join(relative, entry.name)
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath, relativePath))
    }
    else if (entry.name.endsWith('.html')) {
      files.push(relativePath.replace(/\\/g, '/'))
    }
  }
  return files
}

async function main() {
  const baseUrl = await getBaseUrl()
  try {
    await fs.access(path.join(DIST_DIR, 'index.html'))
  }
  catch {
    throw new Error(`Missing ${path.join(DIST_DIR, 'index.html')}; run Astro build first`)
  }

  const htmlFiles = await findHtmlFiles(DIST_DIR)
  if (htmlFiles.length === 0) {
    throw new Error(`No HTML files found in ${DIST_DIR}`)
  }

  const urls = htmlFiles.map((file) => {
    const urlPath = `/${file}`.replace(/\/index\.html$/, '/')
    return new URL(urlPath, `${baseUrl}/`).toString()
  }).sort()
  await fs.writeFile(OUTPUT_FILE, `${urls.join('\n')}\n`, 'utf8')
  console.log(`Generated ${urls.length} URLs in ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error(`URL generation failed: ${error.message}`)
  process.exit(1)
})
