module.exports = {
    apps: [
        {
            name: 'nextjs-app',      // 应用名称
            script: 'pnpm',           // 执行命令
            args: 'start',          // 命令参数
            instances: 1,           // 实例数量
            autorestart: true,      // 自动重启
            watch: false,           // 监听文件变化
            max_memory_restart: '1G', // 内存超过1G重启
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
}