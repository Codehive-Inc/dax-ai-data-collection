import React from 'react';

const ExamplesList = ({ examples, selectedExampleId, onExampleSelect, onEditDax }) => {
  return (
    <div className="examples-list">
      {examples.map((example) => {
        const hasCorrectedDax = !!example.correctedDaxFormula;
        
        // FIX: Robustly check if a previous version exists by ensuring it's a non-empty, non-whitespace string.
        const hasPreviousVersion = !!(example.previousDaxFormula && String(example.previousDaxFormula).trim());
        
        const canEdit = hasCorrectedDax && !hasPreviousVersion;

        return (
          <div
            key={example.id}
            className={`example-item ${selectedExampleId === example.id ? 'selected' : ''} ${
              example.isUserAdded ? 'user-added' : ''
            } ${example.isDummyData ? 'dummy-data' : ''}`}
            onClick={() => onExampleSelect(example.id)}
          >
            {example.isUserAdded && (
              <div className="user-added-badge">
                User Added
              </div>
            )}
            {example.isDummyData && (
              <div className="dummy-data-badge">
                ⚠️ Sample Data
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
              <span className="field-label">
                Corrected DAX Formula:
                {canEdit && (
                  <button
                    className="edit-dax-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents selecting the example
                      onEditDax(example);
                    }}
                  >
                    Edit
                  </button>
                )}
                {hasPreviousVersion && (
                  <span className="edit-status">Edited</span>
                )}
              </span>
              <div className={`field-content ${
                example.correctedDaxFormula 
                  ? 'corrected' 
                  : 'empty'
              }`}>
                {example.correctedDaxFormula || 'Not yet corrected'}
              </div>
            </div>
          </div>
        );
      })}
      
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