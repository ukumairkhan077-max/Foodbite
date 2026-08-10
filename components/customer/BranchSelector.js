"use client";
// components/customer/BranchSelector.js
// List of branches with a "select" callback — used on checkout/branches pages.

export default function BranchSelector({ branches, selectedId, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {branches.map((branch) => (
        <button
          key={branch._id}
          onClick={() => onSelect(branch._id)}
          style={{
            textAlign: "left", padding: 14, borderRadius: 10, cursor: "pointer",
            background: "var(--color-bg)",
            border: `1px solid ${selectedId === branch._id ? "var(--color-accent)" : "var(--color-border)"}`,
            color: "var(--color-text)",
          }}
        >
          <p style={{ fontWeight: 600 }}>{branch.name}</p>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{branch.address}</p>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{branch.openTime} – {branch.closeTime}</p>
        </button>
      ))}
    </div>
  );
}
