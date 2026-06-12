import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Layout from "../components/Layout";
import { connectWallet, shortAddress } from "../lib/wallet";
import { useToast } from "../components/Toast";

export default function Receive() {
  const [walletAddress, setWalletAddress] = useState(null);
  const navigate  = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("nexus_wallet");
    if (saved) { setWalletAddress(saved); return; }
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((a) => { if (a[0]) setWalletAddress(a[0]); });
    }
  }, []);

  async function handleConnect() {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
      localStorage.setItem("nexus_wallet", address);
    } catch (e) { toast(e.message, "error"); }
  }

  function copy() {
    navigator.clipboard.writeText(walletAddress || "0x4675...77Ef");
    toast("Address copied", "success", 2000);
  }

  const addr = walletAddress || "0x4675...77Ef";

  return (
    <Layout>
      <div className="max-w-md mx-auto animate-fade-up">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-elevated border border-border hover:bg-border flex items-center justify-center text-text-secondary transition-all">←</button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Receive</h1>
            <p className="text-xs text-text-muted">Share your address to receive ETH</p>
          </div>
        </div>

        <div className="card text-center">
          <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 text-success text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wide">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Ethereum · Sepolia Testnet
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="p-5 bg-white rounded-2xl shadow-elevated border border-border">
              <QRCodeSVG value={`ethereum:${addr}`} size={176} bgColor="#ffffff" fgColor="#0F172A" level="M" />
            </div>
          </div>

          <div className="bg-elevated rounded-2xl px-4 py-3.5 mb-3 border border-border text-left">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Wallet Address</p>
            <p className="font-mono text-text-primary text-sm break-all leading-relaxed">{addr}</p>
          </div>

          <div className="bg-elevated rounded-2xl px-4 py-3.5 mb-6 border border-border text-left">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">VPA (UPI)</p>
            <p className="font-medium text-text-primary">user@oksbi</p>
          </div>

          <div className="flex gap-3">
            <button onClick={copy} className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2">⎘ Copy</button>
            <button onClick={() => navigator.share?.({ title: "My Nexus Address", text: addr }) || copy()}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">↑ Share</button>
          </div>

          {!walletAddress && (
            <button onClick={handleConnect} className="mt-4 text-sm text-primary hover:text-primary-dark font-semibold transition-colors">
              🦊 Connect wallet for your real address
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
