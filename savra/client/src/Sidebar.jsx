import React from "react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "teachers", label: "Teachers", icon: "👤" },
  { id: "classrooms", label: "Classrooms", icon: "🎓" },
  { id: "reports", label: "Reports", icon: "📊" },
];

export default function Sidebar({ page, onNav }) {
  return (
    <aside style={{
      width: 180,
      background: "var(--white)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
    }}>
      <div style={{ padding: "0 20px 28px" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--purple)", letterSpacing: "0.05em" }}>SAVRA</div>
      </div>

      <div style={{ padding: "0 12px 8px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px 8px" }}>
          Main
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                background: page === item.id ? "var(--purple-light)" : "transparent",
                color: page === item.id ? "var(--purple)" : "var(--muted)",
                fontWeight: page === item.id ? 600 : 400,
                fontSize: 13,
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--purple)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 12,
          }}>SR</div>
          <div>
            <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>School Admin</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Shauryaman Ray</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
