#!/bin/bash

# Script de Verificação Rápida de Saúde
# Clicksign Hubsoft

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "🏥 VERIFICAÇÃO RÁPIDA DE SAÚDE - Clicksign Hubsoft"
echo "=================================================="
echo ""

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Função para executar check
run_check() {
    local description="$1"
    local command="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$command" > /dev/null 2>&1; then
        log "$description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        error "$description"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# 1. Verificar Docker
info "Verificando Docker..."
run_check "Docker está rodando" "docker info > /dev/null 2>&1"
run_check "Docker Compose está disponível" "docker compose version > /dev/null 2>&1"

# 2. Verificar containers
info "Verificando Containers..."
run_check "Container da aplicação está rodando" "docker ps | grep -q 'clicksign-hubsoft.*Up'"
run_check "Container do banco está rodando" "docker ps | grep -q 'postgres.*Up'"

# 3. Verificar conectividade
info "Verificando Conectividade..."
run_check "Banco de dados está acessível" "nc -z localhost 22432"
run_check "Aplicação está respondendo" "curl -s -f http://localhost:9999/health > /dev/null 2>&1 || curl -s -f http://localhost:9999 > /dev/null 2>&1"

# 4. Verificar recursos
info "Verificando Recursos..."
run_check "Há espaço suficiente em disco" "df / | awk 'NR==2 {exit \$4 < 5000000}'"  # 5GB mínimo
run_check "Há memória suficiente" "free -m | awk 'NR==2 {exit \$3 > \$2 * 0.9}'"  # 90% máximo

# 5. Verificar logs
info "Verificando Logs..."
run_check "Não há erros críticos recentes" "! docker compose logs --tail=20 web 2>/dev/null | grep -i 'error\|exception\|fatal' > /dev/null"

# 6. Verificar cron jobs
info "Verificando Cron Jobs..."
run_check "Cron jobs estão configurados" "crontab -l 2>/dev/null | grep -q 'backup.sh\|monitor.sh'"

# 7. Verificar backups
info "Verificando Backups..."
run_check "Diretório de backup existe" "test -d ~/backups"
run_check "Há backups recentes" "find ~/backups -name '*.sql.gz' -mtime -7 | head -1 | grep -q ."

# 8. Verificar segurança
info "Verificando Segurança..."
run_check "Firewall está ativo" "sudo ufw status | grep -q 'Status: active'"
run_check "Porta SSH está configurada" "sudo ufw status | grep -q '22/tcp.*ALLOW'"

# Resumo
echo ""
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "========================"
echo "Total de verificações: $TOTAL_CHECKS"
echo "✅ Aprovadas: $PASSED_CHECKS"
echo "❌ Falharam: $FAILED_CHECKS"
echo ""

# Determinar status geral
if [ $FAILED_CHECKS -eq 0 ]; then
    echo "🎉 SISTEMA 100% SAUDÁVEL!"
    exit 0
elif [ $FAILED_CHECKS -le 2 ]; then
    echo "⚠️  SISTEMA COM PEQUENOS PROBLEMAS"
    exit 1
else
    echo "🚨 SISTEMA COM PROBLEMAS CRÍTICOS!"
    exit 2
fi
