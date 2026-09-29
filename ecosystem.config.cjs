// pm2 配置：pnpm run deploy 会用它启动或重载服务。
// 换端口：改下面的 PORT 默认值，或用 PORT=xxxx pnpm run deploy 临时指定。
const process = require('node:process')

module.exports = {
  apps: [
    {
      name: 'wzry',
      script: '.output/server/index.mjs',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: process.env.PORT || 3000,
      },
    },
  ],
}
