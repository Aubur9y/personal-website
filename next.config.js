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
  },
  
  // 图片配置
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // 禁用字体优化
  optimizeFonts: false,
  
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
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    // MongoDB 可选依赖警告处理
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
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