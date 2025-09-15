# AI Model Fine-Tuning Curation App

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

### **Add New Examples**
- **Modal interface** for adding new migration examples
- **Immediate file persistence** via API
- **Automatic reload** to show updated examples

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   FastAPI        │───▶│   JSON Files    │
│   (Frontend)    │    │   (Backend)      │    │   (Storage)     │
│   Port 3000     │    │   Port 3001      │    │   public/data/  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js (v14+)
- Python 3.8+
- npm or yarn

### **1. Clone Repository**
```bash
git clone <repository-url>
cd dax-ai-data-collection
```

### **2. Install Frontend Dependencies**
```bash
npm install
```

### **3. Install Backend Dependencies**
```bash
# Option 1: Using the startup script
chmod +x start-backend.sh
./start-backend.sh

# Option 2: Manual setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-backend.txt
```

### **4. Start Both Services**

**Terminal 1 (Backend):**
```bash
./start-backend.sh
# OR manually:
# source venv/bin/activate
# python file-management-api.py
```

**Terminal 2 (Frontend):**
```bash
npm start
```

### **5. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs

## 📁 Project Structure

```
dax-ai-data-collection/
├── public/
│   ├── data/                          # JSON example files
│   │   ├── cognos-examples.json
│   │   ├── microstrategy-examples.json
│   │   └── tableau-examples.json
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CurationApp.js            # Main application
│   │   ├── ExamplesList.js           # Left pane - examples
│   │   ├── ChatInterface.js          # Right pane - chat
│   │   ├── AddExampleModal.js        # Add new example modal
│   │   └── Toast.js                  # Notifications
│   ├── utils/
│   │   ├── dataUtils.js              # API integration
│   │   └── apiUtils.js               # Chat API utilities
│   ├── App.js                        # Router setup
│   ├── index.js                      # Entry point
│   └── index.css                     # Global styles
├── backups/                          # Automatic backups
├── file-management-api.py            # FastAPI backend
├── requirements-backend.txt          # Python dependencies
├── start-backend.sh                  # Backend startup script
└── package.json                      # Node.js dependencies
```

## 🔧 API Endpoints

### **File Management**
- `GET /api/v1/examples/{model_type}` - Get all examples
- `POST /api/v1/examples/add` - Add new example
- `POST /api/v1/examples/update-correction` - Update corrected DAX
- `GET /api/v1/backups/{model_type}` - List backups
- `DELETE /api/v1/examples/{model_type}` - Reset examples

### **AI Chat**
- `POST /api/v1/chat` - Chat with AI model

### **Health Check**
- `GET /health` - Service health status

## 📊 Usage Workflow

### **1. Select Migration Path**
Navigate to one of the three migration routes based on your source system.

### **2. Add New Examples**
1. Click **"+ Add New Example"**
2. Fill in source expression and target DAX formula
3. Click **"Add Example"** - saves directly to JSON file

### **3. Curate Existing Examples**
1. Click on any example in the left pane
2. Use the chat interface to refine the DAX formula
3. Click **"Use as Corrected DAX"** on improved formulas
4. Changes are automatically saved to the file

### **4. View Results**
- Examples are limited to latest 10 per model type
- Automatic backups created before any changes
- Real-time updates across all users

## 🔒 Data Management

### **File Storage**
- **Location**: `public/data/{model}-examples.json`
- **Format**: JSON array of example objects
- **Limit**: Maximum 10 examples per file (latest kept)

### **Backup System**
- **Location**: `backups/` directory
- **Format**: `{model}-examples-{timestamp}.json`
- **Trigger**: Before any file modification

### **Example Structure**
```json
{
  "id": "unique-identifier",
  "sourceExpression": "Original BI tool expression",
  "targetDaxFormula": "Initial AI conversion",
  "correctedDaxFormula": "User-refined version"
}
```

## 🚀 Deployment

### **Development**
```bash
# Start both services locally
./start-backend.sh    # Terminal 1
npm start            # Terminal 2
```

### **Production**
```bash
# Build React app
npm run build

# Serve with FastAPI
pip install fastapi uvicorn
uvicorn file-management-api:app --host 0.0.0.0 --port 3001

# Serve React build (use nginx, Apache, or similar)
```

### **Docker (Optional)**
```dockerfile
# Dockerfile example for backend
FROM python:3.9
WORKDIR /app
COPY requirements-backend.txt .
RUN pip install -r requirements-backend.txt
COPY file-management-api.py .
EXPOSE 3001
CMD ["python", "file-management-api.py"]
```

## 🔧 Configuration

### **Environment Variables**
```bash
# React (.env)
REACT_APP_API_BASE_URL=http://localhost:3001

# FastAPI
DATA_DIR=public/data
BACKUP_DIR=backups
```

### **Customization**
- **Add new model types**: Update model validation in backend
- **Change example limit**: Modify `max_examples` parameter
- **Custom AI integration**: Replace mock chat responses
- **Styling**: Edit CSS classes in `src/index.css`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Common Issues**

**Backend not starting:**
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements-backend.txt
```

**Frontend build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**File permission errors:**
```bash
# Make startup script executable
chmod +x start-backend.sh
```

### **Getting Help**
- Check the [Issues](../../issues) page
- Review API documentation at http://localhost:3001/docs
- Examine browser console for frontend errors
- Check backend logs for API errors

## 🎯 Roadmap

- [ ] Real AI model integration (OpenAI, Azure OpenAI)
- [ ] User authentication and permissions
- [ ] Advanced DAX validation
- [ ] Export to multiple formats (JSONL, CSV, Excel)
- [ ] Batch import functionality
- [ ] Advanced search and filtering
- [ ] Analytics dashboard for curation progress

---

**Built with ❤️ for the BI migration community**