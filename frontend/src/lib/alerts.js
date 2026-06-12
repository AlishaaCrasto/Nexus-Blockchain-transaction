const KEY = "nexus_alerts";

export function getAlerts() {
  return JSON.parse(localStorage.getItem(KEY) || JSON.stringify({
    spendingLimit: { enabled: false, daily: 0.1, weekly: 0.5 },
    lowBalance: { enabled: false, threshold: 0.05 },
  }));
}

export function saveAlerts(alerts) {
  localStorage.setItem(KEY, JSON.stringify(alerts));
}

export function checkSpendingLimit(amountEth) {
  const alerts = getAlerts();
  if (!alerts.spendingLimit.enabled) return null;
  const txs = JSON.parse(localStorage.getItem("nexus_transactions") || "[]");
  const today = new Date().toDateString();
  const todaySpend = txs
    .filter((t) => t.type === "send" && new Date(t.created_at).toDateString() === today)
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const newTotal = todaySpend + parseFloat(amountEth);
  if (newTotal > alerts.spendingLimit.daily) {
    return `Daily spending limit of ${alerts.spendingLimit.daily} ETH will be exceeded`;
  }
  return null;
}

export function checkLowBalance(balanceEth) {
  const alerts = getAlerts();
  if (!alerts.lowBalance.enabled) return null;
  if (parseFloat(balanceEth) < alerts.lowBalance.threshold) {
    return `Balance is below your alert threshold of ${alerts.lowBalance.threshold} ETH`;
  }
  return null;
}
