/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 图片配置
  images: {
    unoptimized: true,
    domains: ['localhost', 'api.dicebear.com'],
  },

  // 禁用优化
  optimizeFonts: false,
  optimizeCss: false,
  poweredByHeader: false,
  
  // 修改 webpack 配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        'mongodb-client-encryption': false,
      };
    }

    // 忽略这些原生模块
    config.externals = [...(config.externals || []), {
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'kerberos': 'commonjs kerberos',
      'snappy': 'commonjs snappy',
      '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
    }];

    return config;
  },

  // Vercel 特定配置
  output: 'standalone',
  experimental: {
    // MongoDB 支持
    serverComponentsExternalPackages: ['mongodb'],
    esmExternals: 'loose',
  },

  // 禁用静态导出
  trailingSlash: false,
  exportPathMap: null,

  // 添加这些配置
  distDir: '.next',
  generateBuildId: async () => 'build',
  generateEtags: false,
  pageExtensions: ['js', 'jsx'],
};

module.exports = nextConfig; 