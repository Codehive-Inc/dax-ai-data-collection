# FastAPI Integration Guide

This guide shows how to integrate your 3 different AI models hosted on separate FastAPI servers with the React curation app.

## 🏗️ Architecture Options

### Option 1: Gateway API (Recommended)
```
React App → Gateway API → Model APIs
                ↓
        Routes to appropriate model
```

### Option 2: Direct Integration
```
React App → Model API 1 (Cognos)
         → Model API 2 (MicroStrategy) 
         → Model API 3 (Tableau)
```

## 🚀 Quick Setup

### 1. Gateway API Setup (Recommended)

Create a single FastAPI gateway that routes to your 3 models:

```python
# gateway_api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your model endpoints
MODEL_ENDPOINTS = {
    "cognos": "http://your-cognos-server:8001",
    "microstrategy": "http://your-mstr-server:8002", 
    "tableau": "http://your-tableau-server:8003"
}

@app.post("/api/v1/chat")
async def chat_endpoint(request: dict):
    model_type = request["model_type"]
    messages = request["messages"]
    
    # Route to appropriate model
    model_url = MODEL_ENDPOINTS[model_type]
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{model_url}/generate",
            json={"messages": messages}
        )
        
        model_response = response.json()
        
        return {
            "reply": {
                "role": "assistant",
                "content": model_response["generated_text"]  # Adjust based on your response format
            }
        }

# Run with: uvicorn gateway_api:app --port 3001
```

### 2. Individual Model APIs

Each of your FastAPI models needs a `/generate` endpoint:

```python
# Your existing model APIs need this endpoint format:

@app.post("/generate")
async def generate_dax(request: dict):
    messages = request["messages"]
    
    # Your model inference logic here
    result = your_model.generate(messages)
    
    return {
        "generated_text": result,  # or whatever format you use
        "model_info": "cognos-to-dax-v1"
    }
```

## 📋 Required Endpoint Specifications

### Gateway API Endpoint

**URL:** `POST /api/v1/chat`

**Request:**
```json
{
  "model_type": "cognos|microstrategy|tableau",
  "messages": [
    {"role": "system", "content": "You are an expert..."},
    {"role": "user", "content": "Convert this expression: Sum(Revenue)"},
    {"role": "assistant", "content": "Previous DAX response..."},
    {"role": "user", "content": "Please optimize this formula"}
  ]
}
```

**Response:**
```json
{
  "reply": {
    "role": "assistant",
    "content": "Here's the optimized DAX formula:\n\n```dax\nCALCULATE(SUM([Revenue]), REMOVEFILTERS())\n```\n\nThis version provides better performance..."
  }
}
```

### Individual Model API Endpoints

**URL:** `POST /generate`

**Request:**
```json
{
  "messages": [
    {"role": "system", "content": "You are an expert..."},
    {"role": "user", "content": "Convert: Sum(Revenue)"}
  ],
  "max_tokens": 1000,
  "temperature": 0.1
}
```

**Response (adapt to your format):**
```json
{
  "generated_text": "CALCULATE(SUM([Revenue]), ALL())",
  "model_info": "cognos-to-dax-v1",
  "tokens_used": 45
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your React app:

```bash
# Gateway API (Option 1)
REACT_APP_API_BASE_URL=http://localhost:3001

# Direct APIs (Option 2)
REACT_APP_COGNOS_API_URL=http://your-cognos-server:8001
REACT_APP_MSTR_API_URL=http://your-mstr-server:8002
REACT_APP_TABLEAU_API_URL=http://your-tableau-server:8003
```

## 🧪 Testing Your APIs

### Test Gateway API
```bash
curl -X POST "http://localhost:3001/api/v1/chat" \
     -H "Content-Type: application/json" \
     -d '{
       "model_type": "microstrategy",
       "messages": [
         {"role": "system", "content": "You are an expert in converting MicroStrategy expressions to Power BI DAX expressions."},
         {"role": "user", "content": "Convert this MicroStrategy expression to DAX: Sum(Revenue){~+}"}
       ]
     }'
```

### Test Individual Model API
```bash
curl -X POST "http://your-mstr-server:8002/generate" \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [
         {"role": "user", "content": "Convert: Sum(Revenue){~+}"}
       ]
     }'
```

## 🔄 Response Format Adaptation

The React app expects responses in this format:
```json
{
  "reply": {
    "role": "assistant",
    "content": "DAX formula with explanations"
  }
}
```

If your models return different formats, adapt them in the gateway:

```python
def adapt_model_response(model_response, model_type):
    """Adapt different model response formats"""
    
    if "choices" in model_response:
        # OpenAI format
        return model_response["choices"][0]["message"]["content"]
    
    elif "generated_text" in model_response:
        # Hugging Face format
        return model_response["generated_text"]
    
    elif "output" in model_response:
        # Custom format
        return model_response["output"]
    
    else:
        # Fallback
        return str(model_response)
```

## 🚦 Error Handling

Your APIs should handle these error cases:

```python
@app.post("/api/v1/chat")
async def chat_endpoint(request: dict):
    try:
        # Validate model_type
        if request["model_type"] not in MODEL_ENDPOINTS:
            raise HTTPException(status_code=400, detail="Invalid model_type")
        
        # Forward to model API
        # ... your logic ...
        
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Model API timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
```

## 🔒 Security Considerations

1. **CORS**: Configure properly for production
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Authentication**: Add API keys if needed
4. **Input Validation**: Validate all inputs

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/api/v1/chat")
async def chat_endpoint(request: dict, token: str = Depends(security)):
    # Validate token
    if not validate_api_key(token.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # ... rest of your logic
```

## 📊 Monitoring & Logging

Add logging to track usage:

```python
import logging

logger = logging.getLogger(__name__)

@app.post("/api/v1/chat")
async def chat_endpoint(request: dict):
    logger.info(f"Chat request for model: {request['model_type']}")
    
    start_time = time.time()
    
    try:
        # ... your logic ...
        
        duration = time.time() - start_time
        logger.info(f"Request completed in {duration:.2f}s")
        
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise
```

## 🚀 Deployment

### Docker Compose Example
```yaml
version: '3.8'
services:
  gateway:
    build: ./gateway
    ports:
      - "3001:3001"
    environment:
      - COGNOS_API_URL=http://cognos-api:8001
      - MSTR_API_URL=http://mstr-api:8002
      - TABLEAU_API_URL=http://tableau-api:8003
  
  cognos-api:
    build: ./cognos-model
    ports:
      - "8001:8001"
  
  mstr-api:
    build: ./mstr-model
    ports:
      - "8002:8002"
  
  tableau-api:
    build: ./tableau-model
    ports:
      - "8003:8003"
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is properly configured
2. **Timeout Errors**: Increase timeout values for slow models
3. **Format Errors**: Check response format adaptation
4. **Connection Errors**: Verify model API URLs and ports

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Health Checks

Add health check endpoints:
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models": {
            model: await check_model_health(url) 
            for model, url in MODEL_ENDPOINTS.items()
        }
    }
```

## 📞 Support

If you need help adapting this to your specific model formats or deployment setup, please provide:

1. Your current model API response formats
2. How your models are currently deployed
3. Any specific requirements or constraints

The React app is designed to be flexible and will work with either approach once the endpoints are properly configured!
