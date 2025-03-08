#!/bin/bash

# Script de deploy para VPS
echo "Iniciando deploy da aplicação Assistência Técnica..."

# Puxar as últimas alterações do repositório
echo "Atualizando código do repositório..."
git pull

# Instalar dependências
echo "Instalando dependências..."
npm install

# Construir a aplicação
echo "Construindo a aplicação..."
npm run build:prod

# Reiniciar a aplicação com PM2
echo "Reiniciando a aplicação..."
pm2 restart assistencia || npm run start:prod

echo "Deploy concluído com sucesso!" 