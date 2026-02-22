import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const API = import.meta.env.VITE_API_URL || "";

async function get(path) {
  const res = await fetch(API + path);
  return res.json();
}

function PeriodTabs({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "#f0f0f5", borderRadius: 8, padding: 3 }}>
      {["week", "month", "year"].map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: value === p ? "var(--white)" : "transparent",
            color: value === p ? "var(--text)" : "var(--muted)",
            boxShadow: value === p ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.15s",
          }}
        >
          {p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
        </button>
      ))}
    </div>
  );
}

function OverviewCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12,
      padding: "18px 20px", flex: 1, minWidth: 140,
      boxShadow: "var(--card-shadow)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: "var(--text)" }}>{value ?? "—"}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>This week</div>
    </div>
  );
}

function AIPulse({ summary }) {
  if (!summary || !summary.length) return (
    <div style={{ color: "var(--muted)", fontSize: 13 }}>Not enough data for insights.</div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {summary.map((item, i) => (
        <div key={i} style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          background: i === 2 ? "#fff8f0" : "var(--purple-light)",
          borderRadius: 10, padding: "12px 14px",
        }}>
          <span style={{ fontSize: 16, marginTop: 1 }}>{item.icon}</span>
          <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <div style={{ color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{payload[0].value} activities</div>
    </div>
  );
};

export default function Dashboard({ onSelectTeacher }) {
  const [period, setPeriod] = useState("week");
  const [overview, setOverview] = useState(null);
  const [summary, setSummary] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      get(`/api/overview?period=${period}`),
      get(`/api/summary?period=${period}`),
      get("/api/weekly"),
    ]).then(([ov, sm, wk]) => {
      setOverview(ov);
      setSummary(sm);
      setWeekly(wk);
      setLoading(false);
    });
  }, [period]);

  const aiInsights = summary.length ? generateInsights(summary) : [];

  const chartData = weekly.map(d => ({ name: d.label, count: d.count }));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <header style={{
        background: "var(--white)", borderBottom: "1px solid var(--border)",
        padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Admin Companion</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>See What's Happening Across your School</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f5f5f7", border: "1px solid var(--border)",
            borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "var(--muted)",
          }}>
            🔍 Ask Savra AI
          </div>
          <button style={{
            background: "var(--purple-btn)", color: "#fff", borderRadius: 8,
            padding: "8px 16px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
          }}>
            All Grades ▾
          </button>
          <button style={{
            background: "var(--white)", color: "var(--text)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "8px 16px", fontSize: 13,
          }}>
            All Subjects ▾
          </button>
        </div>
      </header>

      <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Insights</h2>
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>

        {loading ? (
          <div style={{ color: "var(--muted)", padding: "40px 0", textAlign: "center" }}>Loading...</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <OverviewCard label="Active Teachers" value={overview?.active_teachers} icon="👥" />
              <OverviewCard label="Lessons Created" value={overview?.lessons} icon="📖" />
              <OverviewCard label="Assessments Made" value={overview?.assessments} icon="📝" />
              <OverviewCard label="Quizzes Conducted" value={overview?.quizzes} icon="❓" />
              <OverviewCard label="Total Activities" value={overview?.total} icon="📊" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--card-shadow)" }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Weekly Activity</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>Content creation trends</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c5cbf" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7c5cbf" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8e8e9a" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8e8e9a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#7c5cbf" strokeWidth={2} fill="url(#grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--card-shadow)" }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>AI Pulse Summary</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Real time insights from your data</div>
                <AIPulse summary={aiInsights} />
              </div>
            </div>

            <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--card-shadow)" }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Teacher Overview</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Teacher", "Subjects", "Classes", "Lessons", "Quizzes", "Assessments", "Total", ""].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontWeight: 500, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.map(t => (
                    <tr key={t.teacher_id} style={{ borderBottom: "1px solid #f5f5f7" }}>
                      <td style={{ padding: "12px 12px", fontWeight: 600 }}>{t.teacher_name}</td>
                      <td style={{ padding: "12px 12px", color: "var(--muted)" }}>{t.subjects}</td>
                      <td style={{ padding: "12px 12px", color: "var(--muted)" }}>{t.classes}</td>
                      <td style={{ padding: "12px 12px" }}>
                        <span style={{ background: "var(--blue-bg)", color: "var(--blue-text)", borderRadius: 6, padding: "2px 10px", fontWeight: 600 }}>{t.lessons}</span>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <span style={{ background: "var(--green-bg)", color: "var(--green-text)", borderRadius: 6, padding: "2px 10px", fontWeight: 600 }}>{t.quizzes}</span>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <span style={{ background: "var(--yellow-bg)", color: "var(--yellow-text)", borderRadius: 6, padding: "2px 10px", fontWeight: 600 }}>{t.assessments}</span>
                      </td>
                      <td style={{ padding: "12px 12px", fontWeight: 700 }}>{t.total}</td>
                      <td style={{ padding: "12px 12px" }}>
                        <button
                          onClick={() => onSelectTeacher(t.teacher_id)}
                          style={{
                            background: "var(--purple-light)", color: "var(--purple)",
                            borderRadius: 7, padding: "5px 14px", fontSize: 12, fontWeight: 600,
                          }}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function generateInsights(summary) {
  const sorted = [...summary].sort((a, b) => b.total - a.total);
  const top = sorted[0];
  const mostQuizzes = [...summary].sort((a, b) => b.quizzes - a.quizzes)[0];
  const leastActive = sorted[sorted.length - 1];

  return [
    {
      icon: "👑",
      text: `${top.teacher_name} has the highest workload with ${top.total} total activities across ${top.classes?.split(",").length || 1} classes.`,
    },
    {
      icon: "📝",
      text: `${mostQuizzes.teacher_name} created the most quizzes this period with ${mostQuizzes.quizzes} quizzes conducted.`,
    },
    {
      icon: "⚠️",
      text: `${leastActive.teacher_name} has the lowest activity count (${leastActive.total}) — consider reviewing engagement.`,
    },
  ];
}
