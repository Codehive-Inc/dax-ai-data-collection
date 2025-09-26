import React, { useState, useEffect, useCallback } from 'react';
import ExamplesList from './ExamplesList.jsx';
import ChatInterface from './ChatInterface.jsx';
import Toast from './Toast.jsx';
import AddExampleModal from './AddExampleModal.jsx';
import { loadExamples, addExampleToFile, updateCorrectedDax } from '../utils/dataUtils';
import { sendChatMessageWithFallback, correctDaxFormula } from '../utils/apiUtils';

const CurationApp = ({ modelType }) => {
  const [examples, setExamples] = useState([]);
  const [selectedExampleId, setSelectedExampleId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state for editing mode
  const [editedDax, setEditedDax] = useState(''); // New state for edited DAX
  const [searchQuery, setSearchQuery] = useState(''); // ADDED: New state for search query

  const modelTypeLabels = {
    cognos: 'Cognos to Power BI',
    microstrategy: 'MicroStrategy to Power BI',
    tableau: 'Tableau to Power BI'
  };

  const selectedExample = examples.find(ex => ex.id === selectedExampleId);
  const hasCorrectedDax = !!selectedExample?.correctedDaxFormula;

  // ADDED: Filter examples based on search query
  const filteredExamples = examples.filter(example =>
    example.sourceExpression.toLowerCase().includes(searchQuery.toLowerCase()) ||
    example.targetDaxFormula.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (example.correctedDaxFormula && example.correctedDaxFormula.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ADDED: Helper function to format date from ID
  const formatDateFromId = (id) => {
    if (!id || typeof id !== 'string') return 'N/A';
    
    // Check for the pattern 'modelType-timestamp'
    const parts = id.split('-');
    const potentialTimestamp = parts[parts.length - 1];
    
    // Check if the last part is a 13-digit number (milliseconds timestamp)
    if (potentialTimestamp && /^\d{13}$/.test(potentialTimestamp)) {
      const date = new Date(parseInt(potentialTimestamp, 10));
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // For hardcoded IDs like 'cognos-001'
    return 'Legacy Data';
  };

  const handleExampleSelect = (exampleId) => {
    setSelectedExampleId(exampleId);
    const example = examples.find(ex => ex.id === exampleId);
    if (example) {
      // Initialize chat with the example
      const initialMessages = [
        {
          role: 'user',
          content: `Convert the following expression: ${example.sourceExpression}`
        },
        {
          role: 'assistant',
          content: example.targetDaxFormula
        }
      ];
      setChatMessages(initialMessages);
    }
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    // Show warning messages longer since they contain important information
    const timeout = type === 'warning' ? 6000 : 3000;
    setTimeout(() => setToast(null), timeout);
  }, []);

  const handleSendMessage = useCallback(async (message) => {
    if (!selectedExample) return;

    // Remove the temporary, detailed context message.
    const newMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newMessages); 
    setIsLoading(true);

    try {
      // MODIFIED: Pass selectedExample as exampleDetails and showToast for contextual and fallback handling.
      const response = await sendChatMessageWithFallback(modelType, newMessages, selectedExample, showToast);
      setChatMessages([...newMessages, response.reply]);
    } catch (error) {
      showToast('Error sending message: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedExample, chatMessages, modelType, showToast]);

  const handleUseDaxFormula = useCallback(async (daxFormula) => {
    if (!selectedExample) return;

    // FIX: Only save the current corrected DAX as the previous version if it exists.
    const oldCorrectedDax = selectedExample.correctedDaxFormula || ''; 
    const existingConfidenceScore = selectedExample.confidence_score || null;

    try {
      // Update via API, passing the old value as the previousDaxFormula and retaining the score
      const result = await updateCorrectedDax(
        modelType, 
        selectedExampleId, 
        daxFormula, 
        oldCorrectedDax,
        existingConfidenceScore
      );
      
      if (result.success) {
        // Update local state, setting the old DAX as the previous version
        const updatedExamples = examples.map(ex => 
          ex.id === selectedExampleId 
            ? { 
                ...ex, 
                correctedDaxFormula: daxFormula, 
                previousDaxFormula: oldCorrectedDax,
                confidence_score: existingConfidenceScore
              }
            : ex
        );
        setExamples(updatedExamples);
        showToast('DAX formula updated and saved to file!');
      } else {
        showToast(`Error saving DAX formula: ${result.message}`, 'error');
      }
    } catch (error) {
      showToast(`Error updating DAX formula: ${error.message}`, 'error');
    }
  }, [selectedExample, examples, selectedExampleId, modelType, showToast]);

  const handleCorrectDax = useCallback(async (messageContent, messageIndex) => {
    if (!selectedExample) return;

    // FIX: Only save the current corrected DAX as the previous version if it exists.
    const oldCorrectedDax = selectedExample.correctedDaxFormula || '';

    try {
      setIsLoading(true);
      showToast('Getting structured DAX correction...', 'info');

      // Call FastAPI for structured DAX correction
      const correctionResult = await correctDaxFormula(
        modelType,
        selectedExample.sourceExpression,
        selectedExample.targetDaxFormula
      );

      // CAPTURE CONFIDENCE SCORE
      const score = correctionResult.confidence_score || null; 

      if (correctionResult.success) {
        // Update the corrected DAX formula, passing the old value as the previousDaxFormula and the new score
        const result = await updateCorrectedDax(
          modelType, 
          selectedExampleId, 
          correctionResult.corrected_dax_formula,
          oldCorrectedDax,
          score // PASS THE NEW SCORE TO THE BACKEND
        );
        
        if (result.success) {
          // Update local state
          const updatedExamples = examples.map(ex => 
            ex.id === selectedExampleId 
              ? { 
                  ...ex, 
                  correctedDaxFormula: correctionResult.corrected_dax_formula,
                  previousDaxFormula: oldCorrectedDax,
                  confidence_score: score // SAVE THE NEW SCORE TO LOCAL STATE
                }
              : ex
          );
          setExamples(updatedExamples);
          showToast(`DAX corrected! , Explaination : ${correctionResult.explanation} Score: ${(score * 100).toFixed(0)}% `);
        } else {
          showToast(`Error saving corrected DAX: ${result.message}`, 'error');
        }
      } else {
        showToast(`Error correcting DAX: ${correctionResult.error_message}`, 'error');
      }
    } catch (error) {
      showToast(`Error getting DAX correction: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedExample, examples, selectedExampleId, modelType, showToast]);

  const loadData = useCallback(async () => {
    try {
      const data = await loadExamples(modelType);
      setExamples(data);
      if (data.length > 0) {
        setSelectedExampleId(data[0].id);
        
        // Check if any examples are dummy data and show warning
        const hasDummyData = data.some(example => example.isDummyData);
        if (hasDummyData) {
          showToast(
            `⚠️ API connection failed. Showing sample data for demonstration. Connect to your ${modelType} API to see real examples.`,
            'warning'
          );
        }
      }
    } catch (error) {
      showToast('Error loading examples: ' + error.message, 'error');
    }
  }, [modelType, showToast]);

  const handleAddExample = useCallback(async (newExample) => {
    try {
      // Save via API
      const result = await addExampleToFile(modelType, newExample);
      
      if (result.success) {
        // Reload data to get updated list (with latest 10 examples)
        await loadData();
        showToast('New example added and saved to file!');
      } else {
        showToast(`Error saving example: ${result.message}`, 'error');
      }
    } catch (error) {
      showToast(`Error adding example: ${error.message}`, 'error');
    }
  }, [modelType, showToast, loadData]);

  // Handle Edit button click
  const handleEditDax = useCallback((example) => {
    setEditedDax(example.correctedDaxFormula);
    setIsEditing(true);
  }, []);

  // Handle Save button in the modal
  const handleSaveEditedDax = useCallback(async () => {
    if (!selectedExample) return;
    
    // Maintain existing score
    const existingConfidenceScore = selectedExample.confidence_score;

    // Call the existing update function, passing both values
    const updateResult = await updateCorrectedDax(
      modelType,
      selectedExample.id,
      editedDax,
      selectedExample.correctedDaxFormula, // The current (old) corrected DAX becomes the previous version
      existingConfidenceScore
    );

    if (updateResult.success) {
      // Update local state and close the edit modal
      const updatedExamples = examples.map(ex =>
        ex.id === selectedExample.id
          ? { 
              ...ex, 
              correctedDaxFormula: editedDax, 
              previousDaxFormula: selectedExample.correctedDaxFormula,
              confidence_score: existingConfidenceScore
            }
          : ex
      );
      setExamples(updatedExamples);
      setIsEditing(false);
      showToast('DAX formula successfully updated!');
    } else {
      showToast(`Error updating DAX formula: ${updateResult.message}`, 'error');
    }
  }, [selectedExample, editedDax, examples, modelType, showToast]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedDax('');
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <header className="header">
        <h1>AI Model Fine-Tuning Curation App</h1>
        <div className="subtitle">{modelTypeLabels[modelType]} Migration Curation</div>
      </header>
      
      <main className="main-content">
        <div className="left-pane">
          <div className="pane-header">
            Migration Examples ({examples.length})
          </div>
          <div style={{ padding: '1rem' }}>
            <input 
              type="text" 
              className="search-input"
              placeholder="Search examples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="btn btn-primary add-example-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add New Example
            </button>
          </div>
          <ExamplesList
            examples={filteredExamples} // MODIFIED: Pass filtered examples
            selectedExampleId={selectedExampleId}
            onExampleSelect={handleExampleSelect}
            onEditDax={handleEditDax}
          />
        </div>

        <div className="right-pane">
          <div className="pane-header">
            Conversational AI Chat
            {selectedExample && (
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem' }}>
                Example ID: {selectedExample.id}
                <span style={{ marginLeft: '1rem' }}>
                  Created Date: {formatDateFromId(selectedExample.id)}
                </span>
              </span>
            )}
          </div>
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onUseDaxFormula={handleUseDaxFormula}
            onCorrectDax={handleCorrectDax}
            isLoading={isLoading}
            disabled={!selectedExample}
            correctDaxDisabled={hasCorrectedDax}
          />
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <AddExampleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddExample}
        modelType={modelType}
      />

      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Corrected DAX Formula</h2>
              <button className="modal-close-btn" onClick={handleCancelEdit}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>×</span>
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">
                  Corrected DAX Formula *
                </label>
                <textarea
                  className="form-textarea"
                  value={editedDax}
                  onChange={(e) => setEditedDax(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveEditedDax}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CurationApp;