#!/bin/bash

# Script para verificar e reiniciar o serviço Next.js
echo "=== Verificando e reiniciando o serviço Next.js ==="

# Definir o diretório de instalação
INSTALL_DIR="/assistencia"

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "PM2 não está instalado. Instalando..."
    sudo npm install -g pm2
fi

# Verificar status do PM2
echo "Status atual do PM2:"
pm2 list

# Parar todos os processos do PM2 relacionados ao assistencia
echo "Parando processos existentes..."
pm2 stop assistencia
pm2 delete assistencia

# Verificar se há processos na porta 3005
echo "Verificando processos na porta 3005..."
if command -v lsof &> /dev/null; then
    lsof -i :3005
    # Matar processos na porta 3005 se existirem
    PIDS=$(lsof -t -i:3005)
    if [ ! -z "$PIDS" ]; then
        echo "Matando processos na porta 3005: $PIDS"
        kill -9 $PIDS
    fi
elif command -v netstat &> /dev/null; then
    netstat -tulpn | grep 3005
    # Não podemos matar facilmente com netstat
    echo "Se houver processos na porta 3005, mate-os manualmente"
else
    echo "Não foi possível verificar processos na porta. lsof e netstat não estão disponíveis."
fi

# Entrar no diretório
cd $INSTALL_DIR

# Verificar o arquivo ecosystem.config.js
if [ ! -f "$INSTALL_DIR/ecosystem.config.js" ]; then
    echo "Arquivo ecosystem.config.js não encontrado. Criando..."
    cat > $INSTALL_DIR/ecosystem.config.js << 'EOL'
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
else
    echo "Arquivo ecosystem.config.js encontrado."
    cat $INSTALL_DIR/ecosystem.config.js
fi

# Verificar o arquivo next.config.js
if [ ! -f "$INSTALL_DIR/next.config.js" ]; then
    echo "ERRO: Arquivo next.config.js não encontrado!"
else
    echo "Arquivo next.config.js encontrado. Verificando configuração..."
    grep -E "basePath|assetPrefix" $INSTALL_DIR/next.config.js
fi

# Reconstruir a aplicação
echo "Reconstruindo a aplicação..."
npm run build

# Iniciar a aplicação com PM2 em modo fork (não cluster)
echo "Iniciando a aplicação com PM2 em modo fork..."
pm2 start ecosystem.config.js
pm2 save

# Verificar logs
echo "Verificando logs do PM2..."
pm2 logs assistencia --lines 20

# Reiniciar Nginx
echo "Reiniciando Nginx..."
sudo systemctl restart nginx

echo "=== Processo concluído ==="
echo "Verifique se o serviço está funcionando acessando:"
echo "https://busqueaquiguaira.com/assistencia/"
echo ""
echo "Para verificar os logs em tempo real:"
echo "pm2 logs assistencia" 