"""
FastAPI Endpoints for AI Model Fine-Tuning Curation App

This file shows two approaches for integrating your 3 different AI models:
1. Single Gateway API (routes to different models)
2. Individual Model APIs (separate endpoints for each model)

Choose the approach that best fits your architecture.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
import asyncio
from datetime import datetime

# ============================================================================
# APPROACH 1: SINGLE GATEWAY API (RECOMMENDED)
# ============================================================================

app = FastAPI(title="DAX Curation Gateway API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class Message(BaseModel):
    role: str  # "system", "user", "assistant"
    content: str

class ChatRequest(BaseModel):
    model_type: str  # "cognos", "microstrategy", "tableau"
    messages: List[Message]

class ChatResponse(BaseModel):
    reply: Message


# Configuration for your 3 different model endpoints
MODEL_ENDPOINTS = {
    "cognos": "http://your-cognos-api:8001",
    "microstrategy": "http://your-mstr-api:8002", 
    "tableau": "http://your-tableau-api:8003"
}


@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint that routes to appropriate model based on model_type
    """
    try:
        # Validate model type
        if request.model_type not in MODEL_ENDPOINTS:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid model_type. Must be one of: {list(MODEL_ENDPOINTS.keys())}"
            )
        
        # Get the appropriate model endpoint
        model_url = MODEL_ENDPOINTS[request.model_type]
        
        # Forward request to specific model API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{model_url}/generate",  # Adjust endpoint path as needed
                json={
                    "messages": [msg.dict() for msg in request.messages],
                    "max_tokens": 1000,
                    "temperature": 0.1
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Model API error: {response.text}"
                )
            
            model_response = response.json()
            
            # Extract the generated content (adjust based on your model's response format)
            generated_content = extract_generated_content(model_response, request.model_type)
            
            return ChatResponse(
                reply=Message(
                    role="assistant",
                    content=generated_content
                )
            )
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Model API timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

def extract_generated_content(model_response: Dict[Any, Any], model_type: str) -> str:
    """
    Extract generated content from model response.
    Adjust this function based on your specific model response formats.
    """
    
    # Example response formats - adjust based on your actual APIs:
    
    if "choices" in model_response:
        # OpenAI-style response
        return model_response["choices"][0]["message"]["content"]
    
    elif "generated_text" in model_response:
        # Hugging Face style response
        return model_response["generated_text"]
    
    elif "response" in model_response:
        # Custom response format
        return model_response["response"]
    
    elif "output" in model_response:
        # Another common format
        return model_response["output"]
    
    else:
        # Fallback - return the whole response as string
        return str(model_response)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "available_models": list(MODEL_ENDPOINTS.keys())
    }

# ============================================================================
# APPROACH 2: INDIVIDUAL MODEL APIS
# ============================================================================

"""
If you prefer separate APIs for each model, create 3 separate FastAPI apps:

# cognos_api.py
from fastapi import FastAPI
from your_cognos_model import CognosModel

app = FastAPI()
model = CognosModel()

@app.post("/generate")
async def generate_cognos_dax(request: ChatRequest):
    # Your Cognos-specific logic
    result = await model.generate(request.messages)
    return {"response": result}

# microstrategy_api.py  
from fastapi import FastAPI
from your_mstr_model import MicroStrategyModel

app = FastAPI()
model = MicroStrategyModel()

@app.post("/generate")
async def generate_mstr_dax(request: ChatRequest):
    # Your MicroStrategy-specific logic
    result = await model.generate(request.messages)
    return {"response": result}

# tableau_api.py
from fastapi import FastAPI
from your_tableau_model import TableauModel

app = FastAPI()
model = TableauModel()

@app.post("/generate")
async def generate_tableau_dax(request: ChatRequest):
    # Your Tableau-specific logic
    result = await model.generate(request.messages)
    return {"response": result}
"""

# ============================================================================
# EXAMPLE MODEL INTEGRATION
# ============================================================================

