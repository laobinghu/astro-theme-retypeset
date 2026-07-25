import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const distDir = path.resolve('dist')
const configFile = path.resolve('src/config.ts')

async function exists(relativePath) {
  try {
    await fs.access(path.join(distDir, relativePath))
    return true
  }
  catch {
    return false
  }
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    }
    else {
      files.push(fullPath)
    }
  }
  return files
}

async function main() {
  const config = await fs.readFile(configFile, 'utf8')
  const baseUrl = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || config.match(/\burl:\s*['"]([^'"]+)['"]/)?.[1]
  const required = ['index.html', '404.html', 'sitemap-index.xml', 'friends/index.html', 'about/index.html']
  const missing = []
  for (const file of required) {
    if (!await exists(file)) {
      missing.push(file)
    }
  }
  const files = await walk(distDir)
  const relativeFiles = new Set(files.map(file => path.relative(distDir, file).replace(/\\/g, '/')))
  if (files.some(file => path.relative(distDir, file).split(path.sep).includes('.prerender'))) {
    throw new Error('dist contains the temporary .prerender directory')
  }
  if (missing.length) {
    throw new Error(`Missing required build artifacts: ${missing.join(', ')}`)
  }

  const htmlFiles = files.filter(file => file.endsWith('.html'))
  const missingReferences = new Set()
  for (const file of htmlFiles) {
    const html = await fs.readFile(file, 'utf8')
    const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map(match => match[1])
    for (const reference of references) {
      if (/^(?:https?:|data:|mailto:|tel:|#|javascript:|\/\/)/i.test(reference)) {
        continue
      }
      const pathname = new URL(reference, `${baseUrl || 'https://localhost'}/`).pathname.replace(/^\//, '')
      const candidates = [pathname, pathname.endsWith('/') ? `${pathname}index.html` : pathname]
      if (!candidates.some(candidate => relativeFiles.has(candidate))) {
        missingReferences.add(reference)
      }
    }
  }
  if (missingReferences.size) {
    throw new Error(`HTML references missing local assets: ${[...missingReferences].slice(0, 8).join(', ')}`)
  }
  const urlsFile = await fs.readFile('urls.txt', 'utf8')
  const urls = urlsFile.split(/\r?\n/).filter(Boolean)
  const expectedOrigin = baseUrl ? new URL(baseUrl).origin : null
  for (const value of urls) {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`Invalid URL in urls.txt: ${value}`)
    }
    if (expectedOrigin && url.origin !== expectedOrigin) {
      throw new Error(`URL host does not match site configuration: ${value}`)
    }
  }
  console.log(`Validated ${htmlFiles.length} HTML files and ${files.length} dist files`)
}

main().catch((error) => {
  console.error(`Dist validation failed: ${error.message}`)
  process.exit(1)
})
