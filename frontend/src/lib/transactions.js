// Local storage based transaction store - works without any backend
const KEY = "nexus_transactions";

export function saveTransaction({ hash, to, amount, fromAddress, memo = "" }) {
  const amountINR = (parseFloat(amount) * 76000).toFixed(2);
  const tx = {
    id: `tx_${Math.random().toString(36).slice(2, 10)}`,
    hash,
    type: "send",
    amount,
    amount_inr: amountINR,
    to_address: to,
    from_address: fromAddress,
    memo,
    status: "pending",
    fees_inr: "650",
    network: "Sepolia Testnet",
    created_at: new Date().toISOString(),
  };
  const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
  existing.unshift(tx);
  localStorage.setItem(KEY, JSON.stringify(existing));
  return tx;
}

export function getTransactions(walletAddress) {
  const all = JSON.parse(localStorage.getItem(KEY) || "[]");
  if (!walletAddress) return all;
  return all.filter(
    (tx) => tx.from_address?.toLowerCase() === walletAddress?.toLowerCase() ||
             tx.to_address?.toLowerCase() === walletAddress?.toLowerCase()
  );
}
