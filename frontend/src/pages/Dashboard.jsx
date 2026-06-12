import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "../components/Layout";
import { connectWallet, shortAddress, getBalance } from "../lib/wallet";
import { getTransactions } from "../lib/transactions";
import { useToast } from "../components/Toast";

const ETH_TO_INR = 76000;
const ranges = ["1D", "1W", "1M", "ALL"];

function buildChartData(transactions, range) {
  const now = new Date();
  const sends = transactions.filter((t) => t.type === "send" && t.created_at);

  let buckets = [];
  let format;

  if (range === "1D") {
    // hourly buckets for last 24h
    buckets = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now);
      d.setHours(now.getHours() - (23 - i), 0, 0, 0);
      return { label: `${d.getHours()}:00`, from: d, to: new Date(d.getTime() + 3600000), value: 0 };
    });
  } else if (range === "1W") {
    // daily buckets for last 7 days
    buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), from: d, to: end, value: 0 };
    });
  } else if (range === "1M") {
    // weekly buckets for last 4 weeks
    buckets = Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (3 - i) * 7 - 6);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setDate(d.getDate() + 6); end.setHours(23, 59, 59, 999);
      return { label: `W${i + 1}`, from: d, to: end, value: 0 };
    });
  } else {
    // monthly buckets for last 6 months
    buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59);
      return { label: d.toLocaleDateString("en-IN", { month: "short" }), from: d, to: end, value: 0 };
    });
  }

  sends.forEach((tx) => {
    const txDate = new Date(tx.created_at);
    const bucket = buckets.find((b) => txDate >= b.from && txDate <= b.to);
    if (bucket) bucket.value += parseFloat(tx.amount_inr || 0);
  });

  return buckets.map(({ label, value }) => ({ label, value: Math.round(value) }));
}

const statusConfig = {
  confirmed: { icon: "✓", color: "text-success",  bg: "bg-success/10",  label: "Confirmed" },
  pending:   { icon: "⏳", color: "text-warning",  bg: "bg-warning/10",  label: "Pending"   },
  failed:    { icon: "✕", color: "text-danger",   bg: "bg-danger/10",   label: "Failed"    },
};

function Skeleton({ className }) {
  return <div className={`bg-elevated rounded-xl animate-pulse ${className}`} />;
}

