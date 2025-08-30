#!/bin/bash

# Script para configurar Cron Jobs
# Clicksign Hubsoft

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

log "Configurando cron jobs para Clicksign Hubsoft..."

# Obter diretório atual
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Tornar scripts executáveis
chmod +x "$SCRIPT_DIR/backup.sh"
chmod +x "$SCRIPT_DIR/monitor.sh"

# Criar arquivo de cron temporário
TEMP_CRON=$(mktemp)

# Backup diário às 2:00 AM
echo "0 2 * * * $SCRIPT_DIR/backup.sh >> $PROJECT_DIR/logs/backup.log 2>&1" >> "$TEMP_CRON"

# Monitoramento a cada 15 minutos
echo "*/15 * * * * $SCRIPT_DIR/monitor.sh >> $PROJECT_DIR/logs/monitor.log 2>&1" >> "$TEMP_CRON"

# Limpeza de logs antigos (semanal)
echo "0 3 * * 0 find $PROJECT_DIR/logs -name '*.log' -mtime +30 -delete" >> "$TEMP_CRON"

# Verificar se o cron já existe
if crontab -l 2>/dev/null | grep -q "backup.sh"; then
    warn "Cron jobs já existem. Atualizando..."
    # Remover entradas antigas
    crontab -l 2>/dev/null | grep -v "backup.sh\|monitor.sh\|logs.*delete" > "$TEMP_CRON"
    # Adicionar novas entradas
    echo "0 2 * * * $SCRIPT_DIR/backup.sh >> $PROJECT_DIR/logs/backup.log 2>&1" >> "$TEMP_CRON"
    echo "*/15 * * * * $SCRIPT_DIR/monitor.sh >> $PROJECT_DIR/logs/monitor.log 2>&1" >> "$TEMP_CRON"
    echo "0 3 * * 0 find $PROJECT_DIR/logs -name '*.log' -mtime +30 -delete" >> "$TEMP_CRON"
fi

# Instalar cron jobs
crontab "$TEMP_CRON"

# Limpar arquivo temporário
rm "$TEMP_CRON"

# Criar diretórios necessários
mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/backups"

log "Cron jobs configurados com sucesso!"

# Mostrar cron jobs ativos
echo ""
echo "=== CRON JOBS ATIVOS ==="
crontab -l

echo ""
echo "📋 RESUMO DOS JOBS CONFIGURADOS:"
echo "  ✅ Backup diário às 2:00 AM"
echo "  ✅ Monitoramento a cada 15 minutos"
echo "  ✅ Limpeza de logs semanal"
echo ""
echo "📁 Diretórios criados:"
echo "  - $PROJECT_DIR/logs"
echo "  - $PROJECT_DIR/backups"
echo ""
echo "📖 Para ver logs:"
echo "  - Backup: tail -f $PROJECT_DIR/logs/backup.log"
echo "  - Monitoramento: tail -f $PROJECT_DIR/logs/monitor.log"
