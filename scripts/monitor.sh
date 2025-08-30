#!/bin/bash

# Script de Monitoramento
# Clicksign Hubsoft

set -e

# Configurações
APP_URL="http://localhost:9999"
DB_PORT="22432"
LOG_FILE="/home/$USER/logs/monitor.log"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1" >> "$LOG_FILE"
}

# Criar diretório de logs se não existir
mkdir -p "$(dirname "$LOG_FILE")"

log "Iniciando monitoramento..."

# 1. Verificar status dos containers Docker
info "Verificando status dos containers..."
if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(clicksign-hubsoft|postgres)"; then
    log "Todos os containers estão rodando"
else
    error "Alguns containers não estão rodando!"
    docker ps -a
fi

# 2. Verificar uso de recursos
info "Verificando uso de recursos..."
echo "=== USO DE MEMÓRIA ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "=== USO DE DISCO ==="
df -h | grep -E "(Filesystem|/dev/)"

# 3. Verificar conectividade do banco
info "Verificando conectividade do banco de dados..."
if nc -z localhost "$DB_PORT" 2>/dev/null; then
    log "Banco de dados está acessível na porta $DB_PORT"
else
    error "Banco de dados não está acessível na porta $DB_PORT"
fi

# 4. Verificar saúde da aplicação
info "Verificando saúde da aplicação..."
if curl -s -f "$APP_URL/health" > /dev/null 2>&1; then
    log "Aplicação está respondendo corretamente"
else
    warn "Aplicação não está respondendo no endpoint /health"
    
    # Tentar endpoint principal
    if curl -s -f "$APP_URL" > /dev/null 2>&1; then
        log "Aplicação está respondendo no endpoint principal"
    else
        error "Aplicação não está respondendo!"
    fi
fi

# 5. Verificar logs de erro recentes
info "Verificando logs de erro recentes..."
if docker compose logs --tail=50 web 2>/dev/null | grep -i "error\|exception\|fatal" > /dev/null; then
    warn "Encontrados erros nos logs recentes:"
    docker compose logs --tail=50 web 2>/dev/null | grep -i "error\|exception\|fatal" | tail -5
else
    log "Nenhum erro encontrado nos logs recentes"
fi

# 6. Verificar espaço em disco dos volumes Docker
info "Verificando volumes Docker..."
docker volume ls | grep clicksign-hubsoft | while read volume; do
    VOLUME_NAME=$(echo "$volume" | awk '{print $2}')
    VOLUME_SIZE=$(docker run --rm -v "$VOLUME_NAME":/data alpine du -sh /data 2>/dev/null | cut -f1)
    echo "Volume $VOLUME_NAME: $VOLUME_SIZE"
done

# 7. Verificar conectividade de rede
info "Verificando conectividade de rede..."
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    log "Conectividade de internet OK"
else
    warn "Problemas de conectividade de internet"
fi

# 8. Verificar processos do sistema
info "Verificando processos do sistema..."
echo "=== PROCESSOS DOCKER ==="
ps aux | grep -E "(docker|containerd)" | grep -v grep | head -5

echo ""
echo "=== PROCESSOS NODE ==="
ps aux | grep -E "node" | grep -v grep | head -5

# 9. Resumo do status
echo ""
echo "=== RESUMO DO STATUS ==="
if docker ps | grep -q "clicksign-hubsoft" && curl -s -f "$APP_URL/health" > /dev/null 2>&1; then
    log "✅ SISTEMA FUNCIONANDO NORMALMENTE"
else
    error "❌ PROBLEMAS DETECTADOS NO SISTEMA"
fi

log "Monitoramento concluído. Log salvo em: $LOG_FILE"
