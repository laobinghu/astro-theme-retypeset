import type { HTMLElement } from 'node-html-parser'
import fs from 'node:fs/promises'
import process from 'node:process'
import glob from 'fast-glob'
import { parse } from 'node-html-parser'

const distDir = 'dist'
const lqipMapPath = 'src/assets/lqip-map.json'

interface LqipMap {
  [path: string]: string
}

async function loadLqipMap(): Promise<LqipMap> {
  try {
    return JSON.parse(await fs.readFile(lqipMapPath, 'utf8')) as LqipMap
  }
  catch {
    console.warn(`LQIP map not found at ${lqipMapPath}; skipping placeholders`)
    return {}
  }
}

function processImage(img: HTMLElement, lqipMap: LqipMap): boolean {
  const src = img.getAttribute('src')
  const lqipValue = src ? lqipMap[src] : undefined
  if (!lqipValue || img.getAttribute('style')?.includes('--lqip:')) {
    return false
  }

  const currentStyle = img.getAttribute('style') ?? ''
  img.setAttribute('style', currentStyle ? `${currentStyle}; --lqip:#${lqipValue}` : `--lqip:#${lqipValue}`)
  return true
}

async function main() {
  const lqipMap = await loadLqipMap()
  const htmlFiles = await glob('**/*.html', { cwd: distDir })
  let appliedCount = 0

  for (const htmlFile of htmlFiles) {
    const filePath = `${distDir}/${htmlFile}`
    const root = parse(await fs.readFile(filePath, 'utf8'))
    let hasChanges = false
    for (const img of root.querySelectorAll('img')) {
      if (processImage(img, lqipMap)) {
        appliedCount++
        hasChanges = true
      }
    }
    if (hasChanges) {
      await fs.writeFile(filePath, root.toString(), 'utf8')
    }
  }

  console.log(`Applied LQIP styles to ${appliedCount} images (${htmlFiles.length} HTML files scanned)`)
}

main().catch((error) => {
  console.error('LQIP application failed:', error)
  process.exit(1)
})
