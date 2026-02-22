const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "savra.db");

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

const data = [
  ["t1","Priya Sharma","lesson",daysAgo(0),"Mathematics","Class 7"],
  ["t1","Priya Sharma","quiz",daysAgo(1),"Mathematics","Class 7"],
  ["t1","Priya Sharma","assessment",daysAgo(2),"Mathematics","Class 8"],
  ["t1","Priya Sharma","lesson",daysAgo(3),"Mathematics","Class 8"],
  ["t1","Priya Sharma","quiz",daysAgo(4),"Mathematics","Class 7"],
  ["t1","Priya Sharma","lesson",daysAgo(5),"Mathematics","Class 9"],
  ["t1","Priya Sharma","assessment",daysAgo(6),"Mathematics","Class 9"],
  ["t1","Priya Sharma","lesson",daysAgo(8),"Mathematics","Class 7"],
  ["t1","Priya Sharma","quiz",daysAgo(10),"Mathematics","Class 8"],
  ["t1","Priya Sharma","lesson",daysAgo(14),"Mathematics","Class 9"],
  ["t1","Priya Sharma","assessment",daysAgo(18),"Mathematics","Class 7"],
  ["t1","Priya Sharma","quiz",daysAgo(21),"Mathematics","Class 8"],
  ["t2","Rahul Verma","lesson",daysAgo(0),"Science","Class 6"],
  ["t2","Rahul Verma","quiz",daysAgo(1),"Science","Class 6"],
  ["t2","Rahul Verma","lesson",daysAgo(2),"Science","Class 7"],
  ["t2","Rahul Verma","assessment",daysAgo(3),"Science","Class 8"],
  ["t2","Rahul Verma","quiz",daysAgo(4),"Science","Class 7"],
  ["t2","Rahul Verma","lesson",daysAgo(6),"Science","Class 6"],
  ["t2","Rahul Verma","assessment",daysAgo(9),"Science","Class 8"],
  ["t2","Rahul Verma","quiz",daysAgo(12),"Science","Class 6"],
  ["t2","Rahul Verma","lesson",daysAgo(15),"Science","Class 7"],
  ["t2","Rahul Verma","assessment",daysAgo(20),"Science","Class 8"],
  ["t3","Anjali Mehta","lesson",daysAgo(0),"English","Class 9"],
  ["t3","Anjali Mehta","assessment",daysAgo(1),"English","Class 9"],
  ["t3","Anjali Mehta","quiz",daysAgo(2),"English","Class 10"],
  ["t3","Anjali Mehta","lesson",daysAgo(4),"English","Class 10"],
  ["t3","Anjali Mehta","quiz",daysAgo(5),"English","Class 9"],
  ["t3","Anjali Mehta","assessment",daysAgo(7),"English","Class 10"],
  ["t3","Anjali Mehta","lesson",daysAgo(11),"English","Class 9"],
  ["t3","Anjali Mehta","quiz",daysAgo(16),"English","Class 10"],
  ["t3","Anjali Mehta","lesson",daysAgo(22),"English","Class 9"],
  ["t4","Ashish Gupta","quiz",daysAgo(0),"History","Class 8"],
  ["t4","Ashish Gupta","quiz",daysAgo(1),"History","Class 9"],
  ["t4","Ashish Gupta","lesson",daysAgo(2),"History","Class 8"],
  ["t4","Ashish Gupta","assessment",daysAgo(3),"History","Class 9"],
  ["t4","Ashish Gupta","quiz",daysAgo(4),"History","Class 8"],
  ["t4","Ashish Gupta","quiz",daysAgo(5),"History","Class 10"],
  ["t4","Ashish Gupta","lesson",daysAgo(6),"History","Class 10"],
  ["t4","Ashish Gupta","assessment",daysAgo(10),"History","Class 8"],
  ["t4","Ashish Gupta","quiz",daysAgo(13),"History","Class 9"],
  ["t4","Ashish Gupta","lesson",daysAgo(17),"History","Class 10"],
  ["t4","Ashish Gupta","assessment",daysAgo(24),"History","Class 8"],
  ["t5","Varun Nair","lesson",daysAgo(0),"Geography","Class 6"],
  ["t5","Varun Nair","assessment",daysAgo(1),"Geography","Class 7"],
  ["t5","Varun Nair","lesson",daysAgo(3),"Geography","Class 6"],
  ["t5","Varun Nair","quiz",daysAgo(4),"Geography","Class 7"],
  ["t5","Varun Nair","assessment",daysAgo(5),"Geography","Class 8"],
  ["t5","Varun Nair","lesson",daysAgo(6),"Geography","Class 8"],
  ["t5","Varun Nair","quiz",daysAgo(8),"Geography","Class 6"],
  ["t5","Varun Nair","lesson",daysAgo(19),"Geography","Class 7"],
  ["t5","Varun Nair","assessment",daysAgo(23),"Geography","Class 8"],
  // intentional duplicates
  ["t1","Priya Sharma","lesson",daysAgo(0),"Mathematics","Class 7"],
  ["t2","Rahul Verma","lesson",daysAgo(0),"Science","Class 6"],
  ["t3","Anjali Mehta","assessment",daysAgo(1),"English","Class 9"],
  ["t4","Ashish Gupta","quiz",daysAgo(0),"History","Class 8"],
  ["t5","Varun Nair","assessment",daysAgo(1),"Geography","Class 7"],
];

async function main() {
  const SQL = await initSqlJs();
  let db;
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

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

  let inserted = 0, skipped = 0;
  for (const row of data) {
    try {
      db.run(
        "INSERT OR IGNORE INTO activities (teacher_id, teacher_name, activity_type, created_at, subject, class_name) VALUES (?,?,?,?,?,?)",
        row
      );
      const changed = db.getRowsModified();
      if (changed > 0) inserted++;
      else skipped++;
    } catch (e) {
      skipped++;
    }
  }

  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log(`Done. Inserted: ${inserted}, Duplicates skipped: ${skipped}`);
}

main().catch(console.error);
