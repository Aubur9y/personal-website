/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 环境变量配置
  env: {
    MONGODB_URI: process.env.MONGODB_URI || '',
    MONGODB_DB: process.env.MONGODB_DB || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    GITHUB_USERNAME: process.env.GITHUB_USERNAME || '',
    GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN || '',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com',
  },
  
  // 图片配置
  images: {
    domains: ['localhost', 'your-domain.com'],
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 禁用字体优化
  optimizeFonts: false,
  poweredByHeader: false,
  
  // 修改 webpack 配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 在客户端构建中忽略这些模块
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
        'timers/promises': false,
        'mongodb-client-encryption': false,
        'aws4': false,
        'util': false,
        'crypto': false,
        'stream': false,
        'http': false,
        'https': false,
        'zlib': false,
        'os': false,
        'path': false,
        'socks': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
      };

      // 忽略这些原生模块
      config.externals = [...(config.externals || []), {
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
        'kerberos': 'commonjs kerberos',
        'snappy': 'commonjs snappy',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        'aws4': 'commonjs aws4',
        'socks': 'commonjs socks'
      }];
    }
    return config;
  },

  // Vercel 特定配置
  output: 'standalone',
  experimental: {
    // MongoDB 支持
    serverComponentsExternalPackages: ['mongodb'],
    esmExternals: 'loose',
  },

  // 构建配置
  distDir: '.next',
  generateBuildId: async () => 'build',
  generateEtags: false,
  pageExtensions: ['js', 'jsx'],
};

module.exports = nextConfig; 