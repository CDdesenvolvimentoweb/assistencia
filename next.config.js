/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.EXPORT === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.EXPORT === 'true',
  },
  basePath: '/assistencia',
  assetPrefix: '/assistencia',
  // Remova estas configurações para VPS
  // assetPrefix: isProduction ? `/${repoName}/` : '',
  // trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig 