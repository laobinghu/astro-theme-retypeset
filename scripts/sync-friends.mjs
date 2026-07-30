import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// Allow fetching from HTTPS endpoints with self-signed/invalid certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const API_URL = process.env.PUBLIC_API_URL || 'https://api.purefolia.dev'
const FRIENDS_PATH = path.resolve('src/data/friends.json')

async function main() {
  const url = `${API_URL}/api/friends-links`
  console.log(`🌐 Fetching friends from ${url}`)

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`API responded with ${response.status}`)
  }

  const data = await response.json()
  const friends = Array.isArray(data) ? data : data.data ?? data.friends ?? []
  const remoteLastUpdated = data.lastUpdated || null

  const published = friends
    .filter(f => f.is_published !== false)
    .map(f => ({
      name: f.name,
      url: f.url || f.link,
      avatar: f.avatar,
      description: f.description,
    }))

  if (published.length === 0) {
    console.log('⚠️  No published friends found from API, keeping local data')
    return
  }

  let existing = { friends: [], lastUpdated: null }
  try {
    existing = JSON.parse(fs.readFileSync(FRIENDS_PATH, 'utf8'))
  }
  catch {
    // file will be created
  }

  const existingMap = new Map(
    existing.friends.map(f => [f.url, f]),
  )

  for (const f of published) {
    existingMap.set(f.url, f)
  }

  const merged = {
    friends: [...existingMap.values()],
    lastUpdated: remoteLastUpdated || existing.lastUpdated || new Date().toISOString(),
  }

  const serialized = `${JSON.stringify(merged, null, 2)}\n`
  fs.writeFileSync(FRIENDS_PATH, serialized)

  console.log(`✅ Synced ${published.length} friends from API (total: ${merged.friends.length})`)
}

main().catch((error) => {
  console.warn(`⚠️ Friends sync skipped (${error.message}), using local data`)
})
