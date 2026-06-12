import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, network };
}

export function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export async function getBalance(address) {
  if (!window.ethereum) return "0";
  const provider = new ethers.BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}
