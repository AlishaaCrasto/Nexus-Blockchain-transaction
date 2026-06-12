import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEMO_USERS } from "../lib/demoData";
import { connectWallet } from "../lib/wallet";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [wLoading, setWLoading] = useState(false);
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!user) return setError("Invalid credentials.");
    localStorage.setItem("nexus_user", JSON.stringify(user));
    navigate(user.role === "admin" ? "/admin" : "/dashboard");
  }

  async function handleWallet() {
    setWLoading(true); setError("");
    try {
      const { address } = await connectWallet();
      const user = { email: address, name: `${address.slice(0,6)}...${address.slice(-4)}`, role: "user", wallet: address };
      localStorage.setItem("nexus_user", JSON.stringify(user));
      localStorage.setItem("nexus_wallet", address);
      navigate("/dashboard");
    } catch (err) { setError(err.message); }
    finally { setWLoading(false); }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-primary mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NEXUS</h1>
          <p className="text-text-muted text-sm mt-1">Blockchain Banking Platform</p>
        </div>

        <div className="bg-navy-800 rounded-3xl border border-white/10 p-8 shadow-elevated">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@nexus.in"
                className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-text-muted font-medium">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button onClick={handleWallet} disabled={wLoading}
            className="w-full border border-white/10 bg-white/5 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm active:scale-95">
            <span className="text-xl">🦊</span>
            {wLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : "Connect with MetaMask"}
          </button>

          <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-text-muted mb-2 uppercase tracking-widest">Demo Access</p>
            <div className="space-y-1.5 text-xs text-text-muted">
              <p>👤 <span className="font-mono text-white/60">demo@nexus.in / demo123</span></p>
              <p>⚙️ <span className="font-mono text-white/60">admin@nexus.in / admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
