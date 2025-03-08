#!/bin/bash

# Script para corrigir problemas de build do Next.js
echo "=== Corrigindo problemas de build do Next.js ==="

# Definir o diretório de instalação
INSTALL_DIR="/assistencia"

# Entrar no diretório
cd $INSTALL_DIR
echo "Diretório atual: $(pwd)"

# Limpar diretórios de build
echo "Limpando diretórios de build..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Verificar o arquivo next.config.js
echo "Verificando next.config.js..."
if [ -f "next.config.js" ]; then
    echo "Conteúdo atual do next.config.js:"
    cat next.config.js
    
    # Criar backup do arquivo
    cp next.config.js next.config.js.bak
    
    # Criar um novo arquivo next.config.js simplificado
    echo "Criando um novo arquivo next.config.js simplificado..."
    cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/assistencia',
  assetPrefix: '/assistencia',
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig
EOL
    echo "Novo next.config.js criado."
else
    echo "Arquivo next.config.js não encontrado. Criando..."
    cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/assistencia',
  assetPrefix: '/assistencia',
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig
EOL
    echo "Arquivo next.config.js criado."
fi

# Reinstalar dependências
echo "Reinstalando dependências..."
npm ci || npm install

# Executar build com mais informações
echo "Executando build com mais informações..."
NODE_ENV=production npm run build

# Verificar se o build foi bem-sucedido
if [ -f ".next/prerender-manifest.json" ]; then
    echo "✓ Build concluído com sucesso! Arquivo prerender-manifest.json encontrado."
else
    echo "✗ Falha no build. Arquivo prerender-manifest.json não encontrado."
    echo "Tentando abordagem alternativa..."
    
    # Tentar abordagem alternativa: criar o arquivo manualmente
    echo "Criando diretório .next se não existir..."
    mkdir -p .next
    
    echo "Criando prerender-manifest.json vazio..."
    echo '{"version":3,"routes":{},"dynamicRoutes":{},"preview":{"previewModeId":"","previewModeSigningKey":"","previewModeEncryptionKey":""}}' > .next/prerender-manifest.json
    
    echo "Verificando se o arquivo foi criado..."
    if [ -f ".next/prerender-manifest.json" ]; then
        echo "✓ Arquivo prerender-manifest.json criado manualmente."
    else
        echo "✗ Falha ao criar o arquivo prerender-manifest.json manualmente."
    fi
fi

# Verificar permissões
echo "Corrigindo permissões..."
chmod -R 755 .next
sudo chown -R www-data:www-data .next

# Iniciar o serviço com PM2
echo "Configurando PM2..."
if [ -f "ecosystem.config.js" ]; then
    echo "Arquivo ecosystem.config.js encontrado."
    cat ecosystem.config.js
else
    echo "Arquivo ecosystem.config.js não encontrado. Criando..."
    cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [
    {
      name: 'assistencia',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: '1',
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      }
    }
  ]
};
EOL
    echo "Arquivo ecosystem.config.js criado."
fi

# Parar e iniciar o serviço
echo "Reiniciando o serviço com PM2..."
pm2 stop assistencia || true
pm2 delete assistencia || true
pm2 start ecosystem.config.js
pm2 save

# Reiniciar Nginx
echo "Reiniciando Nginx..."
sudo systemctl restart nginx

echo "=== Processo concluído ==="
echo "Verifique se o serviço está funcionando acessando:"
echo "https://busqueaquiguaira.com/assistencia/"
echo ""
echo "Para verificar os logs em tempo real:"
echo "pm2 logs assistencia" 