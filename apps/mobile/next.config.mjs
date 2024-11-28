/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export',
    transpilePackages: ['antd-mobile'],
    rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:8088/api/:path*'
            },
            {
                source: '/getuserinfo',
                destination: 'http://127.0.0.1:8088/getuserinfo'
            }
        ]
    }
};

export default nextConfig;
