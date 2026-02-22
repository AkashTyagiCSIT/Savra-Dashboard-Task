import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
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

function StatCard({ label, value, color, icon }) {
  const colors = {
    blue: { bg: "var(--blue-bg)", text: "var(--blue-text)" },
    green: { bg: "var(--green-bg)", text: "var(--green-text)" },
    yellow: { bg: "var(--yellow-bg)", text: "var(--yellow-text)" },
    red: { bg: "var(--red-bg)", text: "var(--red-text)" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.bg}`, borderRadius: 12,
      padding: "18px 20px", flex: 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: c.text, fontWeight: 600 }}>{label}</span>
        <span>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: c.text }}>{value}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function exportCSV(teacher) {
  if (!teacher) return;
  const rows = [
    ["Category", "Type", "Count"],
    ...teacher.byType.map(r => ["Activity Type", r.activity_type, r.count]),
    ...teacher.bySubject.map(r => ["Subject", r.subject, r.count]),
    ...teacher.byClass.map(r => ["Class", r.class_name, r.count]),
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${teacher.teacher_name.replace(" ", "_")}_report.csv`;
  a.click();
}

export default function TeacherView({ teacherId, onBack }) {
  const [period, setPeriod] = useState("month");
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    get(`/api/teacher/${teacherId}?period=${period}`).then(data => {
      setTeacher(data);
      setLoading(false);
    });
  }, [teacherId, period]);

  const lessons = teacher?.byType.find(t => t.activity_type === "lesson")?.count || 0;
  const quizzes = teacher?.byType.find(t => t.activity_type === "quiz")?.count || 0;
  const assessments = teacher?.byType.find(t => t.activity_type === "assessment")?.count || 0;
  const total = lessons + quizzes + assessments;

  const classData = teacher?.byClass.map(c => ({
    name: c.class_name,
    Activities: c.count,
  })) || [];

  const engagementScore = total > 0 ? Math.round((quizzes / total) * 100) : 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <header style={{
        background: "var(--white)", borderBottom: "1px solid var(--border)",
        padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              width: 32, height: 32, borderRadius: "50%", background: "#f5f5f7",
              border: "1px solid var(--border)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{loading ? "Loading..." : teacher?.teacher_name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Performance Overview</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f5f5f7", border: "1px solid var(--border)",
            borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "var(--muted)",
          }}>
            🔍 Ask Savra AI
          </div>
          <button style={{ background: "var(--purple-btn)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>
            All Grades ▾
          </button>
          <button style={{ background: "var(--white)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>
            All Subjects ▾
          </button>
        </div>
      </header>

      {!loading && teacher && (
        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
          <div style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>
            <span style={{ fontWeight: 500 }}>Subject: </span>
            <span>{teacher.subjects?.join(", ")}</span>
            {"  |  "}
            <span style={{ fontWeight: 500 }}>Grade Taught: </span>
            <span>{teacher.classes?.join(", ")}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <PeriodTabs value={period} onChange={setPeriod} />
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard label="Lessons" value={lessons} color="blue" icon="📖" />
            <StatCard label="Quizzes" value={quizzes} color="green" icon="❓" />
            <StatCard label="Assessments" value={assessments} color="yellow" icon="📝" />
            <div style={{
              background: engagementScore < 20 ? "var(--red-bg)" : "var(--purple-light)",
              borderRadius: 12, padding: "18px 20px", flex: 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: engagementScore < 20 ? "var(--red-text)" : "var(--purple)" }}>
                  {engagementScore < 20 ? "Low Engagement Note" : "Engagement Score"}
                </span>
                <span>⚠️</span>
              </div>
              <div style={{ fontSize: 13, color: engagementScore < 20 ? "var(--red-text)" : "var(--purple)", lineHeight: 1.5 }}>
                {engagementScore < 20
                  ? `Average quiz score is ${engagementScore}%. Consider reviewing teaching methods.`
                  : `Quiz engagement rate is ${engagementScore}%. Good performance!`}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--card-shadow)" }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Class-wise Breakdown</div>
              <div style={{ display: "flex", gap: 14, marginBottom: 16, fontSize: 12, color: "var(--muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c5cbf", display: "inline-block" }} />
                  Activities
                </span>
              </div>
              {classData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={classData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8e8e9a" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8e8e9a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f5f7" }} />
                    <Bar dataKey="Activities" fill="#7c5cbf" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: "var(--muted)", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No data for this period</div>
              )}
            </div>

            <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--card-shadow)" }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Recent Activity</div>
              {teacher.recent && teacher.recent.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {teacher.recent.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", background: "#f9f9fb", borderRadius: 8, fontSize: 13,
                    }}>
                      <div>
                        <span style={{
                          background: item.activity_type === "lesson" ? "var(--blue-bg)" : item.activity_type === "quiz" ? "var(--green-bg)" : "var(--yellow-bg)",
                          color: item.activity_type === "lesson" ? "var(--blue-text)" : item.activity_type === "quiz" ? "var(--green-text)" : "var(--yellow-text)",
                          borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600, textTransform: "capitalize", marginRight: 8,
                        }}>
                          {item.activity_type}
                        </span>
                        {item.subject} — {item.class_name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.created_at}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: "var(--purple-light)", borderRadius: 10, padding: "16px 18px",
                  display: "flex", gap: 12, alignItems: "center",
                }}>
                  <span>📋</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--purple)" }}>No Recent Activity</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>No lessons or quizzes created yet</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--card-shadow)", marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Subject Breakdown</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {teacher.bySubject.map(s => (
                <div key={s.subject} style={{
                  background: "var(--purple-light)", borderRadius: 10,
                  padding: "14px 20px", minWidth: 140,
                }}>
                  <div style={{ fontSize: 12, color: "var(--purple)", fontWeight: 600, marginBottom: 6 }}>{s.subject}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--purple)" }}>{s.count}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>activities</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => exportCSV(teacher)}
              style={{
                background: "#e85d04", color: "#fff", borderRadius: 8,
                padding: "10px 20px", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              ⬇ Export Report (CSV)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
