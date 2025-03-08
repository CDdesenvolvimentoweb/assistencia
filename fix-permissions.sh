#!/bin/bash

# Script para verificar e corrigir permissões dos arquivos estáticos
echo "Verificando e corrigindo permissões dos arquivos estáticos..."

# Definir o diretório de instalação
INSTALL_DIR="/assistencia"

# Verificar se o diretório .next existe
if [ ! -d "$INSTALL_DIR/.next" ]; then
    echo "ERRO: Diretório $INSTALL_DIR/.next não encontrado!"
    echo "Verifique se o build foi executado corretamente."
    exit 1
fi

# Verificar se o diretório .next/static existe
if [ ! -d "$INSTALL_DIR/.next/static" ]; then
    echo "ERRO: Diretório $INSTALL_DIR/.next/static não encontrado!"
    echo "Verifique se o build foi executado corretamente."
    exit 1
fi

# Listar os arquivos estáticos para verificação
echo "Arquivos estáticos encontrados:"
ls -la $INSTALL_DIR/.next/static

# Corrigir permissões
echo "Corrigindo permissões..."
sudo chmod -R 755 $INSTALL_DIR/.next
sudo chown -R www-data:www-data $INSTALL_DIR/.next

# Verificar configuração do Nginx
echo "Verificando configuração do Nginx..."
sudo nginx -t

echo "Reiniciando o Nginx..."
sudo systemctl restart nginx

echo "Verificando status do serviço na porta 3005..."
netstat -tulpn | grep 3005

echo "Verificação concluída!"
echo "Se ainda houver problemas, verifique os logs do Nginx:"
echo "sudo tail -f /var/log/nginx/error.log" 