# Docker Deployment Guide

## Overview
This guide explains how to deploy the DAX AI Data Collection application using Docker containers. The application consists of two main services:

1. **React Frontend** - User interface for DAX formula curation
2. **MicroStrategy DAX API** - Backend API for formula conversion and file management

## Prerequisites

### Required Software
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git** with SSH key access to GitHub
- **curl** (for health checks)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: 2GB free space
- **Network**: Internet access for pulling images and code

## Quick Start

### Windows Users
```batch
# Run the deployment script
deploy.bat
```

### Linux/Mac Users
```bash
# Make script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

## Manual Deployment

If you prefer to run commands manually:

### 1. Clone Repository
```bash
git clone --recursive git@github-profile2:Codehive-Inc/dax-ai-data-collection.git
cd dax-ai-data-collection

# Ensure submodule is on correct branch
cd microstrategy-dax-api
git checkout 02_dax-chat-endpoints
cd ..
```

### 2. Build and Start Services
```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps
```

### 3. Verify Deployment
```bash
# Check API health
curl http://localhost:8080/health

# Check frontend
curl http://localhost:3000
```

## Service Configuration

### React Frontend Container
- **Image**: Custom Node.js + Nginx
- **Port**: 3000 (external) → 80 (internal)
- **Build**: Multi-stage build for optimization
- **Proxy**: API requests forwarded to backend

### MicroStrategy DAX API Container
- **Image**: Python 3.13 slim
- **Port**: 8080
- **Volumes**: Data and logs persistence
- **Health Check**: Automatic health monitoring

## Environment Variables

### React Frontend
```env
REACT_APP_MSTR_API_URL=http://localhost:8080
REACT_APP_API_BASE_URL=http://localhost:3001
```

### MicroStrategy DAX API
```env
PORT=8080
HOST=0.0.0.0
ENVIRONMENT=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
```

## Docker Compose Services

### Network Configuration
- **Network**: `dax-network` (bridge driver)
- **Internal Communication**: Services communicate via container names
- **External Access**: Ports exposed to host

### Volume Mounts
```yaml
volumes:
  - ./microstrategy-dax-api/data:/app/data      # Training data persistence
  - ./microstrategy-dax-api/logs:/app/logs      # Application logs
```

## Accessing the Application

### Web Interfaces
- **Main Application**: http://localhost:3000
- **Cognos Migration**: http://localhost:3000/cognos-to-pbi
- **MicroStrategy Migration**: http://localhost:3000/microstrategy-to-pbi
- **Tableau Migration**: http://localhost:3000/tableau-to-pbi

### API Endpoints
- **API Documentation**: http://localhost:8080/docs
- **Health Check**: http://localhost:8080/health
- **Chat Endpoint**: http://localhost:8080/api/chat/
- **Examples**: http://localhost:8080/api/examples/

## Management Commands

### Container Management
```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f react-app
docker compose logs -f mstr-dax-api

# Restart services
docker compose restart

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Image Management
```bash
# Rebuild images
docker compose build --no-cache

# Pull latest images
docker compose pull

# Remove unused images
docker image prune -f
```

### Data Management
```bash
# Backup training data
cp -r microstrategy-dax-api/data ./backup-$(date +%Y%m%d)

# View data files
ls -la microstrategy-dax-api/data/examples/
ls -la microstrategy-dax-api/data/backups/
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# Kill process using port
sudo kill -9 <PID>
```

#### 2. Container Won't Start
```bash
# Check container logs
docker compose logs <service-name>

# Check container status
docker compose ps

# Restart specific service
docker compose restart <service-name>
```

#### 3. API Not Responding
```bash
# Check API health
curl -v http://localhost:8080/health

# Check container network
docker network ls
docker network inspect dax-ai-data-collection_dax-network
```

#### 4. Build Failures
```bash
# Clean build cache
docker builder prune -f

# Rebuild without cache
docker compose build --no-cache

# Check Docker disk space
docker system df
```

### Health Checks

#### Automated Health Check
The MicroStrategy DAX API includes automatic health monitoring:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

#### Manual Health Verification
```bash
# API Health
curl http://localhost:8080/health | jq .

# Frontend Health
curl -I http://localhost:3000

# Test API Functionality
curl -X POST "http://localhost:8080/api/chat/" \
  -H "Content-Type: application/json" \
  -d '{"model_type": "microstrategy", "messages": [{"role": "user", "content": "test"}]}'
```

## Production Considerations

### Security
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper firewall rules
- [ ] Use environment-specific secrets
- [ ] Enable container security scanning

### Performance
- [ ] Configure resource limits
- [ ] Set up horizontal scaling
- [ ] Implement caching strategies
- [ ] Monitor resource usage

### Monitoring
- [ ] Set up log aggregation
- [ ] Configure health monitoring
- [ ] Implement alerting
- [ ] Track performance metrics

### Backup Strategy
- [ ] Automated data backups
- [ ] Database backup procedures
- [ ] Configuration backup
- [ ] Disaster recovery plan

## Development vs Production

### Development Setup
```bash
# Use development compose file
docker compose -f docker-compose.dev.yml up -d

# Enable hot reloading
# Mount source code as volumes
```

### Production Setup
```bash
# Use production optimizations
docker compose -f docker-compose.prod.yml up -d

# Configure reverse proxy (nginx/traefik)
# Set up SSL certificates
# Configure monitoring
```

## Support

### Getting Help
1. Check the logs: `docker compose logs -f`
2. Verify health checks: `curl http://localhost:8080/health`
3. Review this documentation
4. Check GitHub issues: https://github.com/Codehive-Inc/dax-ai-data-collection/issues

### Reporting Issues
When reporting issues, please include:
- Docker version: `docker --version`
- Docker Compose version: `docker compose version`
- Container logs: `docker compose logs`
- System information: OS, RAM, available disk space
- Steps to reproduce the issue

## Updates and Maintenance

### Updating the Application
```bash
# Pull latest code
git pull origin main
git submodule update --remote

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Regular Maintenance
- **Weekly**: Check logs and clean up old images
- **Monthly**: Update base images and dependencies
- **Quarterly**: Review security updates and backup procedures
