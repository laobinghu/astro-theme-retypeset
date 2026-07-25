import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import glob from 'fast-glob'
import sharp from 'sharp'

const distDir = 'dist'
const assetsDir = 'src/assets'
const lqipMapPath = 'src/assets/lqip-map.json'

interface LqipMap {
  [path: string]: string
}

function packColor(r: number, g: number, b: number, redBits: number, blueBits: number): number {
  const pr = Math.round((r / 255) * ((1 << redBits) - 1))
  const pg = Math.round((g / 255) * 15)
  const pb = Math.round((b / 255) * ((1 << blueBits) - 1))
  return (pr << 7) | (pg << 3) | pb
}

async function generateValue(imagePath: string): Promise<string> {
  const buffer = await sharp(imagePath).resize(3, 3, { fit: 'fill' }).removeAlpha().raw().toBuffer()
  const pixel = (index: number) => ({ r: buffer[index * 3], g: buffer[index * 3 + 1], b: buffer[index * 3 + 2] })
  const first = pixel(0)
  const center = pixel(4)
  const last = pixel(8)
  const combined = (BigInt(packColor(first.r, first.g, first.b, 4, 3)) << 21n)
    | (BigInt(packColor(center.r, center.g, center.b, 4, 3)) << 10n)
    | BigInt(packColor(last.r, last.g, last.b, 3, 3))
  return combined.toString(16).padStart(8, '0')
}

async function readMap(): Promise<LqipMap> {
  try {
    return JSON.parse(await fs.readFile(lqipMapPath, 'utf8')) as LqipMap
  }
  catch {
    return {}
  }
}

async function main() {
  await fs.mkdir(assetsDir, { recursive: true })
  const files = await glob('_astro/**/*.webp', { cwd: distDir, absolute: true })
  const existing = await readMap()
  const next: LqipMap = {}

  for (const filePath of files) {
    const webUrl = `/${path.relative(distDir, filePath).replace(/\\/g, '/')}`
    next[webUrl] = existing[webUrl] ?? await generateValue(filePath)
  }

  const serialized = `${JSON.stringify(next, null, 2)}\n`
  const current = await fs.readFile(lqipMapPath, 'utf8').catch(() => '')
  if (current !== serialized) {
    await fs.writeFile(lqipMapPath, serialized, 'utf8')
  }
  console.log(`LQIP map contains ${Object.keys(next).length} images`)
}

main().catch((error) => {
  console.error('LQIP generation failed:', error)
  process.exit(1)
})
