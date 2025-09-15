"""
FastAPI Backend for File Management
Handles reading, writing, and updating JSON example files
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime
import shutil

app = FastAPI(title="DAX Curation File Management API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class ExampleModel(BaseModel):
    id: str
    sourceExpression: str
    targetDaxFormula: str
    correctedDaxFormula: Optional[str] = ""

class AddExampleRequest(BaseModel):
    modelType: str  # "cognos", "microstrategy", "tableau"
    example: ExampleModel

class UpdateCorrectionRequest(BaseModel):
    modelType: str
    exampleId: str
    correctedDaxFormula: str

class ChatRequest(BaseModel):
    model_type: str
    messages: List[Dict[str, str]]

class ChatResponse(BaseModel):
    reply: Dict[str, str]

# File paths
DATA_DIR = "public/data"
BACKUP_DIR = "backups"

def get_file_path(model_type: str) -> str:
    """Get the file path for a model type"""
    return os.path.join(DATA_DIR, f"{model_type}-examples.json")

def create_backup(model_type: str) -> str:
    """Create a backup of the current file"""
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    source_file = get_file_path(model_type)
    if os.path.exists(source_file):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(BACKUP_DIR, f"{model_type}-examples-{timestamp}.json")
        shutil.copy2(source_file, backup_file)
        return backup_file
    return ""

def load_examples(model_type: str) -> List[Dict]:
    """Load examples from JSON file"""
    file_path = get_file_path(model_type)
    
    if not os.path.exists(file_path):
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return []

def save_examples(model_type: str, examples: List[Dict], max_examples: int = 10) -> bool:
    """Save examples to JSON file, keeping only the latest max_examples"""
    try:
        # Create backup before saving
        create_backup(model_type)
        
        # Keep only the latest examples
        latest_examples = examples[-max_examples:] if len(examples) > max_examples else examples
        
        # Ensure data directory exists
        os.makedirs(DATA_DIR, exist_ok=True)
        
        file_path = get_file_path(model_type)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(latest_examples, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error saving {file_path}: {e}")
        return False

@app.get("/api/v1/examples/{model_type}")
async def get_examples(model_type: str):
    """Get all examples for a model type"""
    if model_type not in ["cognos", "microstrategy", "tableau"]:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    examples = load_examples(model_type)
    return {"examples": examples}

@app.post("/api/v1/examples/add")
async def add_example(request: AddExampleRequest):
    """Add a new example to the file"""
    try:
        if request.modelType not in ["cognos", "microstrategy", "tableau"]:
            raise HTTPException(status_code=400, detail="Invalid model type")
        
        # Load existing examples
        examples = load_examples(request.modelType)
        
        # Add new example
        new_example = {
            "id": request.example.id,
            "sourceExpression": request.example.sourceExpression,
            "targetDaxFormula": request.example.targetDaxFormula,
            "correctedDaxFormula": request.example.correctedDaxFormula or ""
        }
        
        examples.append(new_example)
        
        # Save with max 10 examples
        success = save_examples(request.modelType, examples, max_examples=10)
        
        if success:
            return {"success": True, "message": "Example added successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save example")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding example: {str(e)}")

@app.post("/api/v1/examples/update-correction")
async def update_correction(request: UpdateCorrectionRequest):
    """Update the corrected DAX formula for an example"""
    try:
        if request.modelType not in ["cognos", "microstrategy", "tableau"]:
            raise HTTPException(status_code=400, detail="Invalid model type")
        
        # Load existing examples
        examples = load_examples(request.modelType)
        
        # Find and update the example
        updated = False
        for example in examples:
            if example.get("id") == request.exampleId:
                example["correctedDaxFormula"] = request.correctedDaxFormula
                updated = True
                break
        
        if not updated:
            raise HTTPException(status_code=404, detail="Example not found")
        
        # Save updated examples
        success = save_examples(request.modelType, examples, max_examples=10)
        
        if success:
            return {"success": True, "message": "Correction updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save correction")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating correction: {str(e)}")

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint for AI model interaction"""
    try:
        # This is a mock implementation - replace with your actual AI model integration
        model_type = request.model_type
        messages = request.messages
        
        # Get the last user message
        user_messages = [msg for msg in messages if msg.get("role") == "user"]
        if not user_messages:
            raise HTTPException(status_code=400, detail="No user message found")
        
        last_message = user_messages[-1].get("content", "")
        
        # Generate mock response based on content
        if "VAR" in last_message.upper():
            response_content = """Here's the DAX formula using VAR for better readability:

```dax
VAR TotalRevenue = SUM([Revenue])
VAR TotalUnits = SUM([Units])
RETURN
    DIVIDE(TotalRevenue, TotalUnits)
```

This approach stores intermediate calculations in variables, making the formula easier to read and maintain."""
        elif "OPTIMIZE" in last_message.upper():
            response_content = """Here's an optimized version of the DAX formula:

```dax
CALCULATE(
    DIVIDE(SUM([Revenue]), SUM([Units])),
    REMOVEFILTERS()
)
```

This version uses CALCULATE with REMOVEFILTERS for better performance."""
        else:
            response_content = """I understand you want to refine the DAX formula. Here's an improved version:

```dax
SUMX(
    VALUES(Sales[ProductKey]),
    DIVIDE([Revenue], [Units])
)
```

This uses SUMX for row-by-row calculation which can be more accurate for this type of division."""
        
        return ChatResponse(
            reply={
                "role": "assistant",
                "content": response_content
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/api/v1/backups/{model_type}")
async def list_backups(model_type: str):
    """List available backups for a model type"""
    if model_type not in ["cognos", "microstrategy", "tableau"]:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    if not os.path.exists(BACKUP_DIR):
        return {"backups": []}
    
    backups = []
    for filename in os.listdir(BACKUP_DIR):
        if filename.startswith(f"{model_type}-examples-") and filename.endswith(".json"):
            backups.append(filename)
    
    backups.sort(reverse=True)  # Most recent first
    return {"backups": backups}

@app.delete("/api/v1/examples/{model_type}")
async def reset_examples(model_type: str):
    """Reset examples to original state (useful for testing)"""
    if model_type not in ["cognos", "microstrategy", "tableau"]:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    try:
        # Create backup before reset
        create_backup(model_type)
        
        # Load original sample data (you might want to have original files)
        file_path = get_file_path(model_type)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return {"success": True, "message": f"Reset {model_type} examples successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting examples: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "data_directory": DATA_DIR,
        "backup_directory": BACKUP_DIR
    }

if __name__ == "__main__":
    import uvicorn
    
    # Ensure directories exist
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    uvicorn.run(app, host="0.0.0.0", port=3001)

"""
USAGE:

1. Install dependencies:
   pip install fastapi uvicorn

2. Run the server:
   python file-management-api.py

3. The API will be available at:
   http://localhost:3001

4. API Endpoints:
   - GET /api/v1/examples/{model_type} - Get all examples
   - POST /api/v1/examples/add - Add new example
   - POST /api/v1/examples/update-correction - Update corrected DAX
   - POST /api/v1/chat - Chat with AI model
   - GET /api/v1/backups/{model_type} - List backups
   - DELETE /api/v1/examples/{model_type} - Reset examples
   - GET /health - Health check

5. Features:
   - Automatic backups before any changes
   - Keeps only latest 10 examples per model type
   - File-based storage in public/data/
   - CORS enabled for React frontend
"""
