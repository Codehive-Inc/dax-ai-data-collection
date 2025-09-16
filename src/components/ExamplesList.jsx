import React from 'react';

const ExamplesList = ({ examples, selectedExampleId, onExampleSelect }) => {
  return (
    <div className="examples-list">
      {examples.map((example) => (
        <div
          key={example.id}
          className={`example-item ${selectedExampleId === example.id ? 'selected' : ''} ${
            example.isUserAdded ? 'user-added' : ''
          }`}
          onClick={() => onExampleSelect(example.id)}
        >
          {example.isUserAdded && (
            <div className="user-added-badge">
              User Added
            </div>
          )}
          <div className="example-field">
            <span className="field-label">Source Expression:</span>
            <div className="field-content">
              {example.sourceExpression}
            </div>
          </div>
          
          <div className="example-field">
            <span className="field-label">Target DAX Formula:</span>
            <div className="field-content">
              {example.targetDaxFormula}
            </div>
          </div>
          
          <div className="example-field">
            <span className="field-label">Corrected DAX Formula:</span>
            <div className={`field-content ${
              example.correctedDaxFormula 
                ? 'corrected' 
                : 'empty'
            }`}>
              {example.correctedDaxFormula || 'Not yet corrected'}
            </div>
          </div>
        </div>
      ))}
      
      {examples.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#6c757d', 
          padding: '2rem',
          fontStyle: 'italic'
        }}>
          No examples loaded. Please check your data file.
        </div>
      )}
    </div>
  );
};

export default ExamplesList;
