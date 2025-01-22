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
    // MongoDB 配置
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        mongodb: false,
        'mongodb-client-encryption': false,
        'kerberos': false,
        '@mongodb-js/zstd': false,
        'snappy': false,
        'aws4': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
        'socks': false,
      };
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