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
                source: '/anon/:path*',
                destination: 'http://127.0.0.1:8088/anon/:path*'
            },

        ]
    }
};

export default nextConfig;
