import React, { useState, useEffect, useCallback } from 'react';
import ExamplesList from './ExamplesList.jsx';
import ChatInterface from './ChatInterface.jsx';
import Toast from './Toast.jsx';
import AddExampleModal from './AddExampleModal.jsx';
import { loadExamples, addExampleToFile, updateCorrectedDax } from '../utils/dataUtils';
import { sendChatMessageWithFallback } from '../utils/apiUtils';

const CurationApp = ({ modelType }) => {
  const [examples, setExamples] = useState([]);
  const [selectedExampleId, setSelectedExampleId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const modelTypeLabels = {
    cognos: 'Cognos to Power BI',
    microstrategy: 'MicroStrategy to Power BI',
    tableau: 'Tableau to Power BI'
  };

  const selectedExample = examples.find(ex => ex.id === selectedExampleId);

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
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSendMessage = useCallback(async (message) => {
    if (!selectedExample) return;

    const newMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await sendChatMessageWithFallback(modelType, newMessages);
      setChatMessages([...newMessages, response.reply]);
    } catch (error) {
      showToast('Error sending message: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedExample, chatMessages, modelType, showToast]);

  const handleUseDaxFormula = useCallback(async (daxFormula) => {
    if (!selectedExample) return;

    try {
      // Update via API
      const result = await updateCorrectedDax(modelType, selectedExampleId, daxFormula);
      
      if (result.success) {
        // Update local state
        const updatedExamples = examples.map(ex => 
          ex.id === selectedExampleId 
            ? { ...ex, correctedDaxFormula: daxFormula }
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

  const loadData = useCallback(async () => {
    try {
      const data = await loadExamples(modelType);
      setExamples(data);
      if (data.length > 0) {
        setSelectedExampleId(data[0].id);
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
            <button 
              className="btn btn-primary add-example-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add New Example
            </button>
          </div>
          <ExamplesList
            examples={examples}
            selectedExampleId={selectedExampleId}
            onExampleSelect={handleExampleSelect}
          />
        </div>

        <div className="right-pane">
          <div className="pane-header">
            Conversational AI Chat
            {selectedExample && (
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem' }}>
                Example ID: {selectedExample.id}
              </span>
            )}
          </div>
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onUseDaxFormula={handleUseDaxFormula}
            isLoading={isLoading}
            disabled={!selectedExample}
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
    </>
  );
};

export default CurationApp;
