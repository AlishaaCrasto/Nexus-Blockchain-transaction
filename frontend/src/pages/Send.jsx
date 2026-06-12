import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import Layout from "../components/Layout";
import { ETH_TO_INR } from "../lib/demoData";
import { saveTransaction } from "../lib/transactions";
import { getContacts, getRecentRecipients, saveContact } from "../lib/contacts";
import { checkSpendingLimit } from "../lib/alerts";
import { useToast } from "../components/Toast";

const STEPS = ["Recipient", "Amount", "Confirm"];
function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />;
}

export default function Send() {
  const [step, setStep]           = useState(0);
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [resolved, setResolved]   = useState(false);
  const [amount, setAmount]       = useState("");
  const [memo, setMemo]           = useState("");
  const [sending, setSending]     = useState(false);
  const [doneTx, setDoneTx]       = useState(null);
  const [contacts, setContacts]   = useState([]);
  const [recents, setRecents]     = useState([]);
  const [showBook, setShowBook]   = useState(false);
  const [limitWarning, setLimitWarning] = useState(null);
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const { toast }    = useToast();

  useEffect(() => {
    setContacts(getContacts());
    setRecents(getRecentRecipients());
    const prefill = params.get("to");
    const name    = params.get("name");
    if (prefill) { setRecipient(prefill); setResolved(true); if (name) setRecipientName(name); }
  }, []);

  function selectRecipient(address, name = "") {
    setRecipient(address);
    setRecipientName(name);
    setResolved(true);
    setShowBook(false);
  }

  function handleRecipientChange(val) {
    setRecipient(val);
    setRecipientName("");
    setResolved(val.length > 10);
    const match = contacts.find((c) => c.address.toLowerCase() === val.toLowerCase());
    if (match) setRecipientName(match.name);
  }

  function handleAmountChange(val) {
    setAmount(val);
    const warning = checkSpendingLimit(val);
    setLimitWarning(warning);
  }

  function inrEquivalent() {
    return ((parseFloat(amount) || 0) * ETH_TO_INR).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  async function handleSend() {
    setSending(true);
    try {
      if (!window.ethereum) throw new Error("MetaMask not found.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer      = await provider.getSigner();
      const fromAddress = await signer.getAddress();
      toast("Waiting for MetaMask confirmation...", "pending", 0);
      const tx = await signer.sendTransaction({ to: recipient, value: ethers.parseEther(amount) });
      const saved = saveTransaction({ hash: tx.hash, to: recipient, amount, fromAddress, memo });
      toast("Transaction submitted to network", "success");
      setDoneTx({ ...tx, saved });
      tx.wait().then(() => {
        const all = JSON.parse(localStorage.getItem("nexus_transactions") || "[]");
        localStorage.setItem("nexus_transactions", JSON.stringify(
          all.map((t) => t.id === saved.id ? { ...t, status: "confirmed" } : t)
        ));
        toast("Transaction confirmed on Sepolia!", "success");
      }).catch(console.error);
    } catch (e) { toast(e.message || "Transaction failed", "error"); }
    finally { setSending(false); }
  }

  const favourites = contacts.filter((c) => c.favourite);

  if (doneTx) return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 text-center animate-fade-up">
        <div className="relative inline-flex mb-6">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center border-2 border-success/20">
            <span className="text-5xl text-success">✓</span>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-success/20 animate-ping opacity-30" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Transaction Sent</h2>
        <p className="text-text-muted mb-1">{amount} ETH → ₹{inrEquivalent()} INR</p>
        {memo && <p className="text-sm text-text-muted italic mb-1">"{memo}"</p>}
        <p className="text-sm text-text-muted mb-2">Pending confirmation on Sepolia</p>
        <a href={`https://sepolia.etherscan.io/tx/${doneTx.hash}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary text-sm hover:underline font-medium">
          🔗 View on Etherscan
        </a>

        {/* Receipt card */}
        <div className="card mt-6 text-left space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Transaction Receipt</p>
          {[
            ["To",      recipientName || `${recipient.slice(0,10)}...`],
            ["Amount",  `${amount} ETH`],
            ["Value",   `₹${inrEquivalent()}`],
            ["Memo",    memo || "—"],
            ["Network", "Sepolia Testnet"],
            ["Hash",    `${doneTx.hash.slice(0,18)}...`],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
              <span className="text-text-muted">{l}</span>
              <span className="font-medium text-text-primary font-mono text-xs">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => { setDoneTx(null); setStep(0); setRecipient(""); setAmount(""); setMemo(""); }} className="btn-secondary flex-1 py-3">Send Again</button>
          <button onClick={() => navigate("/dashboard")} className="btn-primary flex-1 py-3">Dashboard</button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
            className="w-9 h-9 rounded-xl bg-elevated border border-border hover:bg-border flex items-center justify-center text-text-secondary transition-all">←</button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Send Transaction</h1>
            <p className="text-xs text-text-muted">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? "bg-success text-white" : i === step ? "bg-primary text-white shadow-primary" : "bg-elevated text-text-muted border border-border"
                }`}>{i < step ? "✓" : i + 1}</div>
                <span className={`text-xs mt-1.5 font-semibold ${i === step ? "text-primary" : "text-text-muted"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${i < step ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="card animate-fade-up">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-text-primary mb-1">Who are you sending to?</h3>
                <p className="text-sm text-text-muted mb-4">Enter address or pick from contacts</p>

                {/* Favourites */}
                {favourites.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">★ Favourites</p>
                    <div className="flex gap-2 flex-wrap">
                      {favourites.map((c) => (
                        <button key={c.id} onClick={() => selectRecipient(c.address, c.name)}
                          className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-xl px-3 py-2 text-sm hover:bg-warning/20 transition-all">
                          <span>{c.emoji}</span>
                          <span className="font-semibold text-text-primary">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent recipients */}
                {recents.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Recent</p>
                    <div className="flex gap-2 flex-wrap">
                      {recents.map((r, i) => (
                        <button key={i} onClick={() => selectRecipient(r.address, r.name || "")}
                          className="flex items-center gap-2 bg-elevated border border-border rounded-xl px-3 py-2 text-sm hover:bg-border transition-all">
                          <span>{r.emoji}</span>
                          <span className="font-mono text-xs text-text-secondary">{r.name || `${r.address.slice(0,8)}...`}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input value={recipient} onChange={(e) => handleRecipientChange(e.target.value)}
                    placeholder="0x... or paste address" className="input pr-24" />
                  <button onClick={() => setShowBook(!showBook)}
                    className="absolute right-3 top-2.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-all">
                    📒 Book
                  </button>
                </div>

                {/* Address book dropdown */}
                {showBook && contacts.length > 0 && (
                  <div className="mt-2 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
                    {contacts.map((c) => (
                      <button key={c.id} onClick={() => selectRecipient(c.address, c.name)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-all border-b border-border last:border-0 text-left">
                        <span className="text-xl">{c.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                          <p className="font-mono text-xs text-text-muted truncate">{c.address}</p>
                        </div>
                        {c.favourite && <span className="text-warning text-xs">★</span>}
                      </button>
                    ))}
                  </div>
                )}

                {resolved && recipient && (
                  <div className="mt-3 flex items-center justify-between text-sm text-success bg-success/10 border border-success/20 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">✓</span>
                      <span>{recipientName ? `Sending to ${recipientName}` : "Address validated"}</span>
                    </div>
                    <button onClick={() => navigate("/address-book")} className="text-xs text-primary font-semibold hover:underline">Save</button>
                  </div>
                )}
              </div>
              <button onClick={() => setStep(1)} disabled={!recipient} className="btn-primary w-full py-3.5">Continue →</button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-text-primary mb-1">How much to send?</h3>
                <p className="text-sm text-text-muted mb-4">
                  To: <span className="font-semibold text-text-primary">{recipientName || `${recipient.slice(0,12)}...`}</span>
                </p>
                <div className="relative">
                  <input type="number" value={amount} onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00" step="0.001" min="0.0001"
                    className="input text-2xl font-bold pr-24 py-4" />
                  <div className="absolute right-3 top-3.5 flex items-center gap-2">
                    <button onClick={() => handleAmountChange("0.01")} className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-all">MAX</button>
                    <span className="text-sm font-semibold text-text-muted">ETH</span>
                  </div>
                </div>
                {amount && (
                  <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex justify-between">
                    <span className="text-sm text-primary font-medium">INR equivalent</span>
                    <span className="text-sm font-bold text-primary">₹{inrEquivalent()}</span>
                  </div>
                )}
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Memo (optional)</label>
                <input value={memo} onChange={(e) => setMemo(e.target.value)}
                  placeholder="e.g. Rent payment, Coffee, Freelance..." className="input text-sm" maxLength={60} />
                {memo && <p className="text-xs text-text-muted mt-1 text-right">{memo.length}/60</p>}
              </div>

              {limitWarning && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger flex items-start gap-2">
                  <span>⚠️</span><span>{limitWarning}</span>
                </div>
              )}

              <div className="bg-warning/10 border border-warning/20 rounded-xl px-4 py-3 text-sm text-warning flex items-start gap-2">
                <span>⚠️</span><span>Real Sepolia testnet transaction. Ensure you have enough test ETH for gas.</span>
              </div>
              <button onClick={() => setStep(2)} disabled={!amount || parseFloat(amount) <= 0} className="btn-primary w-full py-3.5">Review →</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-text-primary mb-1">Confirm Transaction</h3>
                <p className="text-sm text-text-muted mb-4">Review before signing with MetaMask</p>
              </div>
              <div className="bg-elevated rounded-2xl p-5 border border-border space-y-1">
                {[
                  ["To",        recipientName ? <span>{recipientName} <span className="text-text-muted font-mono text-xs">({recipient.slice(0,10)}...)</span></span> : <span className="font-mono text-xs">{recipient.slice(0,20)}...</span>],
                  ["Amount",    <span className="font-bold text-text-primary">{amount} ETH</span>],
                  ["INR Value", <span>₹{inrEquivalent()}</span>],
                  ["Memo",      <span className="italic">{memo || "—"}</span>],
                  ["Network",   <span className="badge-primary">Sepolia</span>],
                  ["Est. Gas",  <span>~₹650</span>],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                    <span className="text-sm text-text-muted">{label}</span>
                    <span className="text-sm text-text-primary">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm font-bold text-text-primary">Total</span>
                  <span className="text-sm font-bold text-text-primary">₹{(parseFloat(inrEquivalent().replace(/,/g,""))+650).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <p className="text-xs text-center text-text-muted">🦊 MetaMask will open to sign this transaction</p>
              <button onClick={handleSend} disabled={sending} className="btn-primary w-full py-3.5 flex items-center justify-center gap-3">
                {sending ? <><Spinner /> Waiting for MetaMask...</> : "🦊 Confirm & Send"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
