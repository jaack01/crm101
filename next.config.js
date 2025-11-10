/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable strict mode in production to avoid double rendering issues with Tauri
  reactStrictMode: false,
}

module.exports = nextConfig
