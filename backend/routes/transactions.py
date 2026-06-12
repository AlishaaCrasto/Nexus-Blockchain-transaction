from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import uuid, os, httpx
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ETH_TO_INR = 76000

def headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

class SendRequest(BaseModel):
    to: str
    amount: str
    from_address: Optional[str] = "0x0000...0000"
    tx_hash: Optional[str] = None

@router.get("/")
def get_transactions(wallet: Optional[str] = None):
    with httpx.Client() as client:
        url = f"{SUPABASE_URL}/rest/v1/transactions?order=created_at.desc&limit=20"
        if wallet:
            url += f"&or=(from_address.eq.{wallet},to_address.eq.{wallet})"
        r = client.get(url, headers=headers())
        return {"transactions": r.json()}

@router.get("/{tx_id}")
def get_transaction(tx_id: str):
    with httpx.Client() as client:
        url = f"{SUPABASE_URL}/rest/v1/transactions?id=eq.{tx_id}"
        r = client.get(url, headers=headers())
        data = r.json()
        return data[0] if data else {"error": "Not found"}

@router.post("/save")
def save_transaction(req: SendRequest):
    amount_inr = float(req.amount) * ETH_TO_INR
    tx = {
        "id": f"tx_{uuid.uuid4().hex[:8]}",
        "hash": req.tx_hash or f"0x{uuid.uuid4().hex}",
        "type": "send",
        "amount": req.amount,
        "amount_inr": f"{amount_inr:.2f}",
        "to_address": req.to,
        "from_address": req.from_address,
        "status": "pending",
        "fees_inr": "650",
        "network": "Sepolia Testnet",
    }
    with httpx.Client() as client:
        url = f"{SUPABASE_URL}/rest/v1/transactions"
        r = client.post(url, headers=headers(), json=tx)
        return {"transaction": tx, "saved": r.status_code == 201}
