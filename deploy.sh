#!/bin/bash

# GatherGuru AWS Free Tier Deployment Script
# This script deploys the application to AWS EC2 t3.micro (Free Tier)

set -e  # Exit on any error

echo "🚀 Starting GatherGuru Free Tier deployment to AWS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="gatherguru"
BACKEND_DIR="Backend"
FRONTEND_DIR="Frontend"
DEPLOY_DIR="/var/www/gatherguru"

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js and npm
print_status "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Install nginx
print_status "Installing nginx..."
apt install -y nginx

# Create deployment directory
print_status "Creating deployment directory..."
mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/logs
mkdir -p $DEPLOY_DIR/uploads/event-banners
mkdir -p $DEPLOY_DIR/uploads/profile-images

# Copy backend files
print_status "Deploying backend..."
cp -r $BACKEND_DIR/* $DEPLOY_DIR/

# Install backend dependencies
print_status "Installing backend dependencies..."
cd $DEPLOY_DIR
npm install --production

# Build frontend
print_status "Building frontend..."
cd ../$FRONTEND_DIR
npm install
npm run build

# Copy frontend build to backend
print_status "Copying frontend build to backend..."
cp -r dist/* $DEPLOY_DIR/

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f $DEPLOY_DIR/.env ]; then
    print_warning "Please create .env file in $DEPLOY_DIR with your production configuration"
    cp $DEPLOY_DIR/env.example $DEPLOY_DIR/.env
fi

# Set proper permissions
print_status "Setting permissions..."
chown -R www-data:www-data $DEPLOY_DIR
chmod -R 755 $DEPLOY_DIR
chmod -R 777 $DEPLOY_DIR/uploads  # Write permissions for uploads

# Start application with PM2
print_status "Starting application with PM2..."
cd $DEPLOY_DIR
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Configure nginx for free tier
print_status "Configuring nginx for free tier..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression (important for free tier)
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Client max body size for file uploads
    client_max_body_size 5M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings for free tier
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }

    # Serve uploaded files directly
    location /uploads/ {
        alias $DEPLOY_DIR/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

# Set up firewall (minimal for free tier)
print_status "Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Create maintenance script for free tier
print_status "Creating maintenance script..."
cat > $DEPLOY_DIR/maintenance.sh << 'EOF'
#!/bin/bash

# GatherGuru Free Tier Maintenance Script

echo "🧹 Running maintenance tasks..."

# Clean up old log files
find /var/www/gatherguru/logs -name "*.log" -mtime +7 -delete

# Clean up old uploaded files (older than 30 days)
find /var/www/gatherguru/uploads -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" | xargs -I {} find {} -mtime +30 -delete

# Check disk usage
echo "📊 Disk usage:"
df -h /

# Check memory usage
echo "💾 Memory usage:"
free -h

# Check application status
echo "🔍 Application status:"
pm2 status

# Restart application if needed
if ! pm2 list | grep -q "online"; then
    echo "⚠️  Application is down, restarting..."
    pm2 restart all
fi

echo "✅ Maintenance completed!"
EOF

chmod +x $DEPLOY_DIR/maintenance.sh

# Set up daily maintenance cron job
print_status "Setting up maintenance cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/gatherguru/maintenance.sh >> /var/www/gatherguru/logs/maintenance.log 2>&1") | crontab -

print_status "Free Tier deployment completed successfully! 🎉"
print_status "Your application is running on: http://your-domain.com"
print_status "Health check: http://your-domain.com/health"
print_status ""
print_warning "Free Tier Optimizations Applied:"
print_warning "✅ Single PM2 instance (no clustering)"
print_warning "✅ Reduced memory limits (512MB)"
print_warning "✅ Local file storage (no S3)"
print_warning "✅ Reduced rate limiting (50 req/15min)"
print_warning "✅ File size limit: 5MB"
print_warning "✅ Daily maintenance script"
print_status ""
print_warning "Don't forget to:"
print_warning "1. Update your domain name in nginx configuration"
print_warning "2. Set up SSL certificates (optional for free tier)"
print_warning "3. Configure your .env file with production values"
print_warning "4. Set up MongoDB Atlas connection"
print_warning "5. Monitor disk usage (free tier has 8GB storage)"
print_status ""
print_warning "Free Tier Limitations:"
print_warning "⚠️  Limited to 1GB RAM"
print_warning "⚠️  Limited to 8GB storage"
print_warning "⚠️  No auto-scaling"
print_warning "⚠️  Single instance only" 