#!/usr/bin/env bash
# Daily pg_dump backup for the SNT postgres container.
# Saves a timestamped .sql file to ./backups/ (outside the Docker volume).
# Deletes files older than RETENTION_DAYS to cap disk usage.
#
# Schedule on the Droplet (run as the deploy user, daily at 03:00):
#   0 3 * * * cd /opt/snt/backend && ./scripts/backup-postgres.sh >> /var/log/snt-backup.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
RETENTION_DAYS=14
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/snt_events_${TIMESTAMP}.sql"

# Pull POSTGRES_USER / POSTGRES_DB from .env (graceful fallback to defaults)
if [[ -f "$PROJECT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.env"
  set +a
fi
PG_USER="${POSTGRES_USER:-snt}"
PG_DB="${POSTGRES_DB:-snt_events}"

mkdir -p "$BACKUP_DIR"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting backup → $FILE"

docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T postgres \
  pg_dump -U "$PG_USER" -d "$PG_DB" --no-owner --no-acl \
  > "$FILE"

SIZE=$(du -sh "$FILE" | cut -f1)
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backup complete — $SIZE"

# Prune files older than RETENTION_DAYS
PRUNED=$(find "$BACKUP_DIR" -maxdepth 1 -name "snt_events_*.sql" -mtime "+${RETENTION_DAYS}" -print -delete | wc -l | tr -d ' ')
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Pruned ${PRUNED} backup(s) older than ${RETENTION_DAYS} days"
