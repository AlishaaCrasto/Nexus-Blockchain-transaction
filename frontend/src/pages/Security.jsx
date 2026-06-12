import { useState } from "react";
import Layout from "../components/Layout";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";

export default function Security() {
  const [multiSig,  setMultiSig]  = useState(false);
  const [eMandates, setEMandates] = useState(false);
  const { toast } = useToast();
  const navigate  = useNavigate();

  const devices = [
    { name: "Chrome · Windows", icon: "💻", current: true  },
    { name: "Safari · iPhone",  icon: "📱", current: false },
    { name: "Firefox · Windows",icon: "🖥", current: false },
  ];

  function toggle(val, set, label) {
    set(!val);
    toast(`${label} ${!val ? "enabled" : "disabled"}`, !val ? "success" : "info", 2000);
  }

  return (
    <Layout>
      <div className="max-w-2xl animate-fade-up">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Security Center</h1>
          <p className="text-text-muted text-sm mt-1">Manage your account security settings</p>
        </div>

        {/* Alert */}
        <div className="bg-danger/10 border border-danger/20 rounded-2xl px-5 py-4 flex items-start gap-3 mb-6">
          <span className="text-xl mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="font-bold text-danger text-sm">Action Required</p>
            <p className="text-danger/70 text-xs mt-0.5">RBI e-mandate registration pending for recurring transactions over ₹5,000</p>
          </div>
          <button className="text-xs text-danger font-bold hover:underline flex-shrink-0">Fix now</button>
        </div>

        {/* Wallet Status */}
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-2xl border border-success/20">🛡</div>
              <div>
                <p className="font-bold text-text-primary">Wallet Connection</p>
                <p className="text-xs text-text-muted mt-0.5">Last verified today at 13:38</p>
              </div>
            </div>
            <div className="flex items-center gap-2 badge-success px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              SECURE
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-4">
          <h3 className="font-bold text-text-primary mb-5">Security Controls</h3>
          <div className="space-y-1">
            {[
              { label: "Multi-Signature Authentication", desc: "Require multiple approvals for large transactions", val: multiSig,  set: setMultiSig  },
              { label: "E-Mandates",                     desc: "Enable recurring crypto purchases and transfers",  val: eMandates, set: setEMandates },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                </div>
                <button onClick={() => toggle(item.val, item.set, item.label)}
                  className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${item.val ? "bg-primary" : "bg-elevated border border-border"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${item.val ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Aadhaar Vault</p>
                <p className="text-xs text-text-muted mt-0.5">Manage e-Aadhaar document vault</p>
              </div>
              <button onClick={() => toast("Aadhaar Vault coming soon", "info")} className="btn-secondary text-xs px-4 py-2">Manage</button>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Spending Limits & Alerts</p>
                <p className="text-xs text-text-muted mt-0.5">Set daily limits and low balance alerts</p>
              </div>
              <button onClick={() => navigate("/alerts")} className="btn-secondary text-xs px-4 py-2">Configure</button>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="card">
          <h3 className="font-bold text-text-primary mb-5">Active Sessions</h3>
          <div className="space-y-1">
            {devices.map((d) => (
              <div key={d.name} className="flex items-center gap-4 py-3.5 border-b border-border last:border-0">
                <div className="w-10 h-10 bg-elevated rounded-xl flex items-center justify-center text-lg border border-border">{d.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{d.name}</p>
                  <p className="text-xs text-text-muted">{d.current ? "Current session" : "Last active 2h ago"}</p>
                </div>
                {d.current
                  ? <span className="badge-success">Active</span>
                  : <button onClick={() => toast("Session revoked","success",2000)} className="text-xs text-danger hover:underline font-semibold">Revoke</button>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
