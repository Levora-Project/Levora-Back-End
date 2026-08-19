#!/bin/sh
set -e

# ============================================
# Docker Entrypoint Script
# - Auto-fix log directory permissions
# - Works with volume mounts
# - Runs app as non-root user (nestjs)
# ============================================

LOGS_DIR="/app/logs"
APP_USER="nestjs"
APP_UID=1001
APP_GID=1001

# Fix logs directory permissions (runs as root initially)
if [ "$(id -u)" = "0" ]; then
  # Create logs directory if not exists
  mkdir -p "$LOGS_DIR"

  # Fix ownership (works even with volume mount)
  chown -R "$APP_UID:$APP_GID" "$LOGS_DIR"
  chmod 755 "$LOGS_DIR"

  echo "[entrypoint] Logs directory ready: $LOGS_DIR"

  # Drop privileges and run as nestjs user
  exec su-exec "$APP_USER" "$@"
else
  # Already running as non-root, just execute
  exec "$@"
fi
