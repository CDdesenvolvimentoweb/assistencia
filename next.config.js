/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.EXPORT === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.EXPORT === 'true',
  },
  // Remova estas configurações para VPS
  // basePath: isProduction ? `/${repoName}` : '',
  // assetPrefix: isProduction ? `/${repoName}/` : '',
  // trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig 