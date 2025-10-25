#!/bin/bash

# NewsHub Health Check Script
# This script checks the health of all services

set -e

# Configuration
API_URL=${API_URL:-"http://localhost:3000"}
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/newshub"}
REDIS_URL=${REDIS_URL:-"redis://localhost:6379"}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check MongoDB connection
check_mongodb() {
    print_status "Checking MongoDB connection..."
    if mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_status "MongoDB is healthy"
        return 0
    else
        print_error "MongoDB connection failed"
        return 1
    fi
}

# Check Redis connection
check_redis() {
    print_status "Checking Redis connection..."
    if redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
        print_status "Redis is healthy"
        return 0
    else
        print_error "Redis connection failed"
        return 1
    fi
}

# Check API health
check_api() {
    print_status "Checking API health..."
    if curl -f -s "$API_URL/api/health" > /dev/null 2>&1; then
        print_status "API is healthy"
        return 0
    else
        print_error "API health check failed"
        return 1
    fi
}

# Check database collections
check_database() {
    print_status "Checking database collections..."
    
    # Check if required collections exist
    COLLECTIONS=$(mongosh "$MONGODB_URI" --quiet --eval "db.getCollectionNames()" | tr -d '[]"' | tr ',' '\n' | tr -d ' ')
    
    REQUIRED_COLLECTIONS=("articles" "categories" "sources")
    
    for collection in "${REQUIRED_COLLECTIONS[@]}"; do
        if echo "$COLLECTIONS" | grep -q "^$collection$"; then
            print_status "Collection '$collection' exists"
        else
            print_warning "Collection '$collection' is missing"
        fi
    done
}

# Check disk space
check_disk_space() {
    print_status "Checking disk space..."
    DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -lt 80 ]; then
        print_status "Disk usage is healthy: ${DISK_USAGE}%"
    elif [ "$DISK_USAGE" -lt 90 ]; then
        print_warning "Disk usage is high: ${DISK_USAGE}%"
    else
        print_error "Disk usage is critical: ${DISK_USAGE}%"
        return 1
    fi
}

# Check memory usage
check_memory() {
    print_status "Checking memory usage..."
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        print_status "Memory usage is healthy: ${MEMORY_USAGE}%"
    elif [ "$MEMORY_USAGE" -lt 90 ]; then
        print_warning "Memory usage is high: ${MEMORY_USAGE}%"
    else
        print_error "Memory usage is critical: ${MEMORY_USAGE}%"
        return 1
    fi
}

# Main health check
main() {
    echo "🏥 NewsHub Health Check"
    echo "======================="
    
    local exit_code=0
    
    # Run all checks
    check_mongodb || exit_code=1
    check_redis || exit_code=1
    check_api || exit_code=1
    check_database
    check_disk_space || exit_code=1
    check_memory || exit_code=1
    
    echo "======================="
    
    if [ $exit_code -eq 0 ]; then
        print_status "All health checks passed!"
    else
        print_error "Some health checks failed!"
    fi
    
    exit $exit_code
}

# Run main function
main "$@"
