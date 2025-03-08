/** @type {import('next').NextConfig} */
const nextConfig = {
  // O Vercel gerencia automaticamente o output, não precisamos de 'export'
  // output: 'export',  
  
  // Configurações para imagens - o Vercel suporta otimização de imagens
  images: {
    domains: ['cddesenvolvimentoweb.github.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Não precisamos de basePath ou assetPrefix no Vercel
  // reactStrictMode: true para melhor detecção de problemas durante o desenvolvimento
  reactStrictMode: true,
}

module.exports = nextConfig 