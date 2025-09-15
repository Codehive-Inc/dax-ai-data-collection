"""
File Management Endpoints for DAX Curation App
Add these endpoints to your existing FastAPI application

INTEGRATION INSTRUCTIONS:
1. Copy the imports, models, and functions to your existing FastAPI app
2. Add the endpoints to your existing router or app
3. Ensure the DATA_DIR and BACKUP_DIR paths are correct for your setup
4. Update CORS settings to include your React app URL
"""

from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import os
import shutil
from datetime import datetime

# ============================================================================
# DATA MODELS - Add these to your existing FastAPI app
# ============================================================================

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

# ============================================================================
# CONFIGURATION - Adjust paths as needed for your setup
# ============================================================================

DATA_DIR = "public/data"  # Adjust this path for your setup
BACKUP_DIR = "backups"    # Adjust this path for your setup

# ============================================================================
# UTILITY FUNCTIONS - Add these to your existing FastAPI app
# ============================================================================

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

def load_examples_from_file(model_type: str) -> List[Dict]:
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

def save_examples_to_file(model_type: str, examples: List[Dict], max_examples: int = 10) -> bool:
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

# ============================================================================
# ENDPOINTS - Add these to your existing FastAPI app
# ============================================================================

# Add these endpoints to your existing FastAPI app instance
# Example: app.get("/api/v1/examples/{model_type}")(get_examples)

async def get_examples(model_type: str):
    """Get all examples for a model type"""
    if model_type not in ["cognos", "microstrategy", "tableau"]:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    examples = load_examples_from_file(model_type)
    return {"examples": examples}

async def add_example(request: AddExampleRequest):
    """Add a new example to the file"""
    try:
        if request.modelType not in ["cognos", "microstrategy", "tableau"]:
            raise HTTPException(status_code=400, detail="Invalid model type")
        
        # Load existing examples
        examples = load_examples_from_file(request.modelType)
        
        # Add new example
        new_example = {
            "id": request.example.id,
            "sourceExpression": request.example.sourceExpression,
            "targetDaxFormula": request.example.targetDaxFormula,
            "correctedDaxFormula": request.example.correctedDaxFormula or ""
        }
        
        examples.append(new_example)
        
        # Save with max 10 examples
        success = save_examples_to_file(request.modelType, examples, max_examples=10)
        
        if success:
            return {"success": True, "message": "Example added successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save example")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding example: {str(e)}")

async def update_correction(request: UpdateCorrectionRequest):
    """Update the corrected DAX formula for an example"""
    try:
        if request.modelType not in ["cognos", "microstrategy", "tableau"]:
            raise HTTPException(status_code=400, detail="Invalid model type")
        
        # Load existing examples
        examples = load_examples_from_file(request.modelType)
        
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
        success = save_examples_to_file(request.modelType, examples, max_examples=10)
        
        if success:
            return {"success": True, "message": "Correction updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save correction")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating correction: {str(e)}")

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

async def reset_examples(model_type: str):
    """Reset examples to original state (useful for testing)"""
    if model_type not in ["cognos", "microstrategy", "tableau"]:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    try:
        # Create backup before reset
        create_backup(model_type)
        
        # Remove the file to reset to original state
        file_path = get_file_path(model_type)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return {"success": True, "message": f"Reset {model_type} examples successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting examples: {str(e)}")

# ============================================================================
# INTEGRATION EXAMPLE
# ============================================================================

"""
EXAMPLE: How to integrate into your existing FastAPI app

from fastapi import FastAPI
from file_management_endpoints import *

app = FastAPI()

# Add CORS if needed
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add the file management endpoints
app.get("/api/v1/examples/{model_type}")(get_examples)
app.post("/api/v1/examples/add")(add_example)
app.post("/api/v1/examples/update-correction")(update_correction)
app.get("/api/v1/backups/{model_type}")(list_backups)
app.delete("/api/v1/examples/{model_type}")(reset_examples)

# Initialize directories on startup
@app.on_event("startup")
async def startup_event():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(BACKUP_DIR, exist_ok=True)

# Your existing chat and other endpoints...
"""

# ============================================================================
# TESTING COMMANDS
# ============================================================================

"""
TEST COMMANDS (adjust URL to match your FastAPI server):

# Get examples
curl -X GET "http://your-server:port/api/v1/examples/microstrategy"

# Add new example
curl -X POST "http://your-server:port/api/v1/examples/add" \
     -H "Content-Type: application/json" \
     -d '{
       "modelType": "microstrategy",
       "example": {
         "id": "mstr-new-001",
         "sourceExpression": "Sum(Revenue){~+}",
         "targetDaxFormula": "CALCULATE(SUM([Revenue]), ALL())",
         "correctedDaxFormula": ""
       }
     }'

# Update corrected DAX
curl -X POST "http://your-server:port/api/v1/examples/update-correction" \
     -H "Content-Type: application/json" \
     -d '{
       "modelType": "microstrategy",
       "exampleId": "mstr-001",
       "correctedDaxFormula": "VAR Total = SUM([Revenue]) RETURN Total"
     }'

# List backups
curl -X GET "http://your-server:port/api/v1/backups/microstrategy"

# Reset examples
curl -X DELETE "http://your-server:port/api/v1/examples/microstrategy"
"""
