import React, { useState, useRef, useEffect } from 'react';
// Simple icon components
const CopyIcon = () => <span style={{ fontSize: '14px' }}>📋</span>;
const CheckIcon = () => <span style={{ fontSize: '14px' }}>✓</span>;

const ChatInterface = ({ messages, onSendMessage, onUseDaxFormula, isLoading, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [copiedStates, setCopiedStates] = useState({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (text, blockId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [blockId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [blockId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderMessageContent = (content, messageIndex) => {
    // Simple code block detection - looking for DAX-like patterns
    const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
    const parts = content.split(codeBlockRegex);
    const codeBlocks = content.match(codeBlockRegex) || [];
    
    const result = [];
    let codeBlockIndex = 0;
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }
      
      if (codeBlockIndex < codeBlocks.length) {
        const codeBlock = codeBlocks[codeBlockIndex];
        const cleanCode = codeBlock.replace(/```[\w]*\n?/g, '').replace(/```/g, '').replace(/`/g, '');
        const blockId = `${messageIndex}-${codeBlockIndex}`;
        
        // Check if this looks like a DAX formula (contains DAX keywords or patterns)
        const isDaxFormula = /\b(CALCULATE|SUM|AVERAGE|COUNT|IF|SWITCH|VAR|RETURN|FILTER|ALL|RELATED)\b/i.test(cleanCode) ||
                           cleanCode.includes('=') ||
                           cleanCode.length > 10;
        
        result.push(
          <div key={`code-${codeBlockIndex}`} className="code-block">
            <div className="code-block-header">
              <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                {isDaxFormula ? 'DAX Formula' : 'Code'}
              </span>
              <div className="code-block-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => copyToClipboard(cleanCode, blockId)}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  {copiedStates[blockId] ? <CheckIcon /> : <CopyIcon />}
                  {copiedStates[blockId] ? 'Copied!' : 'Copy'}
                </button>
                {isDaxFormula && (
                  <button
                    className="btn btn-primary"
                    onClick={() => onUseDaxFormula(cleanCode)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Use as Corrected DAX
                  </button>
                )}
              </div>
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {cleanCode}
            </pre>
          </div>
        );
        codeBlockIndex++;
      }
    }
    
    return result;
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-header">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div className="message-content">
              {renderMessageContent(message.content, index)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-header">AI Assistant</div>
            <div className="message-content">
              <div className="loading">
                <div className="spinner"></div>
                Thinking...
              </div>
            </div>
          </div>
        )}
        
        {messages.length === 0 && !disabled && (
          <div style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            padding: '2rem',
            fontStyle: 'italic'
          }}>
            Select an example from the left to start a conversation
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Select an example to start chatting..." : "Type your message here... (Press Enter to send, Shift+Enter for new line)"}
            disabled={disabled || isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary send-button"
            disabled={!inputValue.trim() || isLoading || disabled}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
