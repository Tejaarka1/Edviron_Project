// src/components/MultiSelect.jsx
import React, { useState, useRef, useEffect } from "react";

/**
 * Props:
 * - options: string[]        (available options)
 * - value: string[]          (selected values)
 * - onChange: (vals) => void
 * - placeholder: string
 * - maxVisible (optional) number of tags shown before "+N"
 */
export default function MultiSelect({ options = [], value = [], onChange, placeholder = "", maxVisible = 5 }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const toggleOption = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const removeTag = (opt) => {
    onChange(value.filter((v) => v !== opt));
  };

  const selectedCount = value.length;
  const visibleTags = value.slice(0, maxVisible);
  const hiddenCount = Math.max(0, selectedCount - maxVisible);

  return (
    <div ref={rootRef} style={{ position: "relative", minWidth: 200 }}>
      <div
        role="button"
        onClick={() => setOpen((s) => !s)}
        style={{
          minHeight: 40,
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "6px 8px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {visibleTags.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: 14 }}>{placeholder}</div>
          ) : (
            visibleTags.map((t) => (
              <div
                key={t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 16,
                  background: "#eef2ff",
                  color: "#1f2937",
                  fontSize: 13,
                }}
              >
                <span>{t}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(t);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    color: "#374151",
                    fontWeight: 700,
                  }}
                  aria-label={`Remove ${t}`}
                >
                  ×
                </button>
              </div>
            ))
          )}
          {hiddenCount > 0 && (
            <div style={{ fontSize: 13, color: "#374151" }}>+{hiddenCount}</div>
          )}
        </div>

        <div style={{ marginLeft: "auto", paddingLeft: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            zIndex: 60,
            top: 48,
            left: 0,
            minWidth: 240,
            maxHeight: 260,
            overflowY: "auto",
            border: "1px solid #e5e7eb",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
            padding: 8,
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: 8, color: "#6b7280" }}>No options</div>
          ) : (
            options.map((opt) => (
              <label
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt)}
                  onChange={() => toggleOption(opt)}
                />
                <span style={{ fontSize: 14 }}>{opt}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