class ExampleModelWrapper:
    """
    Example wrapper for your AI model.
    Replace this with your actual model integration.
    """
    
    def __init__(self, model_type: str):
        self.model_type = model_type
        # Initialize your model here
        # self.model = load_your_model(model_type)
    
    async def generate_response(self, messages: List[Message]) -> str:
        """
        Generate DAX formula based on conversation history
        """
        
        # Extract the latest user message
        user_messages = [msg for msg in messages if msg.role == "user"]
        if not user_messages:
            raise ValueError("No user message found")
        
        latest_message = user_messages[-1].content
        
        # TODO: Replace with your actual model inference
        # result = await self.model.generate(
        #     prompt=self.build_prompt(messages),
        #     max_tokens=500,
        #     temperature=0.1
        # )
        
        # Mock response for demonstration
        if "VAR" in latest_message.upper():
            return self.generate_var_response()
        elif "OPTIMIZE" in latest_message.upper():
            return self.generate_optimized_response()
        else:
            return self.generate_default_response()
    
    def build_prompt(self, messages: List[Message]) -> str:
        """Build prompt from conversation history"""
        prompt_parts = []
        for msg in messages:
            if msg.role == "system":
                prompt_parts.append(f"System: {msg.content}")
            elif msg.role == "user":
                prompt_parts.append(f"User: {msg.content}")
            elif msg.role == "assistant":
                prompt_parts.append(f"Assistant: {msg.content}")
        
        return "\n".join(prompt_parts)
    
    def generate_var_response(self) -> str:
        return """Here's the DAX formula using VAR for better readability:

```dax
VAR TotalRevenue = SUM([Revenue])
VAR TotalUnits = SUM([Units])
RETURN
    DIVIDE(TotalRevenue, TotalUnits)
```

This approach stores intermediate calculations in variables, making the formula easier to read and maintain."""

    def generate_optimized_response(self) -> str:
        return """Here's an optimized version of the DAX formula:

```dax
CALCULATE(
    DIVIDE(SUM([Revenue]), SUM([Units])),
    REMOVEFILTERS()
)
```

This version uses CALCULATE with REMOVEFILTERS for better performance."""

    def generate_default_response(self) -> str:
        return """I understand you want to refine the DAX formula. Here's an improved version:

```dax
SUMX(
    VALUES(Sales[ProductKey]),
    DIVIDE([Revenue], [Units])
)
```

This uses SUMX for row-by-row calculation which can be more accurate."""

# ============================================================================
# USAGE INSTRUCTIONS
# ============================================================================

"""
TO USE THIS GATEWAY API:

1. Install dependencies:
   pip install fastapi uvicorn httpx

2. Update MODEL_ENDPOINTS with your actual API URLs

3. Modify extract_generated_content() to match your model response formats

4. Run the gateway:
   uvicorn fastapi-endpoints:app --host 0.0.0.0 --port 3001

5. Update your React app's .env file:
   REACT_APP_API_BASE_URL=http://localhost:3001

6. Your React app will automatically use this gateway to route requests
   to the appropriate model based on the current migration path.

TESTING:

# Chat with AI
curl -X POST "http://localhost:3001/api/v1/chat" \
     -H "Content-Type: application/json" \
     -d '{
       "model_type": "microstrategy",
       "messages": [
         {"role": "system", "content": "You are an expert..."},
         {"role": "user", "content": "Convert this expression: Sum(Revenue)"}
       ]
     }'

# Get examples
curl -X GET "http://localhost:3001/api/v1/examples/microstrategy"

# Add new example
curl -X POST "http://localhost:3001/api/v1/examples/add" \
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
curl -X POST "http://localhost:3001/api/v1/examples/update-correction" \
     -H "Content-Type: application/json" \
     -d '{
       "modelType": "microstrategy",
       "exampleId": "mstr-001",
       "correctedDaxFormula": "VAR Total = SUM([Revenue]) RETURN Total"
     }'

# List backups
curl -X GET "http://localhost:3001/api/v1/backups/microstrategy"
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
