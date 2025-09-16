import axios from 'axios';

// Environment configuration
const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  DEBUG: process.env.REACT_APP_DEBUG === 'true',
  ENV: process.env.REACT_APP_ENV || 'development'
};

// Configure axios defaults
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
if (CONFIG.DEBUG) {
  api.interceptors.request.use(
    (config) => {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data
      });
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error('❌ API Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
}


// Direct model endpoints (each model runs as separate FastAPI service)

const MODEL_ENDPOINTS = {
  cognos: process.env.REACT_APP_COGNOS_API_URL || 'http://localhost:8003',
  microstrategy: process.env.REACT_APP_MSTR_API_URL || 'http://localhost:8001',
  tableau: process.env.REACT_APP_TABLEAU_API_URL || 'http://localhost:8004'
};

export const sendChatMessage = async (modelType, messages) => {
  try {
    const response = await api.post('/api/v1/chat', {
      model_type: modelType,
      messages: messages
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(`Server error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

// Mock function for development/testing when backend is not available
export const mockChatResponse = (modelType, messages) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      
      // Generate a mock response based on the user's message
      let mockResponse = '';
      
      if (lastUserMessage.toLowerCase().includes('var')) {
        mockResponse = `Here's the DAX formula using VAR for better readability:

\`\`\`dax
VAR TotalRevenue = SUM([Revenue])
VAR TotalUnits = SUM([Units])
RETURN
    DIVIDE(TotalRevenue, TotalUnits)
\`\`\`

This approach stores intermediate calculations in variables, making the formula easier to read and maintain.`;
      } else if (lastUserMessage.toLowerCase().includes('optimize')) {
        mockResponse = `Here's an optimized version of the DAX formula:

\`\`\`dax
CALCULATE(
    DIVIDE(SUM([Revenue]), SUM([Units])),
    REMOVEFILTERS()
)
\`\`\`

This version uses CALCULATE with REMOVEFILTERS for better performance in certain scenarios.`;
      } else {
        mockResponse = `I understand you want to refine the DAX formula. Here's an improved version:

\`\`\`dax
SUMX(
    VALUES(Sales[ProductKey]),
    DIVIDE([Revenue], [Units])
)
\`\`\`

This uses SUMX for row-by-row calculation which can be more accurate for this type of division.`;
      }
      
      resolve({
        reply: {
          role: 'assistant',
          content: mockResponse
        }
      });
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  });
};

// Alternative: Send directly to individual model APIs
export const sendChatMessageDirect = async (modelType, messages) => {
  try {
    const modelUrl = MODEL_ENDPOINTS[modelType];
    if (!modelUrl) {
      throw new Error(`No endpoint configured for model type: ${modelType}`);
    }

    const response = await axios.post(`${modelUrl}/api/chat`, {
      model_type: modelType,
      messages: messages
    }, {
      timeout: CONFIG.API_TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Adapt response format to match expected structure
    let content = '';
    if (response.data.reply && response.data.reply.content) {
      // Our new chat API format
      content = response.data.reply.content;
    } else if (response.data.choices && response.data.choices[0]) {
      // OpenAI-style response
      content = response.data.choices[0].message.content;
    } else if (response.data.generated_text) {
      // Hugging Face style
      content = response.data.generated_text;
    } else if (response.data.response) {
      // Custom response format
      content = response.data.response;
    } else if (response.data.output) {
      // Another common format
      content = response.data.output;
    } else {
      // Fallback
      content = JSON.stringify(response.data);
    }
    
    return {
      reply: {
        role: 'assistant',
        content: content
      }
    };
    
  } catch (error) {
    if (error.response) {
      throw new Error(`Model API error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      throw new Error(`No response from ${modelType} model API. Please check if it's running.`);
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

// Wrapper function that goes directly to model APIs (no gateway)
export const sendChatMessageWithFallback = async (modelType, messages) => {
  try {
    // Go directly to model-specific API
    return await sendChatMessageDirect(modelType, messages);
  } catch (directError) {
    console.warn('Direct API failed, using mock response:', directError.message);
    // Fall back to mock
    return await mockChatResponse(modelType, messages);
  }
};

// New function for structured DAX correction
export const correctDaxFormula = async (modelType, sourceExpression, targetDaxFormula) => {
  try {
    // Determine API URL based on model type
    let apiUrl;
    if (modelType === 'microstrategy') {
      apiUrl = `${MODEL_ENDPOINTS.microstrategy}/api/dax/correct`;
    } else if (modelType === 'cognos') {
      apiUrl = `${MODEL_ENDPOINTS.cognos}/api/dax/correct`;
    } else if (modelType === 'tableau') {
      apiUrl = `${MODEL_ENDPOINTS.tableau}/api/dax/correct`;
    } else {
      apiUrl = `${CONFIG.API_BASE_URL}/api/dax/correct`;
    }

    const response = await axios.post(apiUrl, {
      model_type: modelType,
      source_expression: sourceExpression,
      target_dax_formula: targetDaxFormula
    }, {
      timeout: CONFIG.API_TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`DAX correction error: ${error.response.data.error_message || error.response.statusText}`);
    } else if (error.request) {
      throw new Error('No response from DAX correction service. Please check if the backend is running.');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};
