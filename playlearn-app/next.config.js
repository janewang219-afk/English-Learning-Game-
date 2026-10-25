/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 静态资源 CDN 前缀（生产环境通过 Vercel Edge Network 分发）
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || '',
  images: {
    formats: ['image/webp'],
    // 配图来源于 CDN / 对象存储
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    // 适配 Vercel Edge Functions
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;
