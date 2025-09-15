import React from 'react';

const Toast = ({ message, type = 'success' }) => {
  const getToastStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease',
      color: 'white',
      fontWeight: '500'
    };

    switch (type) {
      case 'error':
        return { ...baseStyle, backgroundColor: '#dc3545' };
      case 'warning':
        return { ...baseStyle, backgroundColor: '#ffc107', color: '#212529' };
      default:
        return { ...baseStyle, backgroundColor: '#28a745' };
    }
  };

  return (
    <div style={getToastStyle()}>
      {message}
    </div>
  );
};

export default Toast;
