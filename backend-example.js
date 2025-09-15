/**
 * Example Backend API Implementation
 * 
 * This is a simple Express.js server that implements the required API contract
 * for the AI Model Fine-Tuning Curation App. Replace this with your actual
 * AI model integration.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock AI responses for demonstration
const generateMockResponse = (modelType, messages) => {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  // Simple response generation based on keywords
  if (lastMessage.toLowerCase().includes('var')) {
    return `Here's the DAX formula using VAR for better readability:

\`\`\`dax
VAR TotalRevenue = SUM([Revenue])
VAR TotalUnits = SUM([Units])
RETURN
    DIVIDE(TotalRevenue, TotalUnits)
\`\`\`

This approach stores intermediate calculations in variables, making the formula easier to read and maintain.`;
  }
  
  if (lastMessage.toLowerCase().includes('optimize')) {
    return `Here's an optimized version of the DAX formula:

\`\`\`dax
CALCULATE(
    DIVIDE(SUM([Revenue]), SUM([Units])),
    REMOVEFILTERS()
)
\`\`\`

This version uses CALCULATE with REMOVEFILTERS for better performance.`;
  }
  
  return `I understand you want to refine the DAX formula. Here's an improved version:

\`\`\`dax
SUMX(
    VALUES(Sales[ProductKey]),
    DIVIDE([Revenue], [Units])
)
\`\`\`

This uses SUMX for row-by-row calculation which can be more accurate.`;
};

// Chat endpoint
app.post('/api/v1/chat', async (req, res) => {
  try {
    const { model_type, messages } = req.body;
    
    // Validate request
    if (!model_type || !messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request. model_type and messages array are required.'
      });
    }
    
    // Validate model type
    const validModelTypes = ['cognos', 'microstrategy', 'tableau'];
    if (!validModelTypes.includes(model_type)) {
      return res.status(400).json({
        error: `Invalid model_type. Must be one of: ${validModelTypes.join(', ')}`
      });
    }
    
    // TODO: Replace this with your actual AI model integration
    // Example integrations:
    // - OpenAI API call
    // - Azure OpenAI Service
    // - Custom model endpoint
    // - Hugging Face Transformers
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responseContent = generateMockResponse(model_type, messages);
    
    res.json({
      reply: {
        role: 'assistant',
        content: responseContent
      }
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Chat endpoint: http://localhost:${PORT}/api/v1/chat`);
});

/**
 * To use this backend:
 * 
 * 1. Install dependencies:
 *    npm install express cors
 * 
 * 2. Run the server:
 *    node backend-example.js
 * 
 * 3. The frontend will automatically connect to http://localhost:3001
 * 
 * 4. Replace the generateMockResponse function with your actual AI model integration
 */
