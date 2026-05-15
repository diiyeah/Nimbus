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
│   │   ├── gemini.py           # Gemini AI integration
│   │   ├── csv_parser.py       # pandas CSV parsing + validation
│   │   └── mock_recommendations.py  # fallback when Gemini is unavailable
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

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

---

### 1. Clone the repo

```bash
git clone https://github.com/diiyeah/Nimbus.git
cd Nimbus
```

---

### 2. Frontend

```bash
npm install
npm run dev
```

Runs on **http://localhost:5173**

---

### 3. Backend

**Windows:**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**macOS / Linux:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Configure `.env`:**
```bash
cp .env.example .env
```

Edit `backend/.env`:
```env
GEMINI_API_KEY=AIzaSy...your_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nimbusai
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Start backend:**
```powershell
# Windows
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

# macOS / Linux
uvicorn main:app --reload --port 8000
```

Runs on **http://localhost:8000** — API docs at **http://localhost:8000/docs**

---

### Run both together

| Terminal 1 — Frontend | Terminal 2 — Backend |
|---|---|
| `npm run dev` | `cd backend && uvicorn main:app --reload --port 8000` |

---

## Deployment

### Frontend → Vercel (already deployed)

Your frontend is live on Vercel. To update it after pushing to GitHub, Vercel auto-deploys on every push to `main`.

**Add the backend URL as an environment variable in Vercel:**
1. Go to your project on [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Add: `VITE_API_URL` = `https://your-backend.onrender.com`
4. Redeploy (Deployments → Redeploy)

---

### Backend → Render

Vercel does **not** support Python backends — deploy the backend to **Render** as a Web Service.

**Steps:**

1. Go to [render.com](https://render.com) → sign in with GitHub

2. Click **New +** → **Web Service**

3. Connect `diiyeah/Nimbus`

4. Configure:

| Setting | Value |
|---|---|
| **Name** | `nimbusai-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port 10000` |

5. Add **Environment Variables** in Render dashboard:

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | your Gemini API key |
| `MONGODB_URI` | your MongoDB Atlas connection string |
| `ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app` |

6. Click **Create Web Service** — Render builds and deploys in ~3 minutes

7. Copy the Render URL (e.g. `https://nimbusai-backend.onrender.com`)

8. Go back to **Vercel** → Settings → Environment Variables → set `VITE_API_URL` to that URL → Redeploy

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check + MongoDB status |
| `POST` | `/analyze/upload` | Upload CSV → Gemini AI → save → return results |
| `POST` | `/analyze/sample` | Run built-in sample data through Gemini AI |
| `GET` | `/history` | List all past analyses (newest first) |
| `GET` | `/history/{id}` | Get single analysis by ID |
| `DELETE` | `/history/{id}` | Delete a single analysis |

---

## CSV Format

```csv
service,spend,usage
EC2,4820,34
RDS,3100,28
S3,1240,71
```

Columns are case-insensitive. `spend` accepts `$` and `,`. `usage` accepts `%`.

---

## Features

- Drag-and-drop CSV upload with client-side preview and validation
- Gemini AI cost-saving recommendations with severity and category
- Spend trend chart, top services bar chart, waste heatmap, service cards
- Analysis history page — click any card to reload that dashboard
- Responsive layout — desktop sidebar, mobile drawer + bottom tab bar
- Skeleton loaders, page transitions, count-up animations
- Fallback mock recommendations when Gemini API is unavailable
