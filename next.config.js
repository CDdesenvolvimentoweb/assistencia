/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/assistencia', // Nome do seu repositório
  assetPrefix: '/assistencia/', // Nome do seu repositório com barra no final
}

module.exports = nextConfig 