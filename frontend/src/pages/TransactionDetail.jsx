import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getTransactions } from "../lib/transactions";
import { useToast } from "../components/Toast";

const steps = ["Initiated", "Pending", "Confirmed"];

const statusBanner = {
  confirmed: "bg-success/10 border-success/20 text-success",
  pending:   "bg-warning/10 border-warning/20 text-warning",
  failed:    "bg-danger/10  border-danger/20  text-danger",
};

export default function TransactionDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();
  const tx = getTransactions().find((t) => t.id === id);

  if (!tx) return (
    <Layout>
      <div className="max-w-lg mx-auto text-center mt-20 animate-fade-up">
        <div className="w-16 h-16 bg-elevated rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl border border-border">🔍</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Transaction not found</h2>
        <p className="text-text-muted mb-6">This transaction may not exist or was cleared.</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary px-6 py-2.5">Back to Dashboard</button>
      </div>
    </Layout>
  );

  const stepIndex = tx.status === "confirmed" ? 2 : tx.status === "pending" ? 1 : 0;

  return (
    <Layout>
      <div className="max-w-lg mx-auto animate-fade-up">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-elevated border border-border hover:bg-border flex items-center justify-center text-text-secondary transition-all">←</button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Transaction Details</h1>
            <p className="text-xs text-text-muted">Sepolia Testnet</p>
          </div>
        </div>

        {/* Status banner */}
        <div className={`flex items-center gap-4 border rounded-2xl px-5 py-4 mb-5 ${statusBanner[tx.status] || statusBanner.pending}`}>
          <span className="text-2xl">{tx.status === "confirmed" ? "✓" : tx.status === "failed" ? "✕" : "⏳"}</span>
          <div className="flex-1">
            <p className="font-bold capitalize">{tx.status}</p>
            <p className="text-xs opacity-70">{new Date(tx.created_at).toLocaleString("en-IN")}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{tx.amount} ETH</p>
            <p className="text-xs opacity-70">₹{parseFloat(tx.amount_inr||0).toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="card mb-4">
          {/* Hash */}
          <div className="flex items-center justify-between mb-5 pb-5 border-b border-border">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Transaction Hash</p>
              <p className="font-mono text-text-secondary text-xs truncate">{tx.hash}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(tx.hash); toast("Hash copied","success",1500); }}
              className="ml-3 w-9 h-9 rounded-xl bg-elevated border border-border hover:bg-border flex items-center justify-center text-text-muted transition-all flex-shrink-0">⎘</button>
          </div>

          {/* Details */}
          <div className="space-y-0 mb-6">
            {[
              ["From",    tx.from_address],
              ["To",      tx.to_address],
              ["Memo",    tx.memo || "—"],
              ["Block",   tx.block_number || "Pending"],
              ["Gas",     tx.gas_used ? `${tx.gas_used} units` : "—"],
              ["Fee",     tx.fees_inr ? `₹${tx.fees_inr}` : "—"],
              ["Network", tx.network || "Sepolia Testnet"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start py-3 border-b border-border last:border-0">
                <span className="text-sm text-text-muted w-20 flex-shrink-0">{label}</span>
                <span className="text-sm text-text-primary font-medium text-right font-mono break-all ml-4">{value}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-5">Transaction Progress</p>
            <div className="flex items-center">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      i < stepIndex  ? "bg-success text-white" :
                      i === stepIndex ? "bg-primary text-white shadow-primary" :
                      "bg-elevated text-text-muted border border-border"
                    }`}>{i < stepIndex ? "✓" : i + 1}</div>
                    <span className={`text-xs mt-2 font-semibold ${
                      i === stepIndex ? "text-primary" : i < stepIndex ? "text-success" : "text-text-muted"
                    }`}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 mb-5 rounded-full ${i < stepIndex ? "bg-success" : "bg-elevated"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border-2 border-primary text-primary py-3 rounded-xl font-semibold hover:bg-primary/5 transition-all text-sm">
            🔗 View on Etherscan
          </a>
        </div>
      </div>
    </Layout>
  );
}
