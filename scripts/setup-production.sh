#!/bin/bash

# NewsHub Production Setup Script
# This script sets up the production environment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_warning "Running as root. This is not recommended for production."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Install system dependencies
install_dependencies() {
    print_header "Installing system dependencies..."
    
    # Update package list
    sudo apt update
    
    # Install Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install MongoDB
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    
    # Install Redis
    sudo apt-get install -y redis-server
    
    # Install Nginx
    sudo apt-get install -y nginx
    
    # Install PM2
    sudo npm install -g pm2
    
    # Install other utilities
    sudo apt-get install -y curl wget git unzip
    
    print_status "System dependencies installed"
}

# Configure MongoDB
configure_mongodb() {
    print_header "Configuring MongoDB..."
    
    # Start MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Create database and user
    mongosh --eval "
        use newshub;
        db.createUser({
            user: 'newshub',
            pwd: '${MONGO_PASSWORD:-newshub123}',
            roles: [{ role: 'readWrite', db: 'newshub' }]
        });
    "
    
    print_status "MongoDB configured"
}

# Configure Redis
configure_redis() {
    print_header "Configuring Redis..."
    
    # Start Redis
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    # Configure Redis for production
    sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
    sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
    
    # Restart Redis
    sudo systemctl restart redis-server
    
    print_status "Redis configured"
}

# Configure Nginx
configure_nginx() {
    print_header "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/newshub > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN:-localhost};
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api/socketio/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/newshub /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_status "Nginx configured"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    if [ ! -z "$DOMAIN" ] && [ "$DOMAIN" != "localhost" ]; then
        print_header "Setting up SSL with Let's Encrypt..."
        
        # Install Certbot
        sudo apt-get install -y certbot python3-certbot-nginx
        
        # Get certificate
        sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "${EMAIL:-admin@$DOMAIN}"
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        print_status "SSL configured"
    else
        print_warning "Skipping SSL setup (no domain configured)"
    fi
}

# Setup application
setup_application() {
    print_header "Setting up NewsHub application..."
    
    # Install dependencies
    npm ci --only=production
    
    # Build application
    npm run build
    
    # Setup PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    print_status "Application configured"
}

# Create ecosystem file
create_ecosystem() {
    print_header "Creating PM2 ecosystem file..."
    
    cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'newshub',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
    
    print_status "PM2 ecosystem file created"
}

# Setup monitoring
setup_monitoring() {
    print_header "Setting up monitoring..."
    
    # Create log directory
    mkdir -p logs
    
    # Setup log rotation
    sudo tee /etc/logrotate.d/newshub > /dev/null <<EOF
$(pwd)/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    print_status "Monitoring configured"
}

# Main setup function
main() {
    echo "🚀 NewsHub Production Setup"
    echo "============================"
    
    # Check if running as root
    check_root
    
    # Get configuration
    read -p "Enter domain name (or press Enter for localhost): " DOMAIN
    read -p "Enter email for SSL certificate: " EMAIL
    read -p "Enter MongoDB password (default: newshub123): " MONGO_PASSWORD
    
    # Install dependencies
    install_dependencies
    
    # Configure services
    configure_mongodb
    configure_redis
    configure_nginx
    
    # Setup SSL
    setup_ssl
    
    # Setup application
    create_ecosystem
    setup_application
    setup_monitoring
    
    echo "============================"
    print_status "Production setup completed!"
    print_status "Application is running on: http://${DOMAIN:-localhost}"
    print_status "Use 'pm2 status' to check application status"
    print_status "Use 'pm2 logs' to view logs"
}

# Run main function
main "$@"
