import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CurationApp from './components/CurationApp';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/cognos-to-pbi" element={<CurationApp modelType="cognos" />} />
          <Route path="/microstrategy-to-pbi" element={<CurationApp modelType="microstrategy" />} />
          <Route path="/tableau-to-pbi" element={<CurationApp modelType="tableau" />} />
          <Route path="/" element={<Navigate to="/cognos-to-pbi" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
