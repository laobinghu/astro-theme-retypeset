/**
 * 生成全站页面链接用于刷新 CDN 缓存
 *
 * 使用方法：
 * 1. 先构建项目：npm run build
 * 2. 运行此脚本：node scripts/generate-urls.js
 * 3. 查看生成的 urls.txt 文件
 */

const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)

// 配置项
const BASE_URL = 'https://eaverse.top' // 网站基础 URL
const DIST_DIR = path.join(__dirname, '..', 'dist') // 构建输出目录
const OUTPUT_FILE = path.join(__dirname, '..', 'urls.txt') // 输出文件路径

/**
 * 递归扫描目录，查找所有 HTML 文件
 * @param {string} dir 目录路径
 * @param {string} baseDir 基础目录路径，用于计算相对路径
 * @returns {Promise<string[]>} HTML 文件的相对路径列表
 */
async function scanDirectory(dir, baseDir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    const filesPromises = entries.map(async (entry) => {
      try {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          return scanDirectory(fullPath, baseDir)
        }
        else if (entry.name.endsWith('.html')) {
          // 计算相对于 baseDir 的路径
          return fullPath.replace(baseDir, '').replace(/\\/g, '/')
        }
        return []
      }
      catch (error) {
        console.warn(`警告: 处理文件 ${entry.name} 时出错:`, error.message)
        return []
      }
    })

    const files = await Promise.all(filesPromises)
    return files.flat()
  }
  catch (error) {
    console.error(`扫描目录 ${dir} 时出错:`, error.message)
    return []
  }
}

/**
 * 生成完整的 URL 列表
 * @param {string[]} relativePaths HTML 文件的相对路径列表
 * @returns {string[]} 完整的 URL 列表
 */
function generateUrls(relativePaths) {
  return relativePaths.map((relativePath) => {
    // 确保路径以 / 开头
    let urlPath = relativePath
    if (!urlPath.startsWith('/')) {
      urlPath = `/${urlPath}`
    }

    // 将 /index.html 转换为 /
    urlPath = urlPath.replace(/\/index\.html$/, '/')

    // 处理其他 HTML 文件，移除 .html 后缀（可选，取决于网站配置）
    // urlPath = urlPath.replace(/\.html$/, '');

    return `${BASE_URL}${urlPath}`
  })
}

/**
 * 检查目录是否存在
 * @param {string} dir 目录路径
 * @returns {Promise<boolean>} 目录是否存在
 */
async function directoryExists(dir) {
  try {
    const stats = await stat(dir)
    return stats.isDirectory()
  }
  catch (error) {
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('开始检查构建目录...')

    // 检查构建目录是否存在
    if (!(await directoryExists(DIST_DIR))) {
      console.error(`构建目录 ${DIST_DIR} 不存在，请先运行 npm run build`)
      process.exit(1)
    }

    console.log('开始扫描构建目录...')
    const htmlFiles = await scanDirectory(DIST_DIR, DIST_DIR)

    if (htmlFiles.length === 0) {
      console.warn('警告: 未找到任何 HTML 文件，请确认构建是否成功')
      process.exit(0)
    }

    console.log(`找到 ${htmlFiles.length} 个 HTML 文件`)

    const urls = generateUrls(htmlFiles)

    // 将 URL 列表写入文件
    await writeFile(OUTPUT_FILE, urls.join('\n'), 'utf8')
    console.log(`URL 列表已保存到 ${OUTPUT_FILE}`)
    console.log(`共生成 ${urls.length} 个 URL`)
  }
  catch (error) {
    console.error('生成 URL 列表时出错:', error.message)
    console.error('详细错误信息:', error)
    process.exit(1)
  }
}

main()
