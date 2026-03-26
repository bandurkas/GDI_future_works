#!/bin/bash

# Configuration
BACKUP_DIR="../backups"
PROJECT_NAME="gdi-futureworks-sync"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${PROJECT_NAME}_${TIMESTAMP}.tar.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "📦 Creating local backup: $BACKUP_FILE..."

# Create the archive, excluding bulky directories
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude="node_modules" \
    --exclude=".next" \
    --exclude=".git" \
    .

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully at: $BACKUP_DIR/$BACKUP_FILE"
else
    echo "❌ Backup failed!"
    exit 1
fi
