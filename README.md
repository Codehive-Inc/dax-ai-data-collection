# DAX AI Data Collection & Curation Platform

A comprehensive React-based web application for curating and refining AI-generated DAX formulas for BI migration projects. This tool enables BI developers to interactively correct AI model outputs, add new examples, and manage training datasets with persistent file storage.

![App Screenshot](https://via.placeholder.com/800x400/2c3e50/ffffff?text=DAX+Curation+App)

## 🚀 Features

### **Multi-Model Support**
- **Cognos to Power BI** (`/cognos-to-pbi`)
- **MicroStrategy to Power BI** (`/microstrategy-to-pbi`) 
- **Tableau to Power BI** (`/tableau-to-pbi`)

### **Interactive Curation Interface**
- **Two-pane layout**: Example list + Chat interface
- **Real-time chat** with AI for DAX refinement
- **"Use as Corrected DAX"** functionality for code blocks
- **Visual indicators** for user-added vs. original examples

### **Persistent File Storage**
- **FastAPI backend** for file management
- **Direct JSON file updates** - changes saved to actual files
- **Automatic backups** before any modifications
- **Latest 10 examples** limit per model type
- **Real-time synchronization** across users

### **Docker Deployment**
- **Containerized architecture** with Docker Compose
- **One-click deployment** with automated scripts
- **Production-ready** with Nginx and health checks
- **Cross-platform** deployment scripts (Windows/Linux/Mac)

### **CI/CD Integration**
- **GitHub Actions** workflow for submodule management
- **Automated cleanup** on pull requests
- **Branch protection** and merge automation

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   MicroStrategy  │───▶│   JSON Files    │
│   (Frontend)    │    │   DAX API        │    │   (Storage)     │
│   Port 3000     │    │   Port 8080      │    │   data/         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │
        └────────────────────────┘
              Docker Network
```

## 🚀 Quick Start

### **Option 1: Docker Deployment (Recommended)**

**Windows:**
```batch
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Manual Docker:**
```bash
git clone --recursive git@github-profile2:Codehive-Inc/dax-ai-data-collection.git
cd dax-ai-data-collection
docker compose up -d
```

### **Option 2: Development Setup**

**Prerequisites:**
- Node.js (v14+)
- Python 3.8+
- Docker Desktop (for containerized deployment)

**Installation:**
```bash
# Clone repository
git clone --recursive git@github-profile2:Codehive-Inc/dax-ai-data-collection.git
cd dax-ai-data-collection

# Install frontend dependencies
npm install

# Start development servers
npm start                    # Terminal 1 (React)
./start-backend.sh          # Terminal 2 (FastAPI)
```

## 📁 Project Structure

```
dax-ai-data-collection/
├── .github/workflows/           # GitHub Actions
│   └── remove-submodules.yml   # Submodule cleanup workflow
├── public/
│   ├── data/                   # JSON example files
│   │   ├── cognos-examples.json
│   │   ├── microstrategy-examples.json
│   │   └── tableau-examples.json
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CurationApp.js      # Main application
│   │   ├── ExamplesList.js     # Left pane - examples
│   │   ├── ChatInterface.js    # Right pane - chat
│   │   ├── AddExampleModal.js  # Add new example modal
│   │   └── Toast.js            # Notifications
│   ├── utils/
│   │   ├── dataUtils.js        # API integration
│   │   └── apiUtils.js         # Chat API utilities
│   ├── App.js                  # Router setup
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
├── microstrategy-dax-api/      # Git submodule
│   ├── modules/routes/
│   │   ├── chat_routes.py      # Chat endpoints
│   │   └── file_management_routes.py  # File management
│   ├── main.py                 # FastAPI application
│   └── Dockerfile              # API container
├── docker-compose.yml          # Container orchestration
├── Dockerfile                  # React container
├── nginx.conf                  # Nginx configuration
├── deploy.bat                  # Windows deployment script
├── deploy.sh                   # Linux/Mac deployment script
├── DOCKER_DEPLOYMENT.md        # Detailed deployment guide
└── package.json                # Node.js dependencies
```

## 🔧 API Endpoints

### **MicroStrategy DAX API (Port 8080)**
- `POST /api/chat/` - Chat with AI model
- `GET /api/examples/{model_type}` - Get all examples
- `POST /api/examples/add` - Add new example
- `POST /api/examples/update-correction` - Update corrected DAX
- `GET /health` - Service health status

### **Chat Gateway (Port 3001)**
- `POST /api/v1/chat` - Chat proxy for other models
- `GET /health` - Gateway health status

## 📊 Usage Workflow

### **1. Access the Application**
- **Main App**: http://localhost:3000
- **Cognos Migration**: http://localhost:3000/cognos-to-pbi
- **MicroStrategy Migration**: http://localhost:3000/microstrategy-to-pbi
- **Tableau Migration**: http://localhost:3000/tableau-to-pbi

### **2. Add New Examples**
1. Click **"+ Add New Example"**
2. Fill in source expression and target DAX formula
3. Click **"Add Example"** - saves directly to JSON file

### **3. Curate Existing Examples**
1. Click on any example in the left pane
2. Use the chat interface to refine the DAX formula
3. Click **"Use as Corrected DAX"** on improved formulas
4. Changes are automatically saved to the file

### **4. Monitor Progress**
- Examples are limited to latest 10 per model type
- Automatic backups created before any changes
- Real-time updates across all users

## 🐳 Docker Deployment

### **Services**
- **React Frontend**: Nginx-served production build
- **MicroStrategy DAX API**: Python FastAPI with health checks
- **Shared Network**: Internal communication between containers
- **Volume Persistence**: Data and logs preserved across restarts

### **Quick Commands**
```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild images
docker compose build --no-cache

# Health check
curl http://localhost:8080/health
```

### **Detailed Documentation**
See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for comprehensive deployment guide.

## 🔄 CI/CD & GitHub Actions

### **Submodule Management**
The repository includes a GitHub Actions workflow that automatically removes submodules from pull requests before merging to main:

- **Trigger**: Pull requests to main branch
- **Action**: Removes all submodules and cleans up configuration
- **Purpose**: Keeps main branch clean while allowing submodule development

### **Workflow Features**
- Automatic submodule detection
- Clean removal of `.gitmodules` and git configuration
- Automated commit and push to PR branch
- Summary reporting in GitHub Actions

## 🔒 Data Management

### **File Storage**
- **Location**: `microstrategy-dax-api/data/examples/`
- **Format**: JSON array of example objects
- **Limit**: Maximum 10 examples per file (latest kept)

### **Backup System**
- **Location**: `microstrategy-dax-api/data/backups/`
- **Format**: `{model}-examples-{timestamp}.json`
- **Trigger**: Before any file modification

### **Example Structure**
```json
{
  "id": "unique-identifier",
  "sourceExpression": "Original BI tool expression",
  "targetDaxFormula": "Initial AI conversion",
  "correctedDaxFormula": "User-refined version",
  "isUserAdded": true
}
```

## 🔧 Configuration

### **Environment Variables**
```bash
# React (.env)
REACT_APP_MSTR_API_URL=http://localhost:8080
REACT_APP_API_BASE_URL=http://localhost:3001

# MicroStrategy DAX API
PORT=8080
HOST=0.0.0.0
ENVIRONMENT=production
ALLOWED_ORIGINS=http://localhost:3000
```

### **Docker Environment**
```yaml
# docker-compose.yml
environment:
  - PORT=8080
  - HOST=0.0.0.0
  - ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request (submodules will be automatically removed)

## 🆘 Support

### **Common Issues**

**Docker Issues:**
```bash
# Check Docker status
docker --version
docker compose version

# View container logs
docker compose logs -f

# Restart services
docker compose restart
```

**Port Conflicts:**
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# Kill conflicting processes
sudo kill -9 <PID>
```

**Submodule Issues:**
```bash
# Update submodules
git submodule update --init --recursive --remote

# Reset submodule
git submodule deinit -f microstrategy-dax-api
git submodule update --init
```

### **Getting Help**
- Check [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for detailed deployment guide
- Review [Issues](../../issues) page
- Check container logs: `docker compose logs -f`
- Verify health endpoints: `curl http://localhost:8080/health`

## 🎯 Roadmap

- [x] Docker containerization with Docker Compose
- [x] GitHub Actions for submodule management
- [x] Automated deployment scripts
- [x] Production-ready Nginx configuration
- [ ] Real AI model integration (OpenAI, Azure OpenAI)
- [ ] User authentication and permissions
- [ ] Advanced DAX validation
- [ ] Kubernetes deployment manifests
- [ ] Advanced search and filtering
- [ ] Analytics dashboard for curation progress

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the BI migration community**
