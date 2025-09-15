#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="git@github-profile2:Codehive-Inc/dax-ai-data-collection.git"
PROJECT_DIR="dax-ai-data-collection"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}========================================"
echo -e "  DAX AI Data Collection - Docker Deploy"
echo -e "========================================${NC}"
echo

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed and running
log "Checking Docker status..."
if ! command -v docker &> /dev/null; then
    error "Docker is not installed!"
    echo "Please install Docker Desktop and make sure it's running."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    error "Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

success "Docker is available"
echo

# Check if Docker Compose is available
log "Checking Docker Compose..."
if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
    error "Docker Compose is not available!"
    echo "Please make sure Docker Desktop includes Docker Compose."
    exit 1
fi

success "Docker Compose is available"
echo

# Stop existing containers if running
log "Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true
echo

# Clean up old images (optional)
log "Cleaning up old images..."
docker image prune -f
echo

# Check if project directory exists
if [ -d "$PROJECT_DIR" ]; then
    log "Project directory exists, updating code..."
    cd "$PROJECT_DIR"
    
    # Pull latest changes
    log "Pulling latest changes from main branch..."
    git fetch origin
    git reset --hard origin/main
    
    # Update submodules
    log "Updating submodules..."
    git submodule update --init --recursive --remote
    
    # Switch to the correct branch in submodule
    cd microstrategy-dax-api
    git checkout 02_dax-chat-endpoints
    git pull origin 02_dax-chat-endpoints
    cd ..
    
else
    log "Cloning repository..."
    if ! git clone --recursive "$REPO_URL"; then
        error "Failed to clone repository!"
        echo "Please check your SSH keys and repository access."
        exit 1
    fi
    cd "$PROJECT_DIR"
    
    # Ensure submodule is on correct branch
    cd microstrategy-dax-api
    git checkout 02_dax-chat-endpoints
    cd ..
fi

success "Code updated successfully"
echo

# Create necessary directories
log "Creating necessary directories..."
mkdir -p microstrategy-dax-api/data/examples
mkdir -p microstrategy-dax-api/data/backups
mkdir -p microstrategy-dax-api/logs
success "Directories created"
echo

# Build and start containers
log "Building Docker images..."
if ! docker compose build --no-cache; then
    error "Failed to build Docker images!"
    exit 1
fi
success "Images built successfully"
echo

log "Starting containers..."
if ! docker compose up -d; then
    error "Failed to start containers!"
    exit 1
fi
success "Containers started successfully"
echo

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 10

# Check service health
log "Checking service health..."
echo

# Check MicroStrategy DAX API
echo -n "Checking MicroStrategy DAX API... "
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    success "MicroStrategy DAX API is healthy"
else
    warning "MicroStrategy DAX API might still be starting..."
fi

# Check React Frontend
echo -n "Checking React Frontend... "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    success "React Frontend is accessible"
else
    warning "React Frontend might still be starting..."
fi

echo
echo -e "${GREEN}========================================"
echo -e "  DEPLOYMENT COMPLETED!"
echo -e "========================================${NC}"
echo
echo -e "${BLUE}🌐 Services are now running:${NC}"
echo "  • React Frontend:        http://localhost:3000"
echo "  • MicroStrategy DAX API: http://localhost:8080"
echo "  • API Documentation:     http://localhost:8080/docs"
echo
echo -e "${BLUE}📊 Test the application:${NC}"
echo "  • Cognos to Power BI:      http://localhost:3000/cognos-to-pbi"
echo "  • MicroStrategy to Power BI: http://localhost:3000/microstrategy-to-pbi"
echo "  • Tableau to Power BI:     http://localhost:3000/tableau-to-pbi"
echo
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo "  • View logs:          docker compose logs -f"
echo "  • Stop services:      docker compose down"
echo "  • Restart services:   docker compose restart"
echo "  • View containers:    docker compose ps"
echo
echo "Deployment completed at: $(date)"
echo

# Ask if user wants to view logs
read -p "Would you like to view the logs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo
    echo "Opening logs... (Press Ctrl+C to exit)"
    docker compose logs -f
fi

