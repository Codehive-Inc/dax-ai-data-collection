import React from "react";

export default function ExamplesList({ examples, selectedId, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {examples.map((example) => (
        <div
          key={example.id}
          onClick={() => onSelect(example.id)}
          style={{
            padding: "0.8rem",
            border: selectedId === example.id ? "1px solid #3b82f6" : "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            background: selectedId === example.id ? "#eff6ff" : "white",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontWeight: "500", fontSize: "0.9rem", color: "#374151" }}>
            Source Expression:
          </div>
          <pre style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0.25rem 0" }}>
            {example.sourceExpression}
          </pre>

          <div style={{ fontWeight: "500", fontSize: "0.9rem", color: "#374151" }}>
            Target DAX Formula:
          </div>
          <pre style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0.25rem 0" }}>
            {example.targetDaxFormula}
          </pre>
        </div>
      ))}
    </div>
  );
}
