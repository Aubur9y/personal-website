/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 环境变量配置
  env: {
    MONGODB_URI: process.env.MONGODB_URI || '',
    MONGODB_DB: process.env.MONGODB_DB || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    NEXT_WEBPACK_USEPOLLING: '1',
    CHOKIDAR_USEPOLLING: '1'
  },
  
  // 图片配置
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // 禁用字体优化
  optimizeFonts: false,
  
  // Windows 编码配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        stream: false,
        buffer: false,
        'mongodb-client-encryption': false,
        'bson-ext': false,
        'kerberos': false,
        'snappy': false,
        'aws4': false,
        '@mongodb-js/zstd': false,
      };
    }
    return config;
  },

  // MongoDB 支持
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  },
};

module.exports = nextConfig; 