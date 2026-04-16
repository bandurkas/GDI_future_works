#!/bin/bash
# Validates that all critical .env keys exist before deploy
# Usage: bash scratch/check-env.sh (run from project root)
set -e

ENV_FILE="${1:-.env}"
REQUIRED_KEYS=(
  DATABASE_URL
  AUTH_URL
  NEXTAUTH_URL
  NEXTAUTH_SECRET
  AUTH_SECRET
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  NEXT_PUBLIC_GOOGLE_CLIENT_ID
  WHAPI_TOKEN
)

MISSING=0
for key in "${REQUIRED_KEYS[@]}"; do
  if ! grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    echo "MISSING: $key"
    MISSING=$((MISSING + 1))
  fi
done

if [ "$MISSING" -gt 0 ]; then
  echo "ABORT: $MISSING required keys missing from $ENV_FILE"
  exit 1
fi

echo "ENV OK: all $((${#REQUIRED_KEYS[@]})) required keys present"
