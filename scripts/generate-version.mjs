import { execSync } from 'node:child_process'
// scripts/generate-version.js
import fs from 'node:fs'

try {
  // 获取当前 Git 提交的短哈希（7位字符）
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

  // 创建版本信息对象
  const versionInfo = {
    commitHash,
    buildTime: new Date().toISOString(),
  }

  // 将版本信息写入 src/version.json
  fs.writeFileSync(
    './src/version.json',
    JSON.stringify(versionInfo, null, 2),
  )

  console.log('✅ Version info generated:', commitHash)
}
catch (error) {
  console.error('❌ Failed to generate version info:', error.message)
  // 创建默认版本信息（构建失败时使用）
  fs.writeFileSync(
    './src/version.json',
    JSON.stringify({ commitHash: 'unknown', buildTime: new Date().toISOString() }),
  )
}
