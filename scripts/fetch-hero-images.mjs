// 拉取官方英雄形象到 public/heroes/{官方数字id}.jpg（幂等：已存在则跳过，--force 可重拉）。
//
// 素材来源：王者荣耀官网英雄形象小图
//   https://game.gtimg.cn/images/yxzj/img201606/heroimg/{官方数字id}/{官方数字id}.jpg
//   规格 100×100 JPEG，全量 133 张约 2~3 MB。
// 版权归腾讯所有，仅本地/个人使用；图片不入库（public/heroes/ 已在 .gitignore 中）。
//
// 用法：pnpm heroes [--force]
import { Buffer } from 'node:buffer'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'heroes')
const HEROES_TS = join(ROOT, 'app', 'constants', 'heroes.ts')
const CONCURRENCY = 6

const force = process.argv.includes('--force')
const imageUrl = id => `https://game.gtimg.cn/images/yxzj/img201606/heroimg/${id}/${id}.jpg`

function readHeroes() {
  const source = readFileSync(HEROES_TS, 'utf8')
  const entries = [...source.matchAll(/officialId: (\d+), name: '([^']+)'/g)]
    .map(match => ({ officialId: Number(match[1]), name: match[2] }))

  // 正则依赖字段同行相邻，格式一变就会静默漏抓，这里按对象条目数交叉校验一次
  const objectCount = (source.match(/^\s*\{ id: '/gm) ?? []).length
  if (entries.length !== objectCount)
    console.warn(`警告：从 heroes.ts 解析到 ${entries.length} 位英雄，但文件里有 ${objectCount} 条对象条目，可能有条目格式不同而未被解析。`)

  return entries
}

/** 只认真实图片字节，避免把 HTTP 200 的错误页写成坏文件后被幂等逻辑永久跳过 */
function isImage(buffer) {
  const jpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
  const png = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47
  return jpeg || png
}

async function fetchOne(hero) {
  const file = join(OUT_DIR, `${hero.officialId}.jpg`)
  if (!force && existsSync(file) && statSync(file).size > 0)
    return { skipped: true, bytes: 0 }

  const response = await fetch(imageUrl(hero.officialId), {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://pvp.qq.com/' },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok)
    throw new Error(`HTTP ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  if (!isImage(buffer))
    throw new Error(`返回的不是图片（${buffer.length} 字节）`)

  writeFileSync(file, buffer)
  return { skipped: false, bytes: buffer.length }
}

async function run() {
  const heroes = readHeroes()
  if (heroes.length === 0) {
    console.error('未能从 app/constants/heroes.ts 解析出英雄，脚本中止。')
    process.exit(1)
  }

  mkdirSync(OUT_DIR, { recursive: true })

  const queue = [...heroes]
  const failures = []
  let fetched = 0
  let skipped = 0
  let bytes = 0

  async function worker() {
    while (queue.length > 0) {
      const hero = queue.shift()
      try {
        const result = await fetchOne(hero)
        if (result.skipped) {
          skipped += 1
        }
        else {
          fetched += 1
          bytes += result.bytes
        }
      }
      catch (error) {
        failures.push({ hero, message: error instanceof Error ? error.message : String(error) })
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  console.log(`英雄形象：新下载 ${fetched} 张、跳过 ${skipped} 张、失败 ${failures.length} 张（共 ${heroes.length} 位）`)
  if (fetched > 0)
    console.log(`本次写入约 ${(bytes / 1024 / 1024).toFixed(2)} MB 到 public/heroes/（该目录不入库）`)

  if (failures.length > 0) {
    console.warn('以下英雄形象未下载成功，应用会自动降级为占位样式，不影响使用：')
    for (const { hero, message } of failures)
      console.warn(`  - ${hero.name}（${hero.officialId}）：${message}`)
    console.warn('可稍后重跑 pnpm heroes 补齐（已存在的会跳过）。')
  }
}

run().catch((error) => {
  console.error('拉取英雄形象时出错：', error)
  process.exit(1)
})
