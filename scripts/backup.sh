#!/bin/bash

# NewsHub Database Backup Script
# This script creates backups of the MongoDB database

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="newshub_backup_${DATE}"
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/newshub"}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_status "Starting backup process..."

# Create MongoDB backup
print_status "Creating MongoDB backup..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME"

if [ $? -eq 0 ]; then
    print_status "MongoDB backup created successfully"
else
    print_error "MongoDB backup failed"
    exit 1
fi

# Compress backup
print_status "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd ..

print_status "Backup compressed: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"

# Clean old backups (keep last 7 days)
print_status "Cleaning old backups..."
find "$BACKUP_DIR" -name "newshub_backup_*.tar.gz" -mtime +7 -delete

print_status "Backup process completed successfully!"

# Optional: Upload to cloud storage
if [ ! -z "$AWS_S3_BUCKET" ]; then
    print_status "Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" "s3://$AWS_S3_BUCKET/backups/"
    print_status "Upload to S3 completed"
fi

if [ ! -z "$GOOGLE_CLOUD_BUCKET" ]; then
    print_status "Uploading to Google Cloud..."
    gsutil cp "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" "gs://$GOOGLE_CLOUD_BUCKET/backups/"
    print_status "Upload to Google Cloud completed"
fi
