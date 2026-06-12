from fastapi import APIRouter
from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

RPC_URL = os.getenv("RPC_URL", "https://sepolia.infura.io/v3/YOUR_KEY")

def get_web3():
    return Web3(Web3.HTTPProvider(RPC_URL))

@router.get("/status")
def blockchain_status():
    try:
        w3 = get_web3()
        connected = w3.is_connected()
        block = w3.eth.block_number if connected else None
        return {"connected": connected, "latestBlock": block, "network": "Sepolia Testnet"}
    except Exception as e:
        return {"connected": False, "error": str(e)}

@router.get("/balance/{address}")
def get_balance(address: str):
    try:
        w3 = get_web3()
        if not w3.is_connected():
            return {"error": "Not connected to blockchain"}
        checksum = Web3.to_checksum_address(address)
        balance_wei = w3.eth.get_balance(checksum)
        balance_eth = w3.from_wei(balance_wei, "ether")
        return {"address": address, "balance_eth": str(balance_eth), "balance_inr": str(float(balance_eth) * 76000)}
    except Exception as e:
        return {"error": str(e)}
