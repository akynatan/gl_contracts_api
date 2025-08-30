#!/bin/bash

# Script de Deploy para Clicksign Hubsoft
# Ubuntu Server
# Autor: Assistant
# Data: $(date)

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy do Clicksign Hubsoft..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se é root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
   exit 1
fi

# Verificar se é Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    error "Este script é específico para Ubuntu"
    exit 1
fi

# # Atualizar sistema
# log "Atualizando sistema..."
# sudo apt update && sudo apt upgrade -y

# # 1. INSTALAR DOCKER
# log "Instalando Docker..."

# # Remover versões antigas se existirem
# sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# # Instalar dependências
# sudo apt install -y \
#     apt-transport-https \
#     ca-certificates \
#     curl \
#     gnupg \
#     lsb-release

# # Adicionar GPG key oficial do Docker
# curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# # Adicionar repositório do Docker
# echo \
#   "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
#   $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# # Instalar Docker
# sudo apt update
# sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# # Adicionar usuário ao grupo docker
# sudo usermod -aG docker $USER

# # Iniciar e habilitar Docker
# sudo systemctl start docker
# sudo systemctl enable docker

# # Verificar instalação
# if docker --version; then
#     log "Docker instalado com sucesso!"
# else
#     error "Falha na instalação do Docker"
#     exit 1
# fi

# # 2. INSTALAR DOCKER COMPOSE
# log "Instalando Docker Compose..."

# # Instalar docker-compose via plugin (já incluído na instalação acima)
# if docker compose version; then
#     log "Docker Compose instalado com sucesso!"
# else
#     # Fallback para instalação manual se necessário
#     sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
#     sudo chmod +x /usr/local/bin/docker-compose
#     log "Docker Compose instalado manualmente!"
# fi

# # 3. INSTALAR GIT (se não estiver instalado)
# if ! command -v git &> /dev/null; then
#     log "Instalando Git..."
#     sudo apt install -y git
# else
#     log "Git já está instalado"
# fi

# # Verificar instalação
# if node --version && npm --version; then
#     log "Node.js instalado com sucesso!"
# else
#     error "Falha na instalação do Node.js"
#     exit 1
# fi

# # 5. CRIAR DIRETÓRIO DO PROJETO
# PROJECT_DIR="/home/$USER/clicksign-hubsoft"
# log "Criando diretório do projeto: $PROJECT_DIR"

# mkdir -p $PROJECT_DIR
# cd $PROJECT_DIR

# # 6. CLONAR REPOSITÓRIO
# log "Clonando repositório..."
# # Nota: Substitua pela URL do seu repositório
# echo "Por favor, informe a URL do seu repositório Git:"
# read -p "URL do repositório: " REPO_URL

# if [ -z "$REPO_URL" ]; then
#     error "URL do repositório não informada"
#     exit 1
# fi

# git clone $REPO_URL .

# # 7. CONFIGURAR VARIÁVEIS DE AMBIENTE
# log "Configurando variáveis de ambiente..."

# # Criar arquivo .env
# cat > .env << EOF
# # Configurações do Banco de Dados
# DB_HOST=localhost
# DB_PORT=22432
# DB_USERNAME=postgres
# DB_PASSWORD=password
# DB_DATABASE=clicksign_hubsoft

# # Configurações da Aplicação
# NODE_ENV=production
# PORT=9999

# # Configurações do Hubsoft
# HUBSOFT_HOST=https://api.hubsoft.com.br
# HUBSOFT_GRANT_TYPE=password
# HUBSOFT_CLIENT_ID=your_client_id
# HUBSOFT_CLIENT_SECRET=your_client_secret
# HUBSOFT_USERNAME=your_username
# HUBSOFT_PASSWORD=your_password

# # Configurações do Clicksign
# CLICKSIGN_HOST=https://sandbox.clicksign.com
# CLICKSIGN_TOKEN=your_clicksign_token

# # Configurações de Email (se necessário)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password

# # JWT Secret
# JWT_SECRET=your_jwt_secret_key_here
# EOF

# warn "Arquivo .env criado! Por favor, edite as variáveis com seus valores reais:"
# warn "  - nano .env"

# # 8. CONSTRUIR E INICIAR CONTAINERS
# log "Construindo e iniciando containers..."

# # Parar containers existentes se houver
# docker compose down 2>/dev/null || true

# Construir e iniciar
docker compose up -d --build

# 9. AGUARDAR BANCO ESTAR PRONTO
log "Aguardando banco de dados estar pronto..."
sleep 10

# 10. EXECUTAR MIGRAÇÕES
log "Executando migrações do banco de dados..."

# Instalar dependências
docker compose exec web npm install

# Executar migrações
docker compose exec web npm run migration:run

# 11. VERIFICAR STATUS
log "Verificando status dos containers..."
docker compose ps

# 12. MOSTRAR LOGS
log "Mostrando logs da aplicação..."
docker compose logs web

# 13. INFORMAÇÕES FINAIS
echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo ""
echo "📋 RESUMO:"
echo "  ✅ Docker instalado e configurado"
echo "  ✅ Docker Compose instalado"
echo "  ✅ Node.js instalado"
echo "  ✅ Repositório clonado"
echo "  ✅ Containers construídos e iniciados"
echo "  ✅ Migrações executadas"
echo ""
echo "🌐 Aplicação rodando em: http://localhost:9999"
echo "🗄️  Banco PostgreSQL rodando na porta: 22432"
echo ""
echo "📁 Diretório do projeto: $PROJECT_DIR"
echo "🔧 Para editar configurações: nano .env"
echo ""
echo "📖 Comandos úteis:"
echo "  - Ver logs: docker compose logs -f web"
echo "  - Parar: docker compose down"
echo "  - Reiniciar: docker compose restart"
echo "  - Status: docker compose ps"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  1. Edite o arquivo .env com suas credenciais reais"
echo "  2. Configure seu firewall para permitir acesso à porta 9999"
echo "  3. Configure SSL/HTTPS para produção"
echo "  4. Configure backup do banco de dados"
echo ""

# 14. CONFIGURAÇÃO DO FIREWALL (OPCIONAL)
read -p "Deseja configurar o firewall para permitir acesso à aplicação? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Configurando firewall..."
    sudo ufw allow 9999/tcp
    sudo ufw allow 22/tcp
    sudo ufw --force enable
    log "Firewall configurado!"
fi

log "Deploy finalizado! A aplicação está rodando."
