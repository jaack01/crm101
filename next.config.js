/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable strict mode in production to avoid double rendering issues with Tauri
  reactStrictMode: false,

  // Production optimizations
  swcMinify: true,

  // Optimize bundle size
  productionBrowserSourceMaps: false,

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Disable x-powered-by header
  poweredByHeader: false,
}

module.exports = nextConfig
