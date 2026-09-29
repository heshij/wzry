# 用 pm2 部署「王者抽签」

面向一台常驻机器（自己的电脑、内网服务器或云主机）的部署方式：构建一次，用 pm2 常驻运行，开机自启，更新时一条命令。

## 环境要求

| 依赖    | 版本         | 安装                                 |
| ------- | ------------ | ------------------------------------ |
| Node.js | 20 或更高    | https://nodejs.org                   |
| pnpm    | 9 或更高     | `corepack enable` 或 `npm i -g pnpm` |
| pm2     | 任意近期版本 | `npm i -g pm2`                       |

## 首次部署

```bash
git clone <仓库地址> wzry && cd wzry
pnpm install
pnpm run deploy
```

`pnpm run deploy` 会依次做完下面这些事（也可以按需手动分步执行）：

1. **检查环境**：node / pnpm / pm2 是否就位，node 是否 ≥ 20。
2. `pnpm install --frozen-lockfile`：按锁文件装依赖，保证和开发时一致。
3. `pnpm heroes`：拉取 133 张官方英雄形象到 `public/heroes/`。
   **这一步不能省**：图片不入库（`.gitignore` 忽略），跳过它构建出来的产物没有英雄头像，应用会退化成「首字占位」。
4. `pnpm build`：生产构建，产物在 `.output/`。
5. `pm2 startOrReload ecosystem.config.cjs`：首次是启动，之后是平滑重载。
6. `pm2 save`：把当前进程列表存下来，重启机器后 pm2 能恢复。
7. 打印 pm2 状态与访问地址。

> 注意写成 `pnpm run deploy`。`pnpm deploy` 是 pnpm 自带的另一个子命令，含义完全不同。

部署完成后访问 `http://localhost:3000`；局域网内其他设备用本机 IP（例如 `http://192.168.1.10:3000`）。

## 更新发布

```bash
git pull
pnpm run deploy
```

脚本每一步都是幂等的：依赖没变会跳过，已下载的图片会跳过（只补缺失的），pm2 走 `startOrReload` 平滑重载，服务中断只有重载那一瞬。

## 日常运维

```bash
pm2 status              # 进程状态、重启次数、内存占用
pm2 logs wzry           # 实时日志（配置里开了时间戳）
pm2 logs wzry --lines 200
pm2 restart wzry        # 重启
pm2 stop wzry           # 停止
pm2 delete wzry         # 从 pm2 列表移除（配置文件仍在，可再 deploy 回来）
```

**开机自启**（Linux / macOS）：

```bash
pm2 startup             # 按提示执行它打印出来的那条 sudo 命令
pm2 save                # 保存当前进程列表
```

Windows 上 pm2 的开机自启需要额外装 `pm2-windows-startup`，或者更简单：把 `pnpm run deploy` 写进「任务计划程序」的登录触发任务。

## 端口与反向代理

默认监听 `0.0.0.0:3000`。换端口两种方式：

```bash
# 临时换：本次部署生效
PORT=3100 pnpm run deploy

# 长期换：改 ecosystem.config.cjs 里 env.PORT 的默认值
```

用反向代理把域名和 HTTPS 接进来（**手机安装 PWA 的前提**）：

Caddy（自动申请并续期证书，最省事）：

```
your.domain.com {
  reverse_proxy 127.0.0.1:3000
}
```

Nginx：

```nginx
server {
  listen 443 ssl;
  server_name your.domain.com;
  ssl_certificate     /path/fullchain.pem;
  ssl_certificate_key /path/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## PWA 与 HTTPS

应用本体是纯前端，但 **service worker（离线能力）和「添加到主屏幕」只在安全上下文里可用**：`https://` 或 `localhost`。用局域网 IP 直接访问（`http://192.168.x.x:3000`）时页面能用，但装不了 PWA、也没有离线缓存。要给局域网设备用，请按上面的反代方案配一个 HTTPS 域名。

## 常见问题

**所有英雄都是文字占位、没有头像**
部署前没跑 `pnpm heroes`，或者构建产物是在缺图片时生成的。执行 `pnpm heroes`（会自动补缺失的）后重新 `pnpm run deploy`。

**启动报端口被占用（`EADDRINUSE`）**
换一个端口：`PORT=3100 pnpm run deploy`。本机 3000 常被别的服务占用，可用 `netstat -ano | findstr :3000`（Windows）或 `lsof -i :3000`（macOS/Linux）看是谁。

**`pnpm deploy` 跑起来不是这个脚本**
`pnpm deploy` 是 pnpm 的内置命令。请用 `pnpm run deploy`。

**刷新子页面或直接打开 `/hero` 会不会 404**
不会。服务端是 Nuxt 的 Nitro 服务，任意路径都会返回应用外壳，再由前端路由接管。前提是按本文方式启动（别把 `.output/public` 单独丢给不认识的静态服务器，那种情况请改用 `pnpm generate` 的静态产物）。

**改完代码后页面没变**
service worker 在后台更新，浏览器下次进入会拿到新版本；想立即确认可以硬刷新（Ctrl/Cmd + Shift + R）或清一次站点数据。
