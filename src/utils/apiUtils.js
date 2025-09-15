import axios from 'axios';

// Configure axios defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Alternative: Direct model endpoints (if not using gateway)
const MODEL_ENDPOINTS = {
  cognos: process.env.REACT_APP_COGNOS_API_URL || 'http://localhost:8001',
  microstrategy: process.env.REACT_APP_MSTR_API_URL || 'http://localhost:8080',
  tableau: process.env.REACT_APP_TABLEAU_API_URL || 'http://localhost:8003'
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
      timeout: 30000,
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

// Wrapper function that tries real API first, falls back to mock
export const sendChatMessageWithFallback = async (modelType, messages) => {
  try {
    // Try gateway API first
    return await sendChatMessage(modelType, messages);
  } catch (gatewayError) {
    console.warn('Gateway API failed, trying direct model API:', gatewayError.message);
    
    try {
      // Try direct model API
      return await sendChatMessageDirect(modelType, messages);
    } catch (directError) {
      console.warn('Direct API failed, using mock response:', directError.message);
      // Fall back to mock
      return await mockChatResponse(modelType, messages);
    }
  }
};
