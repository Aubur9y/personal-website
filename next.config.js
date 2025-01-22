/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'api.dicebear.com'],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // 添加这个配置以支持 MongoDB
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 客户端打包配置
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        aws4: false,
        'timers/promises': false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        path: false,
      };
    }

    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['formidable'],
    scrollRestoration: true,
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 性能优化
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig; 