# 🚀 Guia de Deploy - Clicksign Hubsoft

Este guia fornece instruções completas para fazer o deploy da aplicação Clicksign Hubsoft em um servidor Ubuntu.

## 📋 Pré-requisitos

- Servidor Ubuntu 20.04 LTS ou superior
- Acesso SSH com usuário não-root
- Pelo menos 2GB de RAM
- Pelo menos 20GB de espaço em disco
- Conexão com internet

## 🎯 O que será instalado

1. **Docker** - Para containerização
2. **Docker Compose** - Para orquestração de containers
3. **Node.js 18** - Runtime JavaScript
4. **PostgreSQL 15** - Banco de dados
5. **Nginx** - Proxy reverso e load balancer
6. **Scripts de automação** - Backup, monitoramento e cron jobs

## 🚀 Deploy Automatizado (Recomendado)

### Passo 1: Preparar o servidor

```bash
# Conectar ao servidor via SSH
ssh usuario@seu-servidor.com

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar curl (se não estiver instalado)
sudo apt install -y curl
```

### Passo 2: Executar script de deploy

```bash
# Baixar o script de deploy
curl -O https://raw.githubusercontent.com/seu-usuario/clicksign-hubsoft/main/deploy.sh

# Tornar executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

O script irá:

- ✅ Instalar Docker e dependências
- ✅ Instalar Node.js
- ✅ Clonar o repositório
- ✅ Configurar variáveis de ambiente
- ✅ Construir e iniciar containers
- ✅ Executar migrações do banco

## 🔧 Deploy Manual

Se preferir fazer o deploy manualmente, siga os passos abaixo:

### 1. Instalar Docker

```bash
# Remover versões antigas
sudo apt remove -y docker docker-engine docker.io containerd runc

# Instalar dependências
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Adicionar GPG key oficial
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Iniciar e habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verificar instalação
docker --version
```

### 2. Instalar Node.js

```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Clonar repositório

```bash
# Criar diretório do projeto
mkdir -p ~/clicksign-hubsoft
cd ~/clicksign-hubsoft

# Clonar repositório
git clone https://github.com/seu-usuario/clicksign-hubsoft.git .
```

### 4. Configurar variáveis de ambiente

```bash
# Criar arquivo .env
nano .env
```

Conteúdo do arquivo `.env`:

```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=22432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_segura
DB_DATABASE=clicksign_hubsoft

# Configurações da Aplicação
NODE_ENV=production
PORT=9999

# Configurações do Hubsoft
HUBSOFT_HOST=https://api.hubsoft.com.br
HUBSOFT_GRANT_TYPE=password
HUBSOFT_CLIENT_ID=seu_client_id
HUBSOFT_CLIENT_SECRET=seu_client_secret
HUBSOFT_USERNAME=seu_username
HUBSOFT_PASSWORD=sua_senha

# Configurações do Clicksign
CLICKSIGN_HOST=https://sandbox.clicksign.com
CLICKSIGN_TOKEN=seu_token

# JWT Secret
JWT_SECRET=sua_chave_jwt_super_secreta
```

### 5. Construir e iniciar containers

```bash
# Construir e iniciar
docker compose up -d --build

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f web
```

### 6. Executar migrações

```bash
# Instalar dependências
docker compose exec web npm install

# Executar migrações
docker compose exec web npm run migration:run
```

## 🔒 Configuração de Segurança

### Firewall

```bash
# Configurar UFW
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 9999/tcp    # Aplicação (se necessário)
sudo ufw --force enable
```

### SSL/HTTPS

Para produção, configure SSL com Let's Encrypt:

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovar automaticamente
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoramento e Backup

### Configurar cron jobs

```bash
# Executar script de configuração
chmod +x scripts/setup-cron.sh
./scripts/setup-cron.sh
```

### Backup manual

```bash
# Executar backup
./scripts/backup.sh

# Verificar backups
ls -lh ~/backups/
```

### Monitoramento

```bash
# Executar monitoramento
./scripts/monitor.sh

# Ver logs de monitoramento
tail -f ~/logs/monitor.log
```

## 🚨 Troubleshooting

### Problemas comuns

#### Container não inicia

```bash
# Ver logs detalhados
docker compose logs web

# Verificar status
docker compose ps

# Reiniciar containers
docker compose restart
```

#### Banco não conecta

```bash
# Verificar se está rodando
docker compose ps db

# Testar conectividade
docker compose exec db pg_isready -U postgres

# Ver logs do banco
docker compose logs db
```

#### Migrações falham

```bash
# Verificar conexão
docker compose exec web npm run typeorm -- query "SELECT 1"

# Executar migrações com debug
docker compose exec web npm run migration:run -- --verbose
```

### Logs importantes

```bash
# Logs da aplicação
docker compose logs -f web

# Logs do banco
docker compose logs -f db

# Logs do Nginx
docker compose logs -f nginx
```

## 📈 Manutenção

### Atualizações

```bash
# Parar aplicação
docker compose down

# Atualizar código
git pull origin main

# Reconstruir e reiniciar
docker compose up -d --build

# Executar migrações se necessário
docker compose exec web npm run migration:run
```

### Limpeza

```bash
# Limpar containers parados
docker container prune

# Limpar imagens não utilizadas
docker image prune

# Limpar volumes não utilizados
docker volume prune

# Limpeza completa (cuidado!)
docker system prune -a
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker compose logs -f`
2. Execute o script de monitoramento: `./scripts/monitor.sh`
3. Verifique o status dos containers: `docker compose ps`
4. Consulte a documentação do projeto
5. Abra uma issue no repositório

## 🔄 Rollback

Para reverter uma atualização:

```bash
# Parar aplicação atual
docker compose down

# Voltar para commit anterior
git reset --hard HEAD~1

# Reconstruir e reiniciar
docker compose up -d --build
```

---

**⚠️ IMPORTANTE**: Sempre faça backup antes de atualizações importantes!

**📝 Nota**: Este guia assume que você está usando Ubuntu. Para outras distribuições, alguns comandos podem variar.
