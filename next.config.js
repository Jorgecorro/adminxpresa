/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'api.xpresa.com.mx',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

module.exports = nextConfig;
