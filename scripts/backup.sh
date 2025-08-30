#!/bin/bash

# Script de Backup do Banco de Dados
# Clicksign Hubsoft

set -e

# Configurações
BACKUP_DIR="/home/$USER/backups"
DB_NAME="clicksign_hubsoft"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="22432"
RETENTION_DAYS=7

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

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Nome do arquivo de backup
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"

log "Iniciando backup do banco $DB_NAME..."

# Verificar se o container está rodando
if ! docker ps | grep -q "clicksign-hubsoft-db"; then
    error "Container do banco de dados não está rodando!"
    exit 1
fi

# Executar backup
if docker exec clicksign-hubsoft-db-1 pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
    log "Backup criado com sucesso: $BACKUP_FILE"
    
    # Comprimir backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE_COMPRESSED="$BACKUP_FILE.gz"
    
    # Verificar tamanho
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
    log "Tamanho do backup: $BACKUP_SIZE"
    
    # Limpar backups antigos
    log "Removendo backups mais antigos que $RETENTION_DAYS dias..."
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Listar backups existentes
    log "Backups disponíveis:"
    ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || warn "Nenhum backup encontrado"
    
else
    error "Falha ao criar backup!"
    exit 1
fi

log "Backup concluído com sucesso!"
