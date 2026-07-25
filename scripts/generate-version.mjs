import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

try {
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

  const versionPath = path.resolve('src/version.json')
  let existingVersion = null
  try {
    existingVersion = JSON.parse(fs.readFileSync(versionPath, 'utf8'))
  }
  catch {
    // A missing or malformed version file is regenerated below.
  }

  const versionInfo = existingVersion?.commitHash === commitHash
    ? existingVersion
    : { commitHash, buildTime: new Date().toISOString() }
  const serialized = `${JSON.stringify(versionInfo, null, 2)}\n`
  const current = fs.existsSync(versionPath) ? fs.readFileSync(versionPath, 'utf8') : ''
  if (current !== serialized) {
    fs.writeFileSync(versionPath, serialized)
  }

  console.log('✅ Version info generated:', commitHash)
}
catch (error) {
  console.error('❌ Failed to generate version info:', error.message)
  process.exitCode = 1
}
