/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    allowedDevOrigins: [
        '10.0.0.230',
        'localhost',
    ],
    images: {
        unoptimized: true,
    },
    experimental: {
        optimizeCss: true,
    },
};

module.exports = nextConfig;
