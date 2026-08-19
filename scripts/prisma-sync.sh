#!/usr/bin/env bash
# ──────────────────────────────────────────────
# prisma-sync.sh
# Pull DB schema → camelCase format → generate client
#
# Usage:
#   yarn prisma:sync          # normal run
#   yarn prisma:sync --force  # overwrite schema on pull
# ──────────────────────────────────────────────
set -euo pipefail

FORCE=""
if [[ "${1:-}" == "--force" ]]; then
  FORCE="--force"
fi

echo "══════════════════════════════════════════"
echo "  Step 1/3: prisma db pull $FORCE"
echo "══════════════════════════════════════════"
npx prisma db pull $FORCE

echo ""
echo "══════════════════════════════════════════"
echo "  Step 2/3: prisma-case-format (camelCase)"
echo "══════════════════════════════════════════"
npx prisma-case-format --file prisma/schema.prisma

echo ""
echo "══════════════════════════════════════════"
echo "  Step 3/3: prisma generate"
echo "══════════════════════════════════════════"
npx prisma generate

echo ""
echo "✅ Done! Schema pulled, formatted, and client generated."