export default function Dashboard() {
  const [range, setRange]           = useState("1W");
  const [walletAddress, setWallet]  = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [transactions, setTxs]      = useState([]);
  const [chartData, setChartData]   = useState([]);
  const [loadingTx, setLoadingTx]   = useState(true);
  const [loadingW, setLoadingW]     = useState(true);
  const navigate  = useNavigate();
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("nexus_user") || "{}");

  useEffect(() => { autoConnect(); }, []);
  useEffect(() => { fetchTxs(); }, [walletAddress]);
  useEffect(() => { setChartData(buildChartData(transactions, range)); }, [transactions, range]);

  async function autoConnect() {
    try {
      const saved = localStorage.getItem("nexus_wallet") || user.wallet;
      if (saved) {
        setWallet(saved);
        const bal = await getBalance(saved);
        const balFloat = parseFloat(bal).toFixed(4);
        setEthBalance(balFloat);
        // check low balance alert
        const { checkLowBalance } = await import("../lib/alerts");
        const warning = checkLowBalance(balFloat);
        if (warning) toast(warning, "warning");
        return;
      }
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts[0]) {
          setWallet(accounts[0]);
          const bal = await getBalance(accounts[0]);
          setEthBalance(parseFloat(bal).toFixed(4));
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoadingW(false); }
  }

  function fetchTxs() {
    setLoadingTx(true);
    try { setTxs(getTransactions(walletAddress)); }
    catch { setTxs([]); }
    finally { setLoadingTx(false); }
  }

  async function handleConnect() {
    try {
      const { address } = await connectWallet();
      setWallet(address);
      localStorage.setItem("nexus_wallet", address);
      const bal = await getBalance(address);
      setEthBalance(parseFloat(bal).toFixed(4));
      toast("Wallet connected", "success");
    } catch (e) { toast(e.message, "error"); }
  }

  const balanceINR = ethBalance
    ? (parseFloat(ethBalance) * 76000).toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : null;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        {walletAddress ? (
          <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-4 py-2 text-sm text-success font-semibold">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            {shortAddress(walletAddress)}
            <button onClick={() => { navigator.clipboard.writeText(walletAddress); toast("Copied", "success", 1500); }}
              className="text-success/60 hover:text-success ml-1 transition-colors">⎘</button>
          </div>
        ) : (
          <button onClick={handleConnect} className="btn-primary text-sm flex items-center gap-2">
            <span>🦊</span> Connect Wallet
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Balance + Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">Total Balance</p>
              {loadingW ? (
                <><Skeleton className="h-10 w-52 mb-2" /><Skeleton className="h-4 w-32" /></>
              ) : balanceINR ? (
                <>
                  <h2 className="text-4xl font-bold text-text-primary tracking-tight">₹{balanceINR}</h2>
                  <p className="text-sm text-text-muted mt-1.5">{ethBalance} ETH · Sepolia Testnet</p>
                </>
              ) : (
                <div className="py-2">
                  <p className="text-text-muted mb-3">Connect wallet to view balance</p>
                  <button onClick={handleConnect} className="btn-primary text-sm">🦊 Connect Wallet</button>
                </div>
              )}
            </div>
            {balanceINR && <span className="badge-primary">Sepolia</span>}
          </div>

          {walletAddress && (
            <div className="flex items-center gap-3 bg-elevated rounded-xl px-4 py-2.5 mb-5 border border-border">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Wallet</span>
              <span className="font-mono text-text-secondary text-xs flex-1 truncate">{walletAddress}</span>
            </div>
          )}

          {/* Chart */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">Spending Trend</p>
              {chartData.length > 0 && chartData.some((d) => d.value > 0) ? (
                <p className="text-xs text-text-muted mt-0.5">
                  Total: ₹{chartData.reduce((s, d) => s + d.value, 0).toLocaleString("en-IN")} sent
                </p>
              ) : (
                <p className="text-xs text-text-muted mt-0.5">No transactions in this period</p>
              )}
            </div>
            <div className="flex gap-1 bg-elevated rounded-xl p-1 border border-border">
              {ranges.map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    range === r ? "bg-card text-text-primary shadow-card" : "text-text-muted hover:text-text-secondary"
                  }`}>{r}</button>
              ))}
            </div>
          </div>

          {chartData.length > 0 && chartData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v === 0 ? "₹0" : `₹${(v/1000).toFixed(0)}k`} width={45} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.07)", fontSize: "12px" }}
                  formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Sent"]}
                />
                <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2.5}
                  fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: "#6366F1", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center bg-elevated rounded-2xl border border-border">
              <div className="text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm text-text-muted">Send transactions to see your spending trend</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card flex flex-col gap-3">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Quick Actions</p>
          <button onClick={() => navigate("/send")}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-primary">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl">↑</div>
            <div className="text-left">
              <p className="font-bold text-sm">Send</p>
              <p className="text-xs text-white/60">Transfer ETH</p>
            </div>
          </button>
          <button onClick={() => navigate("/receive")}
            className="w-full bg-gradient-to-r from-secondary to-purple-600 text-white rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-secondary">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl">↓</div>
            <div className="text-left">
              <p className="font-bold text-sm">Receive</p>
              <p className="text-xs text-white/60">Show QR code</p>
            </div>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate("/security")}
              className="bg-elevated border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:bg-border transition-all active:scale-95">
              <span className="text-xl">🛡</span>
              <span className="text-xs font-semibold text-text-secondary">Security</span>
            </button>
            <button onClick={fetchTxs}
              className="bg-elevated border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:bg-border transition-all active:scale-95">
              <span className="text-xl">↻</span>
              <span className="text-xs font-semibold text-text-secondary">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-text-primary">Recent Transactions</h3>
            <p className="text-xs text-text-muted mt-0.5">{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={fetchTxs} className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors">Refresh</button>
        </div>

        {loadingTx ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-40" /></div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-elevated rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl border border-border">📭</div>
            <p className="font-semibold text-text-primary mb-1">No transactions yet</p>
            <p className="text-sm text-text-muted mb-6">Send your first transaction to get started</p>
            <button onClick={() => navigate("/send")} className="btn-primary px-6 py-2.5 text-sm">Send ETH</button>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => {
              const s = statusConfig[tx.status] || statusConfig.pending;
              return (
                <div key={tx.id} onClick={() => navigate(`/transaction/${tx.id}`)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-elevated cursor-pointer transition-all group border border-transparent hover:border-border">
                  <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center ${s.color} font-bold text-sm flex-shrink-0`}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">{s.label}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${s.bg} ${s.color}`}>{tx.type}</span>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {tx.type === "send" ? `To ${tx.to_address?.slice(0,14)}...` : `From ${tx.from_address?.slice(0,14)}...`}
                      {" · "}{new Date(tx.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${tx.type === "send" ? "text-danger" : "text-success"}`}>
                      {tx.type === "send" ? "−" : "+"}₹{parseFloat(tx.amount_inr || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-text-muted">{tx.amount} ETH</p>
                  </div>
                  <span className="text-border group-hover:text-text-muted transition-colors text-lg">›</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
