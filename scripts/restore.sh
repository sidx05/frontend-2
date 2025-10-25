#!/bin/bash

# NewsHub Database Restore Script
# This script restores the MongoDB database from a backup

set -e

# Configuration
BACKUP_DIR="./backups"
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

# Check if backup file is provided
if [ -z "$1" ]; then
    print_error "Usage: $0 <backup_file.tar.gz>"
    print_status "Available backups:"
    ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || print_warning "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

print_warning "This will restore the database from backup: $BACKUP_FILE"
print_warning "This action will overwrite existing data!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Restore cancelled"
    exit 0
fi

# Extract backup
print_status "Extracting backup..."
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the database directory
DB_DIR=$(find "$TEMP_DIR" -name "newshub" -type d | head -1)
if [ -z "$DB_DIR" ]; then
    print_error "Could not find database directory in backup"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Restore database
print_status "Restoring database..."
mongorestore --uri="$MONGODB_URI" --drop "$DB_DIR"

if [ $? -eq 0 ]; then
    print_status "Database restored successfully"
else
    print_error "Database restore failed"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"

print_status "Restore process completed successfully!"
