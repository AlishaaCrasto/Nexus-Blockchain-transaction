from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

DEMO_USERS = [
    {"email": "demo@nexus.in", "password": "demo123", "name": "Arjun Sharma", "role": "user"},
    {"email": "admin@nexus.in", "password": "admin123", "name": "Priya Mehta", "role": "admin"},
]

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    user = next((u for u in DEMO_USERS if u["email"] == req.email and u["password"] == req.password), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"user": {k: v for k, v in user.items() if k != "password"}, "token": "demo-token-123"}
