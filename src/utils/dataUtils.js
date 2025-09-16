// Data loading utilities

// Environment configuration
const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',

  MSTR_API_URL: process.env.REACT_APP_MSTR_API_URL || 'http://localhost:8001',
  COGNOS_API_URL: process.env.REACT_APP_COGNOS_API_URL || 'http://localhost:8003',
  TABLEAU_API_URL: process.env.REACT_APP_TABLEAU_API_URL || 'http://localhost:8004',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  DEBUG: process.env.REACT_APP_DEBUG === 'true'
};

// Helper function for API calls with consistent error handling
const apiCall = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

  try {
    if (CONFIG.DEBUG) {
      console.log('🚀 Data API Call:', { url, options });
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    clearTimeout(timeoutId);

    if (CONFIG.DEBUG) {
      console.log('✅ Data API Response:', { 
        url, 
        status: response.status, 
        ok: response.ok 
      });
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (CONFIG.DEBUG) {
      console.error('❌ Data API Error:', { url, error: error.message });
    }
    throw error;
  }
};

export const loadExamples = async (modelType) => {
  try {
    // Determine API URL based on model type (each model has its own service)
    let apiUrl;
    if (modelType === 'microstrategy') {
      apiUrl = `${CONFIG.MSTR_API_URL}/api/examples/${modelType}`;
    } else if (modelType === 'cognos') {
      apiUrl = `${CONFIG.COGNOS_API_URL}/api/examples/${modelType}`;
    } else if (modelType === 'tableau') {
      apiUrl = `${CONFIG.TABLEAU_API_URL}/api/examples/${modelType}`;
    } else {
      // Fallback for unknown model types
      apiUrl = `${CONFIG.API_BASE_URL}/api/v1/examples/${modelType}`;
    }

    const apiResponse = await apiCall(apiUrl);
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      return data.examples.map(example => ({
        ...example,
        correctedDaxFormula: example.correctedDaxFormula || '',
        isUserAdded: false
      }));
    }
    
    // Fallback to direct file access
    const jsonResponse = await apiCall(`/data/${modelType}-examples.json`);
    if (jsonResponse.ok) {
      const data = await jsonResponse.json();
      return data.map(example => ({
        ...example,
        correctedDaxFormula: example.correctedDaxFormula || '',
        isUserAdded: false
      }));
    }
    
    // If no specific file found, return sample data with warning
    console.warn(`No data source available for ${modelType}, using sample data`);
    return getSampleData(modelType, true);
  } catch (error) {
    console.warn(`Could not load ${modelType} examples, using sample data:`, error);
    return getSampleData(modelType, true);
  }
};

// Add new example via API
export const addExampleToFile = async (modelType, example) => {
  try {
    // Determine API URL based on model type
    let apiUrl;
    if (modelType === 'microstrategy') {
      apiUrl = `${CONFIG.MSTR_API_URL}/api/examples/add`;
    } else if (modelType === 'cognos') {
      apiUrl = `${CONFIG.COGNOS_API_URL}/api/examples/add`;
    } else if (modelType === 'tableau') {
      apiUrl = `${CONFIG.TABLEAU_API_URL}/api/examples/add`;
    } else {
      apiUrl = `${CONFIG.API_BASE_URL}/api/v1/examples/add`;
    }
      
    const response = await apiCall(apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        modelType,
        example
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, message: result.message };
    } else {
      const error = await response.json();
      return { success: false, message: error.detail };
    }
  } catch (error) {
    console.error('Error adding example to file:', error);
    return { success: false, message: error.message };
  }
};

// Update corrected DAX formula via API
export const updateCorrectedDax = async (modelType, exampleId, correctedDaxFormula) => {
  try {
    // Determine API URL based on model type
    let apiUrl;
    if (modelType === 'microstrategy') {
      apiUrl = `${CONFIG.MSTR_API_URL}/api/examples/update-correction`;
    } else if (modelType === 'cognos') {
      apiUrl = `${CONFIG.COGNOS_API_URL}/api/examples/update-correction`;
    } else if (modelType === 'tableau') {
      apiUrl = `${CONFIG.TABLEAU_API_URL}/api/examples/update-correction`;
    } else {
      apiUrl = `${CONFIG.API_BASE_URL}/api/v1/examples/update-correction`;
    }
      
    const response = await apiCall(apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        modelType,
        exampleId,
        correctedDaxFormula
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, message: result.message };
    } else {
      const error = await response.json();
      return { success: false, message: error.detail };
    }
  } catch (error) {
    console.error('Error updating corrected DAX:', error);
    return { success: false, message: error.message };
  }
};

const getSampleData = (modelType, isDummyData = false) => {
  const sampleData = {
    cognos: [
      {
        id: 'cognos-001',
        sourceExpression: '[Sales].[Revenue] / [Sales].[Units]',
        targetDaxFormula: 'DIVIDE([Revenue], [Units])'
      },
      {
        id: 'cognos-002',
        sourceExpression: 'if ([Product].[Category] = \'Electronics\') then ([Sales].[Revenue]) else (0)',
        targetDaxFormula: 'IF([Category] = "Electronics", [Revenue], 0)'
      },
      {
        id: 'cognos-003',
        sourceExpression: 'total([Sales].[Revenue] for [Time].[Year])',
        targetDaxFormula: 'CALCULATE(SUM([Revenue]), ALLEXCEPT(Sales, Sales[Year]))'
      }
    ],
    microstrategy: [
      {
        id: 'mstr-001',
        sourceExpression: 'Sum(Revenue){~+}',
        targetDaxFormula: 'SUMX(ALL(Sales), [Revenue])'
      },
      {
        id: 'mstr-002',
        sourceExpression: 'Case((Category = "Electronics"), Revenue, 0)',
        targetDaxFormula: 'SWITCH([Category], "Electronics", [Revenue], 0)'
      },
      {
        id: 'mstr-003',
        sourceExpression: 'RunningSum(Revenue)',
        targetDaxFormula: 'CALCULATE(SUM([Revenue]), FILTER(ALL(Sales), Sales[Date] <= MAX(Sales[Date])))'
      }
    ],
    tableau: [
      {
        id: 'tableau-001',
        sourceExpression: 'SUM([Revenue]) / SUM([Units])',
        targetDaxFormula: 'DIVIDE(SUM([Revenue]), SUM([Units]))'
      },
      {
        id: 'tableau-002',
        sourceExpression: 'IF [Category] = "Electronics" THEN [Revenue] ELSE 0 END',
        targetDaxFormula: 'IF([Category] = "Electronics", [Revenue], 0)'
      },
      {
        id: 'tableau-003',
        sourceExpression: 'WINDOW_SUM(SUM([Revenue]))',
        targetDaxFormula: 'CALCULATE(SUM([Revenue]), FILTER(ALL(Sales), Sales[RowNumber] <= MAX(Sales[RowNumber])))'
      }
    ]
  };

  return (sampleData[modelType] || sampleData.cognos).map(example => ({
    ...example,
    correctedDaxFormula: '',
    isDummyData: isDummyData,
    isUserAdded: false
  }));
};
