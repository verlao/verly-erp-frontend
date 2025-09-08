#!/bin/bash

# Deploy script for Verly ERP Frontend
# Usage: ./deploy.sh [production|staging]

set -e  # Exit on any error

# Configuration
ENV=${1:-production}
BUILD_DIR="dist"
REMOTE_USER="your-username"
REMOTE_HOST="your-server.com"
REMOTE_PATH="/var/www/painel.verlyvidracaria.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment for ${ENV} environment...${NC}"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory not found. Running build first...${NC}"
    npm run build
fi

# Validate build
if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}❌ Build validation failed. index.html not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build validation passed${NC}"

# Create deployment archive
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
tar -czf "verly-erp-frontend-${ENV}-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$BUILD_DIR" .

echo -e "${GREEN}✅ Archive created successfully${NC}"

# Instructions for manual deployment
echo -e "${YELLOW}📋 Manual deployment instructions:${NC}"
echo "1. Upload the archive to your server"
echo "2. Extract it to the web root directory"
echo "3. Configure your web server (Apache/Nginx)"
echo "4. Set up SSL certificate"
echo "5. Configure domain DNS"

echo -e "${YELLOW}🔧 Server configuration files created:${NC}"
echo "- .htaccess (for Apache)"
echo "- nginx.conf (for Nginx)"

echo -e "${YELLOW}📁 Files ready for deployment in: ${BUILD_DIR}/${NC}"
echo -e "${GREEN}🎉 Deployment preparation completed!${NC}"

# Optional: Uncomment the following lines for automatic deployment via SSH
# echo -e "${YELLOW}🚀 Uploading to server...${NC}"
# rsync -avz --delete "$BUILD_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
# echo -e "${GREEN}✅ Deployment completed successfully!${NC}"