// 一键部署 / 更新发布：装依赖 → 拉英雄形象 → 构建 → pm2 启动或重载 → 保存进程列表。
// 每一步都是幂等的，重复执行等同于「更新发布」。
// 用法：pnpm run deploy        （换端口：PORT=3100 pnpm run deploy）
// 注意：pnpm 自带 `pnpm deploy` 子命令，务必写成 `pnpm run deploy`。
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const HEROES_DIR = join(ROOT, 'public', 'heroes')
const PORT = process.env.PORT || '3000'
const MIN_NODE_MAJOR = 20

function fail(message, hint) {
  console.error(`\n✗ ${message}`)
  if (hint)
    console.error(`  ${hint}`)
  process.exit(1)
}

/** 跑一条命令，失败即停并给出可读提示 */
function run(label, command) {
  console.log(`\n▶ ${label}`)
  const { status, error } = spawnSync(command, { cwd: ROOT, stdio: 'inherit', shell: true })
  if (error)
    fail(`${label} 无法执行：${error.message}`)
  if (status !== 0)
    fail(`${label} 失败（退出码 ${status}）`, '按上面的输出排查后重新执行 pnpm run deploy，每一步都可重复跑。')
}

function capture(command) {
  const { stdout, status } = spawnSync(command, { cwd: ROOT, encoding: 'utf8', shell: true })
  return status === 0 ? stdout.trim() : null
}

function checkEnvironment() {
  console.log('▶ 检查运行环境')
  const nodeVersion = capture('node -v')
  if (!nodeVersion)
    fail('未找到 node。', `请先安装 Node.js ${MIN_NODE_MAJOR} 或更高版本：https://nodejs.org`)
  const major = Number(nodeVersion.replace(/^v/, '').split('.')[0])
  if (!Number.isFinite(major) || major < MIN_NODE_MAJOR)
    fail(`Node.js 版本过低（当前 ${nodeVersion}）。`, `本项目需要 Node.js ${MIN_NODE_MAJOR}+。`)
  console.log(`  node ${nodeVersion}`)

  const pnpmVersion = capture('pnpm -v')
  if (!pnpmVersion)
    fail('未找到 pnpm。', '安装方式：corepack enable 或 npm i -g pnpm')
  console.log(`  pnpm ${pnpmVersion}`)

  const pm2Version = capture('pm2 -v')
  if (!pm2Version)
    fail('未找到 pm2。', '安装方式：npm i -g pm2')
  console.log(`  pm2 ${pm2Version}`)
}

function reportHeroes() {
  const count = existsSync(HEROES_DIR)
    ? readdirSync(HEROES_DIR).filter(file => file.endsWith('.jpg')).length
    : 0
  if (count === 0)
    console.warn('  ⚠ public/heroes 里没有图片，构建产物不会带英雄形象（应用会自动降级为占位）。')
  else
    console.log(`  英雄形象 ${count} 张`)
}

function main() {
  checkEnvironment()

  // 英雄形象不入库（.gitignore），必须在构建前拉取，否则产物里没有头像
  run('安装依赖', 'pnpm install --frozen-lockfile')
  run('拉取英雄形象', 'pnpm heroes')
  reportHeroes()
  run('生产构建', 'pnpm build')
  run('启动 / 重载 pm2 进程', `pm2 startOrReload ecosystem.config.cjs`)
  run('保存 pm2 进程列表', 'pm2 save')

  console.log('\n▶ 当前状态')
  spawnSync('pm2 status', { cwd: ROOT, stdio: 'inherit', shell: true })

  console.log(`\n✓ 部署完成，访问 http://localhost:${PORT}`)
  console.log('  局域网内其他设备请用本机 IP 访问；手机安装 PWA 需要 HTTPS，见 docs/deploy-pm2.md')
  console.log('  查看日志：pm2 logs wzry      停止服务：pm2 stop wzry')
}

main()
