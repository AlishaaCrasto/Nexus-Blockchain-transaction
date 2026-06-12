import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getAlerts, saveAlerts } from "../lib/alerts";
import { useToast } from "../components/Toast";

export default function Alerts() {
  const [alerts, setAlerts] = useState(getAlerts());
  const navigate  = useNavigate();
  const { toast } = useToast();

  function update(path, value) {
    const updated = { ...alerts };
    const keys = path.split(".");
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    setAlerts(updated);
    saveAlerts(updated);
  }

  function save() {
    saveAlerts(alerts);
    toast("Alert settings saved", "success");
    navigate("/security");
  }

  return (
    <Layout>
      <div className="max-w-lg animate-fade-up">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-elevated border border-border hover:bg-border flex items-center justify-center text-text-secondary transition-all">←</button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Alerts & Limits</h1>
            <p className="text-xs text-text-muted">Set spending limits and balance alerts</p>
          </div>
        </div>

        {/* Spending Limit */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-text-primary">Spending Limit</h3>
              <p className="text-xs text-text-muted mt-0.5">Get warned when you exceed your daily limit</p>
            </div>
            <button onClick={() => update("spendingLimit.enabled", !alerts.spendingLimit.enabled)}
              className={`w-12 h-6 rounded-full transition-all relative ${alerts.spendingLimit.enabled ? "bg-primary" : "bg-elevated border border-border"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${alerts.spendingLimit.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {alerts.spendingLimit.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Daily Limit (ETH)</label>
                <input type="number" value={alerts.spendingLimit.daily} step="0.01" min="0.01"
                  onChange={(e) => update("spendingLimit.daily", parseFloat(e.target.value))}
                  className="input" />
                <p className="text-xs text-text-muted mt-1">≈ ₹{(alerts.spendingLimit.daily * 76000).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Weekly Limit (ETH)</label>
                <input type="number" value={alerts.spendingLimit.weekly} step="0.05" min="0.05"
                  onChange={(e) => update("spendingLimit.weekly", parseFloat(e.target.value))}
                  className="input" />
                <p className="text-xs text-text-muted mt-1">≈ ₹{(alerts.spendingLimit.weekly * 76000).toLocaleString("en-IN")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Low Balance Alert */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-text-primary">Low Balance Alert</h3>
              <p className="text-xs text-text-muted mt-0.5">Get notified when balance drops below threshold</p>
            </div>
            <button onClick={() => update("lowBalance.enabled", !alerts.lowBalance.enabled)}
              className={`w-12 h-6 rounded-full transition-all relative ${alerts.lowBalance.enabled ? "bg-primary" : "bg-elevated border border-border"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${alerts.lowBalance.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {alerts.lowBalance.enabled && (
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Alert Threshold (ETH)</label>
              <input type="number" value={alerts.lowBalance.threshold} step="0.01" min="0.001"
                onChange={(e) => update("lowBalance.threshold", parseFloat(e.target.value))}
                className="input" />
              <p className="text-xs text-text-muted mt-1">Alert when balance drops below {alerts.lowBalance.threshold} ETH (≈ ₹{(alerts.lowBalance.threshold * 76000).toLocaleString("en-IN")})</p>
            </div>
          )}
        </div>

        <button onClick={save} className="btn-primary w-full py-3.5">Save Settings</button>
      </div>
    </Layout>
  );
}
