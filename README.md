# NEXUS - Blockchain Banking Platform

## Quick Start

### Frontend
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd backend
uvicorn main:app --reload
# → http://localhost:8000
```

### Admin Dashboard
```bash
cd admin
streamlit run dashboard.py
# → http://localhost:8501
```

## Demo Credentials
- User: `demo@nexus.in` / `demo123`
- Admin: `admin@nexus.in` / `admin123`

## Stack
- Frontend: React + Vite + Tailwind + Ethers.js
- Backend: FastAPI + Web3.py
- Database: Supabase
- Smart Contract: Solidity (Sepolia Testnet)
- Admin: Streamlit
