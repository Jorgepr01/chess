# Chess Wrapped - Project Documentation

## 🚀 Project Overview
**Chess Wrapped** is an interactive web application that generates a statistical summary of a user's Chess.com games, inspired by "Spotify Wrapped." It provides visualizations for performance, opening analysis, playstyle identification, and move heatmaps.

### Key Features
*   **Annual Summary:** Win/loss/draw percentages.
*   **Opening Analysis:** Most used openings as White and Black.
*   **Playstyle:** Dynamic identification based on game stats.
*   **Nemesis & VIP Client:** Tracking frequent winners and losers against the user.
*   **Interactive Heatmap:** Visualizes the most traversed squares on the board.
*   **Animated Presentation:** Visual "stories" with background music (`framer-motion` & `react-insta-stories`).

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React 19 (Vite)
*   **Styling:** Tailwind CSS + shadcn/ui
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **API Client:** Axios (pointing to `http://localhost:8000/api` or `/api` in production)

### Backend
*   **Framework:** FastAPI (Python)
*   **Chess Logic:** `python-chess` for PGN processing.
*   **Data Science:** `pandas` and `numpy` for advanced analytics.
*   **API Integration:** `requests` for fetching data from Chess.com's public API.
*   **Caching:** Results are cached as JSON in the system's temporary directory.

---

## ⚙️ Project Structure
```text
/
├── api/                # Python Backend (FastAPI)
│   ├── main.py         # Entry point & API routes
│   ├── analisis.py     # Core chess analysis logic
│   ├── analisis_hib.py # Advanced analysis using Pandas
│   ├── aperturas.py    # Chess opening database
│   └── modelos/        # Pydantic models (schemas)
├── src/                # React Frontend
│   ├── main.jsx        # Frontend entry point
│   ├── App.jsx         # Main router (HomeSearch vs. Dashboard)
│   ├── Dashboard.jsx   # Main analysis view
│   ├── components/     # UI components & Analytics modules
│   └── lib/            # Utility functions (tailwind-merge, etc.)
├── public/             # Static assets (images, svg, mp3)
├── vercel.json         # Deployment configuration for Vercel
└── package.json        # Frontend dependencies & scripts
```

---

## 💡 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/)
*   [Python 3.9+](https://www.python.org/)

### 1. Backend Setup
```bash
# From the root directory
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the backend
cd api
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup
```bash
# In a new terminal from the root
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🚢 Deployment
The project is configured for **Vercel**.
*   The backend is deployed as serverless functions (mapped via `vercel.json`).
*   The frontend is built via Vite.
*   Environment variables are managed in Vercel, with `PROD` detection in `src/api.js`.

---

## 📜 Development Conventions
*   **Surgical Edits:** When modifying backend logic, check both `analisis.py` and `analisis_hib.py` as they represent different iterations of the analysis engine.
*   **Component Library:** Uses `shadcn/ui`. New components should be added to `src/components/ui`.
*   **API Communication:** Always use the centralized `api` client in `src/api.js`.
*   **Caching:** Be aware that the backend caches reports in the temp folder (`tempfile.gettempdir()`). Delete these files manually if you need to force a re-calculation during development.
