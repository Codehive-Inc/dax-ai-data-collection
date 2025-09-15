// Data loading utilities

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export const loadExamples = async (modelType) => {
  try {
    // Try to load from API first
    const apiResponse = await fetch(`${API_BASE_URL}/api/v1/examples/${modelType}`);
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      return data.examples.map(example => ({
        ...example,
        correctedDaxFormula: example.correctedDaxFormula || '',
        isUserAdded: false
      }));
    }
    
    // Fallback to direct file access
    const jsonResponse = await fetch(`/data/${modelType}-examples.json`);
    if (jsonResponse.ok) {
      const data = await jsonResponse.json();
      return data.map(example => ({
        ...example,
        correctedDaxFormula: example.correctedDaxFormula || '',
        isUserAdded: false
      }));
    }
    
    // If no specific file found, return sample data
    return getSampleData(modelType);
  } catch (error) {
    console.warn(`Could not load ${modelType} examples, using sample data:`, error);
    return getSampleData(modelType);
  }
};

// Add new example via API
export const addExampleToFile = async (modelType, example) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/examples/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}/api/v1/examples/update-correction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

const getSampleData = (modelType) => {
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
    correctedDaxFormula: ''
  }));
};
