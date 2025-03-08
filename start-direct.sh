#!/bin/bash

# Script para iniciar o serviço Next.js diretamente sem PM2
echo "=== Iniciando o serviço Next.js diretamente ==="

# Definir o diretório de instalação
INSTALL_DIR="/assistencia"

# Entrar no diretório
cd $INSTALL_DIR
echo "Diretório atual: $(pwd)"

# Verificar se há processos na porta 3005
echo "Verificando processos na porta 3005..."
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -t -i:3005)
    if [ ! -z "$PIDS" ]; then
        echo "Matando processos na porta 3005: $PIDS"
        kill -9 $PIDS
    fi
elif command -v fuser &> /dev/null; then
    echo "Matando processos na porta 3005..."
    fuser -k 3005/tcp
fi

# Verificar se o PM2 está rodando o serviço
if command -v pm2 &> /dev/null; then
    echo "Parando serviço no PM2..."
    pm2 stop assistencia || true
    pm2 delete assistencia || true
fi

# Criar arquivo de log
LOG_FILE="$INSTALL_DIR/next-direct.log"
echo "Logs serão gravados em: $LOG_FILE"
echo "=== Iniciando serviço em $(date) ===" > $LOG_FILE

# Iniciar o serviço diretamente
echo "Iniciando o serviço..."
nohup node node_modules/next/dist/bin/next start -p 3005 >> $LOG_FILE 2>&1 &

# Salvar o PID
PID=$!
echo $PID > "$INSTALL_DIR/next.pid"
echo "Serviço iniciado com PID: $PID"

# Aguardar um pouco para verificar se o serviço iniciou
echo "Aguardando 5 segundos para verificar se o serviço iniciou..."
sleep 5

# Verificar se o processo ainda está rodando
if ps -p $PID > /dev/null; then
    echo "Serviço iniciado com sucesso!"
    echo "Últimas linhas do log:"
    tail -n 10 $LOG_FILE
else
    echo "Serviço falhou ao iniciar. Logs:"
    cat $LOG_FILE
    exit 1
fi

# Reiniciar Nginx
echo "Reiniciando Nginx..."
sudo systemctl restart nginx

echo "=== Serviço iniciado ==="
echo "Para verificar os logs:"
echo "tail -f $LOG_FILE"
echo ""
echo "Para parar o serviço:"
echo "kill \$(cat $INSTALL_DIR/next.pid)" 