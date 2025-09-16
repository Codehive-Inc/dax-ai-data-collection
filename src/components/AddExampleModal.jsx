import React, { useState } from 'react';
// Simple X icon component
const XIcon = () => <span style={{ fontSize: '18px', fontWeight: 'bold' }}>×</span>;

const AddExampleModal = ({ isOpen, onClose, onAdd, modelType }) => {
  const [formData, setFormData] = useState({
    sourceExpression: '',
    targetDaxFormula: ''
  });
  const [errors, setErrors] = useState({});

  const modelTypeLabels = {
    cognos: 'Cognos',
    microstrategy: 'MicroStrategy',
    tableau: 'Tableau'
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sourceExpression.trim()) {
      newErrors.sourceExpression = 'Source expression is required';
    }
    
    if (!formData.targetDaxFormula.trim()) {
      newErrors.targetDaxFormula = 'Target DAX formula is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Generate unique ID
    const timestamp = Date.now();
    const newExample = {
      id: `${modelType}-${timestamp}`,
      sourceExpression: formData.sourceExpression.trim(),
      targetDaxFormula: formData.targetDaxFormula.trim(),
      correctedDaxFormula: ''
    };
    
    onAdd(newExample);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      sourceExpression: '',
      targetDaxFormula: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New {modelTypeLabels[modelType]} Example</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <XIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">
              Source {modelTypeLabels[modelType]} Expression *
            </label>
            <textarea
              className={`form-textarea ${errors.sourceExpression ? 'error' : ''}`}
              value={formData.sourceExpression}
              onChange={(e) => handleInputChange('sourceExpression', e.target.value)}
              placeholder={`Enter the original ${modelTypeLabels[modelType]} expression...`}
              rows={3}
            />
            {errors.sourceExpression && (
              <span className="error-message">{errors.sourceExpression}</span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Target DAX Formula *
            </label>
            <textarea
              className={`form-textarea ${errors.targetDaxFormula ? 'error' : ''}`}
              value={formData.targetDaxFormula}
              onChange={(e) => handleInputChange('targetDaxFormula', e.target.value)}
              placeholder="Enter the initial DAX conversion..."
              rows={4}
            />
            {errors.targetDaxFormula && (
              <span className="error-message">{errors.targetDaxFormula}</span>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Example
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExampleModal;
