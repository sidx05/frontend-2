#!/bin/bash

# NewsHub Deployment Script
# This script prepares and deploys the NewsHub application

set -e

echo "🚀 Starting NewsHub deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env() {
    print_status "Checking environment variables..."
    
    if [ -z "$MONGODB_URI" ]; then
        print_error "MONGODB_URI is not set"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        print_error "JWT_SECRET is not set"
        exit 1
    fi
    
    print_status "Environment variables check passed"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm ci --only=production
    print_status "Dependencies installed"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Build Next.js app
    npm run build
    
    print_status "Application built successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    npx prisma migrate deploy
    print_status "Database migrations completed"
}

# Start the application
start_app() {
    print_status "Starting application..."
    npm start
}

# Docker deployment
deploy_docker() {
    print_status "Deploying with Docker..."
    
    # Build Docker image
    docker build -t newshub:latest .
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || true
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    print_status "Docker deployment completed"
}

# Vercel deployment
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    print_status "Vercel deployment completed"
}

# Main deployment function
main() {
    case "${1:-build}" in
        "docker")
            check_env
            deploy_docker
            ;;
        "vercel")
            check_env
            install_deps
            build_app
            deploy_vercel
            ;;
        "build")
            check_env
            install_deps
            build_app
            run_migrations
            start_app
            ;;
        "migrate")
            check_env
            run_migrations
            ;;
        *)
            echo "Usage: $0 {build|docker|vercel|migrate}"
            echo "  build  - Build and start locally (default)"
            echo "  docker - Deploy using Docker"
            echo "  vercel - Deploy to Vercel"
            echo "  migrate - Run database migrations only"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
