#!/bin/bash

# Script para verificar e corrigir o serviço Next.js
echo "=== Verificando o serviço Next.js ==="

# Verificar se o serviço está rodando
echo "Verificando se o serviço está rodando na porta 3005..."
if command -v lsof &> /dev/null; then
    RUNNING=$(lsof -i:3005 | grep LISTEN)
    if [ -z "$RUNNING" ]; then
        echo "Serviço não está rodando na porta 3005."
    else
        echo "Serviço está rodando na porta 3005:"
        echo "$RUNNING"
    fi
elif command -v netstat &> /dev/null; then
    RUNNING=$(netstat -tulpn | grep 3005)
    if [ -z "$RUNNING" ]; then
        echo "Serviço não está rodando na porta 3005."
    else
        echo "Serviço está rodando na porta 3005:"
        echo "$RUNNING"
    fi
else
    echo "Não foi possível verificar se o serviço está rodando."
fi

# Verificar logs do PM2
echo -e "\n=== Logs do PM2 ==="
if command -v pm2 &> /dev/null; then
    pm2 logs assistencia --lines 10 || echo "Não foi possível obter logs do PM2."
else
    echo "PM2 não está instalado."
fi

# Verificar status do PM2
echo -e "\n=== Status do PM2 ==="
if command -v pm2 &> /dev/null; then
    pm2 list || echo "Não foi possível obter status do PM2."
else
    echo "PM2 não está instalado."
fi

# Verificar uso de memória
echo -e "\n=== Uso de memória ==="
free -m

# Verificar uso de disco
echo -e "\n=== Uso de disco ==="
df -h

# Verificar se o Node.js está instalado
echo -e "\n=== Versão do Node.js ==="
node -v || echo "Node.js não está instalado."

# Verificar se o Next.js está instalado
echo -e "\n=== Verificando Next.js ==="
if [ -d "/assistencia/node_modules/next" ]; then
    echo "Next.js está instalado."
    ls -la /assistencia/node_modules/next/dist/bin/
else
    echo "Next.js não está instalado."
fi

# Tentar iniciar o serviço diretamente
echo -e "\n=== Tentando iniciar o serviço diretamente ==="
cd /assistencia
echo "Diretório atual: $(pwd)"

# Verificar se o arquivo package.json existe
if [ -f "package.json" ]; then
    echo "Arquivo package.json encontrado."
else
    echo "Arquivo package.json não encontrado."
    exit 1
fi

# Tentar iniciar o serviço com node diretamente
echo "Tentando iniciar o serviço com node diretamente..."
NODE_ENV=production PORT=3005 node node_modules/next/dist/bin/next start -p 3005 > next.log 2>&1 &
PID=$!
echo "Processo iniciado com PID: $PID"

# Aguardar um pouco para verificar se o serviço iniciou
echo "Aguardando 5 segundos para verificar se o serviço iniciou..."
sleep 5

# Verificar se o processo ainda está rodando
if ps -p $PID > /dev/null; then
    echo "Serviço iniciado com sucesso!"
    echo "Logs do serviço:"
    tail -n 20 next.log
else
    echo "Serviço falhou ao iniciar. Logs:"
    cat next.log
fi

# Verificar se o serviço está respondendo
echo -e "\n=== Verificando se o serviço está respondendo ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005 || echo "Serviço não está respondendo."

echo -e "\n=== Verificação concluída ==="
echo "Se o serviço estiver rodando, verifique se o Nginx está configurado corretamente:"
echo "sudo nginx -t"
echo "sudo systemctl restart nginx" 