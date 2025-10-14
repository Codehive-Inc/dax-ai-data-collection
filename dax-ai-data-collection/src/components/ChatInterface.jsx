import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ChatInterface({ messages = [], onSend, isLoading }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0.75rem",
          background: "#f9fafb",
          borderRadius: "0.5rem",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontStyle: "italic",
              marginTop: "4rem",
            }}
          >
            Select an example  to start chat.
          </div>
        ) : (
          messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  background: m.role === "user" ? "#2563eb" : "white",
                  color: m.role === "user" ? "white" : "#111827",
                  padding: "0.7rem 1rem",
                  borderRadius: "0.75rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  maxWidth: "75%",
                  wordWrap: "break-word",
                }}
              >
                {m.content}
              </div>
            </motion.div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input box fixed at bottom */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "0.75rem",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "0.75rem",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here..."
          style={{
            flex: 1,
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            resize: "none",
            fontSize: "0.9rem",
            height: "2.5rem",
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
