const notifications = [
  { id: 1, type: "pending", label: "Transaction Sent", detail: "1.0 ETH → ₹76,000.00 INR", time: "13:38" },
  { id: 2, type: "pending", label: "Pending Confirmation", detail: "0.5 ETH → ₹38,000.00 INR", time: "12:10" },
  { id: 3, type: "success", label: "Confirmed", detail: "1.0 ETH → ₹76,000.00 INR", time: "09:22" },
];

const styles = {
  pending: "bg-yellow-50 border-yellow-200 text-yellow-700",
  success: "bg-green-50 border-green-200 text-green-700",
};

const dots = {
  pending: "bg-yellow-400",
  success: "bg-green-400",
};

export default function NotificationBar() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-center gap-3 border rounded-xl px-4 py-3 min-w-[220px] text-sm ${styles[n.type]}`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dots[n.type]}`} />
          <div>
            <p className="font-medium">{n.label}</p>
            <p className="text-xs opacity-75">{n.detail} · {n.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
