# SNS Analyzer Web

Commercial-quality SNS keyword analysis web application with hybrid mobile app support.

## Tech Stack

**Backend** — FastAPI · SQLite (aiosqlite) · WebSocket · Python 3.13  
**Frontend** — React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Recharts · TanStack Query  
**Mobile** — Capacitor (iOS / Android)

## Features

- Keyword management with per-platform targeting (YouTube / Instagram)
- Real-time analysis progress via WebSocket
- Sentiment distribution, hashtag trends, influencer ranking
- Weekly analysis trend charts
- Google Drive auto-upload of reports
- Settings management with .env persistence

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Production build
```bash
cd frontend && npm run build
cd ../backend && uvicorn main:app --port 8000
# App served at http://localhost:8000
```

### Mobile (Capacitor)
```bash
cd frontend
npm run build
npx cap sync
npx cap open android   # or ios
```

## Environment Variables

Copy `../sns_analyzer/.env.example` and fill in:

| Variable | Description |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `INSTAGRAM_USERNAME` | Instagram account (optional) |
| `INSTAGRAM_PASSWORD` | Instagram password (optional) |
| `SPREADSHEET_ID` | Google Spreadsheet ID for keywords |
| `DRIVE_FOLDER_ID` | Google Drive destination folder ID |

## Project Structure

```
sns-web/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLAlchemy models
│   ├── database.py          # Async DB session
│   └── routers/
│       ├── keywords.py
│       ├── analysis.py      # Jobs + WebSocket
│       └── settings.py
└── frontend/
    ├── src/
    │   ├── pages/           # Dashboard, Keywords, Analysis, Results, Settings
    │   ├── components/      # Layout, Sidebar, Header
    │   ├── api/             # Axios client + TanStack Query hooks
    │   └── lib/utils.ts
    └── capacitor.config.ts
```
