#!/bin/bash

# Script para diagnosticar problemas com arquivos estáticos
echo "=== Diagnóstico de Arquivos Estáticos ==="

# Definir o diretório de instalação
INSTALL_DIR="/assistencia"

# Verificar se o diretório existe
if [ ! -d "$INSTALL_DIR" ]; then
    echo "ERRO: Diretório $INSTALL_DIR não encontrado!"
    exit 1
else
    echo "✓ Diretório $INSTALL_DIR encontrado"
fi

# Verificar se o diretório .next existe
if [ ! -d "$INSTALL_DIR/.next" ]; then
    echo "ERRO: Diretório $INSTALL_DIR/.next não encontrado!"
    echo "Executando build para criar o diretório..."
    cd $INSTALL_DIR
    npm run build
else
    echo "✓ Diretório $INSTALL_DIR/.next encontrado"
fi

# Verificar se o diretório .next/static existe
if [ ! -d "$INSTALL_DIR/.next/static" ]; then
    echo "ERRO: Diretório $INSTALL_DIR/.next/static não encontrado!"
    echo "Executando build para criar o diretório..."
    cd $INSTALL_DIR
    npm run build
else
    echo "✓ Diretório $INSTALL_DIR/.next/static encontrado"
    
    # Listar subdiretórios
    echo "Subdiretórios em .next/static:"
    ls -la $INSTALL_DIR/.next/static
fi

# Verificar permissões
echo -e "\n=== Verificando permissões ==="
echo "Permissões do diretório $INSTALL_DIR:"
ls -ld $INSTALL_DIR
echo "Permissões do diretório $INSTALL_DIR/.next:"
ls -ld $INSTALL_DIR/.next
echo "Permissões do diretório $INSTALL_DIR/.next/static:"
ls -ld $INSTALL_DIR/.next/static

# Corrigir permissões
echo -e "\n=== Corrigindo permissões ==="
echo "Aplicando permissões 755 recursivamente em $INSTALL_DIR/.next"
sudo chmod -R 755 $INSTALL_DIR/.next
echo "Alterando proprietário para www-data:www-data"
sudo chown -R www-data:www-data $INSTALL_DIR/.next

# Verificar configuração do Nginx
echo -e "\n=== Verificando configuração do Nginx ==="
echo "Testando configuração do Nginx:"
sudo nginx -t

# Verificar se o serviço está rodando
echo -e "\n=== Verificando serviço na porta 3005 ==="
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep 3005
elif command -v ss &> /dev/null; then
    ss -tulpn | grep 3005
else
    echo "Não foi possível verificar a porta. Netstat ou ss não estão disponíveis."
fi

# Verificar PM2
echo -e "\n=== Verificando PM2 ==="
pm2 list

# Reiniciar serviços
echo -e "\n=== Reiniciando serviços ==="
echo "Reiniciando PM2..."
pm2 restart assistencia
echo "Reiniciando Nginx..."
sudo systemctl restart nginx

echo -e "\n=== Diagnóstico concluído ==="
echo "Se ainda houver problemas, verifique os logs do Nginx:"
echo "sudo tail -f /var/log/nginx/error.log"
echo "E os logs do PM2:"
echo "pm2 logs assistencia" 