#!/bin/bash

# Quick Deploy Script for GatherGuru
# This script provides a simplified deployment process

set -e

echo "🚀 GatherGuru Quick Deploy Script"
echo "=================================="

# Colors
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

# Check if we're in the right directory
if [ ! -f "Backend/package.json" ] || [ ! -f "Frontend/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if .env files exist
if [ ! -f "Backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from template..."
    cp Backend/env.example Backend/.env
    print_warning "Please update Backend/.env with your production values"
fi

if [ ! -f "Frontend/.env" ]; then
    print_warning "Frontend .env file not found. Creating from template..."
    cp Frontend/env.example Frontend/.env
    print_warning "Please update Frontend/.env with your production values"
fi

# Build frontend
print_status "Building frontend..."
cd Frontend
npm install
npm run build
cd ..

# Check if deployment script exists
if [ ! -f "deploy.sh" ]; then
    print_error "deploy.sh not found. Please ensure all deployment files are present."
    exit 1
fi

# Make deployment script executable
chmod +x deploy.sh

print_status "Deployment files are ready!"
echo ""
print_warning "Next steps:"
echo "1. Set up your AWS EC2 instance"
echo "2. Configure MongoDB Atlas"
echo "3. Create S3 bucket for file uploads"
echo "4. Update environment variables in Backend/.env and Frontend/.env"
echo "5. Upload your code to EC2 and run: sudo ./deploy.sh"
echo ""
print_status "For detailed instructions, see: AWS_DEPLOYMENT_GUIDE.md" 