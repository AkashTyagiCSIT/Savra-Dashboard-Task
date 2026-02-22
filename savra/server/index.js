const express = require("express");
const cors = require("cors");
const { getDb, saveDb } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

function query(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function run(db, sql, params = []) {
  db.run(sql, params);
  saveDb();
}

async function setupDb() {
  const db = await getDb();
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id TEXT NOT NULL,
      teacher_name TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      subject TEXT NOT NULL,
      class_name TEXT NOT NULL,
      UNIQUE(teacher_id, activity_type, created_at, subject, class_name)
    )
  `);
  saveDb();
}

app.get("/api/teachers", async (req, res) => {
  const db = await getDb();
  const rows = query(db, "SELECT DISTINCT teacher_id, teacher_name FROM activities ORDER BY teacher_name");
  res.json(rows);
});

app.get("/api/overview", async (req, res) => {
  const db = await getDb();
  const { period } = req.query;
  let dateFilter = "";
  if (period === "week") dateFilter = "AND created_at >= date('now', '-6 days')";
  else if (period === "month") dateFilter = "AND created_at >= date('now', '-29 days')";

  const rows = query(db, `
    SELECT
      COUNT(DISTINCT teacher_id) AS active_teachers,
      SUM(CASE WHEN activity_type = 'lesson' THEN 1 ELSE 0 END) AS lessons,
      SUM(CASE WHEN activity_type = 'assessment' THEN 1 ELSE 0 END) AS assessments,
      SUM(CASE WHEN activity_type = 'quiz' THEN 1 ELSE 0 END) AS quizzes,
      COUNT(*) AS total
    FROM activities WHERE 1=1 ${dateFilter}
  `);
  res.json(rows[0] || {});
});

app.get("/api/summary", async (req, res) => {
  const db = await getDb();
  const { period } = req.query;
  let dateFilter = "";
  if (period === "week") dateFilter = "AND created_at >= date('now', '-6 days')";
  else if (period === "month") dateFilter = "AND created_at >= date('now', '-29 days')";

  const rows = query(db, `
    SELECT
      teacher_id, teacher_name,
      SUM(CASE WHEN activity_type = 'lesson' THEN 1 ELSE 0 END) AS lessons,
      SUM(CASE WHEN activity_type = 'quiz' THEN 1 ELSE 0 END) AS quizzes,
      SUM(CASE WHEN activity_type = 'assessment' THEN 1 ELSE 0 END) AS assessments,
      COUNT(*) AS total,
      GROUP_CONCAT(DISTINCT subject) AS subjects,
      GROUP_CONCAT(DISTINCT class_name) AS classes
    FROM activities
    WHERE 1=1 ${dateFilter}
    GROUP BY teacher_id, teacher_name
    ORDER BY teacher_name
  `);
  res.json(rows);
});

app.get("/api/weekly", async (req, res) => {
  const db = await getDb();
  const { teacher_id } = req.query;
  let sql = "SELECT created_at AS date, COUNT(*) AS count FROM activities WHERE created_at >= date('now', '-6 days')";
  const params = [];
  if (teacher_id) { sql += " AND teacher_id = ?"; params.push(teacher_id); }
  sql += " GROUP BY created_at ORDER BY created_at";

  const rows = query(db, sql, params);
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const found = rows.find(r => r.date === dateStr);
    result.push({ date: dateStr, label, count: found ? found.count : 0 });
  }
  res.json(result);
});

app.get("/api/teacher/:id", async (req, res) => {
  const db = await getDb();
  const { id } = req.params;
  const { period } = req.query;
  let dateFilter = "";
  if (period === "week") dateFilter = "AND created_at >= date('now', '-6 days')";
  else if (period === "month") dateFilter = "AND created_at >= date('now', '-29 days')";

  const info = query(db, "SELECT DISTINCT teacher_id, teacher_name FROM activities WHERE teacher_id = ?", [id]);
  if (!info.length) return res.status(404).json({ error: "Not found" });

  const byType = query(db, `SELECT activity_type, COUNT(*) AS count FROM activities WHERE teacher_id = ? ${dateFilter} GROUP BY activity_type`, [id]);
  const bySubject = query(db, `SELECT subject, COUNT(*) AS count FROM activities WHERE teacher_id = ? ${dateFilter} GROUP BY subject`, [id]);
  const byClass = query(db, `SELECT class_name, COUNT(*) AS count FROM activities WHERE teacher_id = ? ${dateFilter} GROUP BY class_name ORDER BY class_name`, [id]);
  const recent = query(db, "SELECT activity_type, subject, class_name, created_at FROM activities WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 5", [id]);
  const subjects = query(db, "SELECT DISTINCT subject FROM activities WHERE teacher_id = ?", [id]).map(r => r.subject);
  const classes = query(db, "SELECT DISTINCT class_name FROM activities WHERE teacher_id = ? ORDER BY class_name", [id]).map(r => r.class_name);

  res.json({ ...info[0], byType, bySubject, byClass, recent, subjects, classes });
});

setupDb().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log("Server running on port " + PORT));
});
