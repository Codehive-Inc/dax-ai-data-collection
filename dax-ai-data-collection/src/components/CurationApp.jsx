import React, { useEffect, useState, useRef } from "react";
import ExamplesList from "./ExamplesList";
import ChatInterface from "./ChatInterface";
import AddExampleModal from "./AddExampleModal";
import Toast from "./Toast";
import { motion } from "framer-motion";

export default function CurationApp({ modelType }) {
  const [examples, setExamples] = useState([]);
  const [selectedExample, setSelectedExample] = useState(null);
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadedOnce = useRef(false);

  useEffect(() => {
    setExamples([]);
    loadedOnce.current = true;
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddExample = (example) => {
    setExamples((prev) => [example, ...prev]);
    setIsModalOpen(false);
    showToast("Example added successfully", "success");
  };

  const handleSelect = (id) => {
    if (!loadedOnce.current) return;
    const example = examples.find((e) => e.id === id);
    setSelectedExample(example);
  };

  const handleSend = async (text) => {
    if (!selectedExample) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "AI: This is a simulated response." },
      ]);
      setLoading(false);
    }, 800);
  };

  const filteredExamples = examples.filter(
    (ex) =>
      ex.sourceExpression?.toLowerCase().includes(search.toLowerCase()) ||
      ex.targetDaxFormula?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        padding: "2rem 2rem",
        height: "calc(100vh - 7rem)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* LEFT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "45%",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
            Migration Examples ({examples.length})
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.4rem 0.9rem",
              borderRadius: "0.4rem",
              border: "none",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
          >
            + Add Example
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search examples..."
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "0.4rem",
            padding: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        />

        <div style={{ flex: 1, overflowY: "auto", paddingRight: "0.3rem" }}>
          {filteredExamples.length > 0 ? (
            <ExamplesList
              examples={filteredExamples}
              selectedId={selectedExample?.id}
              onSelect={handleSelect}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                fontStyle: "italic",
                marginTop: "2rem",
                opacity: 0.8,
              }}
            >
              No examples match your search criteria. Please try a different query.
            </div>
          )}
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "55%",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
            Conversational AI Chat
          </h3>
          <div style={{ fontSize: "0.85rem", color: "#6b7280", textAlign: "right" }}>
            Example ID: {selectedExample?.id || "—"} <br />
            Created Date: {selectedExample ? "10/10/2025" : "—"}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <ChatInterface messages={messages} onSend={handleSend} isLoading={loading} />
        </div>
      </motion.div>

      {/* ✅ Modal now works */}
      {isModalOpen && (
        <AddExampleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddExample}
          modelType={modelType}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
