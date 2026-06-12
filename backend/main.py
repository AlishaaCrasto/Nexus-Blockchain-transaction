from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import transactions, auth, blockchain

app = FastAPI(title="Nexus API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(blockchain.router, prefix="/blockchain", tags=["blockchain"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "nexus-api"}
