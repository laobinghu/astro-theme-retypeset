#!/usr/bin/env node
/**
 * 初始化友链 KV 数据
 *
 * 使用方法：
 * 1. 先部署 edge-functions/api/friends.js 到 EdgeOne Makers
 * 2. 获取你的 Edge Functions 域名
 * 3. 运行：node scripts/init-friends-kv.mjs https://your-domain
 *
 * 或者直接用 curl：
 * curl -X PUT https://your-domain/api/friends \
 *   -H "Content-Type: application/json" \
 *   -d @src/data/friends.json
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const domain = process.argv[2]

  if (!domain) {
    console.error('请提供 Edge Functions 域名')
    console.error('用法：node scripts/init-friends-kv.mjs https://your-domain')
    process.exit(1)
  }

  // 读取本地 friends.json
  const friendsPath = resolve(__dirname, '../src/data/friends.json')
  const friendsData = JSON.parse(readFileSync(friendsPath, 'utf-8'))

  console.log(`准备初始化 KV 数据...`)
  console.log(`域名: ${domain}`)
  console.log(`友链数量: ${friendsData.friends.length}`)

  try {
    const response = await fetch(`${domain}/api/friends`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friends: friendsData.friends }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ KV 数据初始化成功！')
      console.log(`当前友链数量: ${result.friends?.length || 0}`)
    }
    else {
      console.error('❌ 初始化失败:', result.error)
      process.exit(1)
    }
  }
  catch (e) {
    console.error('❌ 请求失败:', e.message)
    process.exit(1)
  }
}

main()
