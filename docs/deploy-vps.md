# Guia de Deploy para VPS

## Requisitos do Servidor

1. **Sistema Operacional**: Ubuntu 20.04 ou superior (recomendado)
2. **Node.js**: v18.x ou superior
3. **Nginx**: Como servidor web e proxy reverso
4. **PM2**: Para gerenciar o processo Node.js

## Passos para Instalação

### 1. Atualizar o sistema
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Verificar a versão
npm -v   # Verificar a versão do npm
```

### 3. Instalar PM2 globalmente
```bash
sudo npm install -g pm2
```

### 4. Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Configurar Firewall (se necessário)
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Deploy da Aplicação

### 1. Clonar o repositório
```bash
git clone https://github.com/CDdesenvolvimentoweb/assistencia.git
cd assistencia
```

### 2. Instalar dependências e fazer o build
```bash
npm install
npm run build
```

### 3. Configurar PM2
Crie um arquivo `ecosystem.config.js` na raiz do projeto:

```javascript
module.exports = {
  apps: [
    {
      name: 'assistencia',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### 4. Iniciar a aplicação com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configurar Nginx como proxy reverso

Crie um arquivo de configuração para o Nginx:

```bash
sudo nano /etc/nginx/sites-available/assistencia
```

Adicione o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/assistencia /etc/nginx/sites-enabled/
sudo nginx -t  # Testar a configuração
sudo systemctl restart nginx
```

### 6. Configurar HTTPS com Certbot (recomendado)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## Atualização da Aplicação

Para atualizar a aplicação quando houver mudanças:

```bash
cd /caminho/para/assistencia
git pull
npm install
npm run build
pm2 restart assistencia
```

## Monitoramento

Para monitorar a aplicação:

```bash
pm2 status
pm2 logs
pm2 monit
``` 