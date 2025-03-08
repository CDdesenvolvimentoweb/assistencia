#!/bin/bash

# Script de instalação para o sistema de assistência na VPS
echo "Iniciando instalação do sistema de assistência técnica..."

# Definir o diretório de instalação
INSTALL_DIR="/assistencia"

# Verificar se o diretório já existe
if [ ! -d "$INSTALL_DIR" ]; then
    echo "Criando diretório de instalação..."
    sudo mkdir -p $INSTALL_DIR
    sudo chown $USER:$USER $INSTALL_DIR
fi

# Clonar o repositório (se não existir)
if [ ! -d "$INSTALL_DIR/.git" ]; then
    echo "Clonando o repositório..."
    git clone https://github.com/CDdesenvolvimentoweb/assistencia.git $INSTALL_DIR
else
    echo "Repositório já existe, atualizando..."
    cd $INSTALL_DIR
    git pull
fi

# Entrar no diretório
cd $INSTALL_DIR

# Instalar dependências
echo "Instalando dependências..."
npm install

# Construir a aplicação
echo "Construindo a aplicação..."
npm run build

# Configurar PM2
echo "Configurando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2 globalmente..."
    sudo npm install -g pm2
fi

# Iniciar a aplicação com PM2
echo "Iniciando a aplicação com PM2..."
pm2 start ecosystem.config.js
pm2 save

# Configurar inicialização automática
echo "Configurando inicialização automática..."
pm2 startup | tail -n 1 | bash

echo "Instalação concluída com sucesso!"
echo "O sistema está disponível em: https://busqueaquiguaira.com/assistencia/" 