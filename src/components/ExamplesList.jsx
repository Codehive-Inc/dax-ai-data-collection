import React from 'react';

const ExamplesList = ({ examples, selectedExampleId, onExampleSelect, onEditDax }) => {
  return (
    <div className="examples-list">
      {examples.map((example) => {
        // --- NEW DISPLAY LOGIC ---
        // AI DAX Formula is strictly sourced from previousDaxFormula
        const aiDaxFinal = example.previousDaxFormula; 
        // User Corrected DAX Formula is strictly sourced from correctedDaxFormula
        const userDaxFinal = example.correctedDaxFormula; 
        
        const hasUserEdit = !!userDaxFinal;
        const hasAiCorrection = !!aiDaxFinal;
        
        // Edit button is shown only if AI correction exists AND user has not manually corrected it yet.
        const canEdit = hasAiCorrection && !hasUserEdit;
        // --- END NEW DISPLAY LOGIC ---

        return (
          <div
            key={example.id}
            className={`example-item ${selectedExampleId === example.id ? 'selected' : ''} ${
              example.isUserAdded ? 'user-added' : ''
            } ${example.isDummyData ? 'dummy-data' : ''}`}
            onClick={() => onExampleSelect(example.id)}
          >
            {example.isUserAdded && <div className="user-added-badge">User Added</div>}
            {example.isDummyData && <div className="dummy-data-badge">⚠️ Sample Data</div>}

            <div className="example-field">
              <span className="field-label">Source Expression:</span>
              <div className="field-content">{example.sourceExpression}</div>
            </div>

            <div className="example-field">
              <span className="field-label">Target DAX Formula:</span>
              <div className="field-content">{example.targetDaxFormula}</div>
            </div>

            
            {/* AI DAX Formula Column: Shows only previousDaxFormula */}
            <div className="example-field">
              <span className="field-label">AI DAX Formula: {example.confidence_score !== null && example.confidence_score !== undefined && <span className="confidence-score-display">Score: {(example.confidence_score * 100).toFixed(0)}%</span>}</span>
              <div className={`field-content ${hasAiCorrection ? 'corrected' : 'empty'}`}>{aiDaxFinal || 'Not yet corrected by AI'}</div>
            </div>

            {/* User Corrected DAX Formula Column: Shows only correctedDaxFormula */}
            <div className="example-field">
              <span className="field-label">
                User Corrected DAX Formula:
                {canEdit && (
                  <button
                    className="edit-dax-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDax(example);
                    }}
                  >
                    Edit
                  </button>
                )}
                {hasUserEdit && <span className="edit-status">Edited</span>}
              </span>
              <div className={`field-content ${hasUserEdit ? 'corrected' : 'empty'}`}>
                {userDaxFinal || 'Not yet corrected by User'}
              </div>
            </div>

            
          </div>
        );
      })}

      {examples.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            color: '#6c757d',
            padding: '2rem',
            fontStyle: 'italic',
          }}
        >
          No examples loaded. Please check your data file.
        </div>
      )}
    </div>
  );
};

export default ExamplesList;