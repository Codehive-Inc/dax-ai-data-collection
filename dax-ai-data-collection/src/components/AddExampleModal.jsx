import React, { useState } from "react";

export default function AddExampleModal({ isOpen, onClose, onAdd, modelType }) {
  const [formData, setFormData] = useState({
    sourceExpression: "",
    targetDaxFormula: "",
  });
  const [errors, setErrors] = useState({});

  const modelTypeLabels = {
    cognos: "Cognos",
    microstrategy: "MicroStrategy",
    tableau: "Tableau",
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sourceExpression.trim())
      newErrors.sourceExpression = "Source expression is required.";
    if (!formData.targetDaxFormula.trim())
      newErrors.targetDaxFormula = "Target DAX formula is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newExample = {
      id: `${modelType}-${Date.now()}`,
      sourceExpression: formData.sourceExpression.trim(),
      targetDaxFormula: formData.targetDaxFormula.trim(),
      correctedDaxFormula: "",
    };
    onAdd(newExample);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ sourceExpression: "", targetDaxFormula: "" });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modalBox}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Add New {modelTypeLabels[modelType]} Example</h2>
          <button style={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Source Expression */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Source {modelTypeLabels[modelType]} Expression{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              value={formData.sourceExpression}
              onChange={(e) => handleInputChange("sourceExpression", e.target.value)}
              placeholder={`Enter the original ${modelTypeLabels[modelType]} expression...`}
              rows={3}
              style={{
                ...styles.textarea,
                borderColor: errors.sourceExpression ? "#dc2626" : "#d1d5db",
              }}
            />
            {errors.sourceExpression && (
              <span style={styles.errorText}>{errors.sourceExpression}</span>
            )}
          </div>

          {/* Target DAX */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Target DAX Formula <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              value={formData.targetDaxFormula}
              onChange={(e) => handleInputChange("targetDaxFormula", e.target.value)}
              placeholder="Enter the initial DAX conversion..."
              rows={4}
              style={{
                ...styles.textarea,
                borderColor: errors.targetDaxFormula ? "#dc2626" : "#d1d5db",
              }}
            />
            {errors.targetDaxFormula && (
              <span style={styles.errorText}>{errors.targetDaxFormula}</span>
            )}
          </div>

          {/* Buttons */}
          <div style={styles.actions}>
            <button type="button" onClick={handleClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.addBtn}>
              Add Example
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --------------------
// Styles
// --------------------
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "640px",
    padding: "1.8rem",
    boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
    animation: "fadeIn 0.3s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "1.25rem",
    paddingBottom: "0.6rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "22px",
    color: "#6b7280",
    cursor: "pointer",
    lineHeight: "1",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.4rem",
    display: "block",
  },
  textarea: {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "0.8rem",
    marginTop: "0.3rem",
    display: "block",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.8rem",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
    marginTop: "1.2rem",
  },
  cancelBtn: {
    backgroundColor: "#6b7280",
    color: "white",
    padding: "0.5rem 1.1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 500,
  },
  addBtn: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "0.5rem 1.1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 500,
  },
};
