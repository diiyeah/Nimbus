# NimbusAI

AI-powered cloud cost intelligence dashboard. Upload your AWS billing CSV, get Gemini AI recommendations, visualise spend trends, and track analysis history.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4, Framer Motion  |
| Charts    | Recharts                                        |
| Backend   | Python FastAPI, Uvicorn                         |
| AI        | Google Gemini 1.5 Flash                         |
| Database  | MongoDB Atlas (pymongo)                         |
| Hosting   | Vercel (frontend) · Render (backend)            |

---

## Project Structure

```
Nimbus/
├── src/                        # React frontend
│   ├── components/             # UI components
│   ├── utils/                  # api.js, parseCSV.js
│   └── data/data.js            # sample data + mock recommendations
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── routes/
│   │   ├── analyze.py          # POST /analyze/upload, /analyze/sample
│   │   └── history.py          # GET/DELETE /history, /history/{id}
│   ├── services/
│   │   ├── gemini.py           # Gemini 1.5 Flash integration
│   │   └── csv_parser.py       # pandas CSV parsing + validation
│   ├── db/
│   │   └── mongo.py            # MongoDB connection
│   ├── requirements.txt
│   └── .env.example
├── public/
│   └── _redirects              # Render SPA routing
├── vercel.json                 # Vercel SPA routing
├── package.json
└── vite.config.js
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier)
- Google Gemini API key (free at aistudio.google.com)

---

### 1. Clone the repo

```bash
git clone https://github.com/diiyeah/Nimbus.git
cd Nimbus
```

---

### 2. Frontend setup

Install dependencies:

```bash
npm install
```

Start the React dev server on **http://localhost:5173**:

```bash
npm run dev
```

---

### 3. Backend setup

#### Create and activate virtual environment

**Windows:**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
```

#### Install Python dependencies

```bash
pip install -r requirements.txt
```

#### Configure environment variables

```bash
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
GEMINI_API_KEY=AIzaSy...your_key_from_aistudio.google.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nimbusai
ALLOWED_ORIGINS=http://localhost:5173
```

#### Start the backend on **http://localhost:8000**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Or if uvicorn is not on PATH (Windows):

```powershell
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

---

### 4. Run both together

Open **two terminals**:

| Terminal 1 — Frontend       | Terminal 2 — Backend                                          |
|-----------------------------|---------------------------------------------------------------|
| `npm run dev`               | `cd backend && uvicorn main:app --reload --port 8000`         |

Then open **http://localhost:5173** in your browser.

---

## API Reference

Interactive docs available at **http://localhost:8000/docs** when the backend is running.

| Method   | Endpoint               | Description                                      |
|----------|------------------------|--------------------------------------------------|
| `GET`    | `/health`              | Liveness check + MongoDB status                  |
| `POST`   | `/analyze/upload`      | Upload CSV → Gemini AI → save → return results   |
| `POST`   | `/analyze/sample`      | Run built-in sample data through Gemini AI       |
| `GET`    | `/history`             | List all past analyses (newest first)            |
| `GET`    | `/history/{id}`        | Get single analysis by ID                        |
| `DELETE` | `/history/{id}`        | Delete a single analysis                         |

---

## CSV Format

Your CSV must include these columns (case-insensitive):

```csv
service,spend,usage
EC2,4820,34
RDS,3100,28
S3,1240,71
```

- `service` — AWS service name
- `spend` — monthly cost in USD (can include `$` and `,`)
- `usage` — utilisation percentage 0–100 (can include `%`)

---

## Deployment

### Frontend → Vercel

1. Import `diiyeah/Nimbus` at [vercel.com/new](https://vercel.com/new)
2. Framework: **Vite** · Build: `npm run build` · Output: `dist`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

### Backend → Render

1. New **Web Service** at [render.com](https://render.com)
2. Connect `diiyeah/Nimbus` · Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add environment variables: `GEMINI_API_KEY`, `MONGODB_URI`, `ALLOWED_ORIGINS`

---

## Features

- **Upload screen** — drag-and-drop CSV with client-side preview and validation
- **AI analysis** — Gemini 1.5 Flash generates cost-saving recommendations
- **Dashboard** — spend trend chart, top services bar chart, waste heatmap, service cards
- **Recommendations** — severity-coded cards with issue, action, and savings estimate
- **History** — all past analyses as cards, click to reload any dashboard
- **Responsive** — desktop sidebar, mobile drawer + bottom tab bar
- **Animations** — Framer Motion throughout: page transitions, count-up stats, skeleton loaders
