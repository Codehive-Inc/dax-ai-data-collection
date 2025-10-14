import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CurationApp from "./components/CurationApp";
import { motion } from "framer-motion";

export default function App() {
  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8fafc",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            backgroundColor: "#1e293b",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            padding: "1.8rem 0",
            textAlign: "center",
            color: "white",
            flexShrink: 0,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{ fontSize: "1.9rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              AI Model Fine-Tuning Curation App
            </h1>
            <p style={{ fontSize: "0.95rem", color: "#cbd5e1", margin: 0 }}>
              Cognos to Power BI Migration Curation
            </p>
          </motion.div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "2.5rem 2rem 3rem",
            overflowY: "auto",
          }}
        >
          <div style={{ width: "100%", maxWidth: "1300px" }}>
            <Routes>
              <Route path="/cognos-to-pbi" element={<CurationApp modelType="cognos" />} />
              <Route path="/" element={<Navigate to="/cognos-to-pbi" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
