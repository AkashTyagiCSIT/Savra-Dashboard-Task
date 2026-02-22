# Savra — Teacher Insights Dashboard

Admin dashboard for school principals to monitor teacher activity, modeled after Savra's Admin Companion UI.

## Live Demo
- Frontend: (Vercel URL)
- Backend: (Render URL)

## Stack
- **Frontend**: React + Vite, Recharts, plain CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)

## Folder Structure
```
savra/
├── client/               # React frontend → deploy to Vercel
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TeacherView.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/               # Express backend → deploy to Render
│   ├── index.js
│   ├── seed.js
│   └── package.json
├── render.yaml
└── README.md
```

## Local Setup

**Backend:**
```bash
cd server
npm install
node seed.js     # seed the SQLite DB (logs duplicates skipped)
npm start        # runs on :3001
```

**Frontend:**
```bash
cd client
npm install
npm run dev      # runs on :5173
```

For production, set `VITE_API_URL=https://your-render-url.onrender.com` in `client/.env`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/teachers` | All teachers |
| GET | `/api/overview?period=week\|month\|year` | School-wide totals |
| GET | `/api/summary?period=` | Per-teacher totals |
| GET | `/api/weekly?teacher_id=` | 7-day daily counts |
| GET | `/api/teacher/:id?period=` | Full teacher breakdown |

## Duplicate Handling
`UNIQUE(teacher_id, activity_type, created_at, subject, class_name)` constraint + `INSERT OR IGNORE`. Seed script intentionally includes 5 duplicate rows — they are silently ignored and reported in the console output.

## Architecture Decisions
- **SQLite**: Zero config for this scope. Replace with Postgres by swapping the `new Database()` line.
- **No ORM**: Raw SQL is readable and direct at this scale.
- **Single activities table**: All analytics are SQL aggregations — no denormalized summary tables needed.
- **Client-side AI insights**: Generated from the summary data without a real AI call, demonstrating the pattern.

## Bonus Features Implemented
- AI Pulse Summary (generated from activity data)
- CSV Export per teacher
- Period filter (This Week / This Month / This Year)
- Recent activity feed per teacher

## Future Scalability
- Swap SQLite → PostgreSQL on Render
- Add Redis cache for `/api/summary` (changes infrequently)
- Add JWT auth with principal/teacher roles
- Real AI summaries via Anthropic API
- Date range picker beyond fixed periods
