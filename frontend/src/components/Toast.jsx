import { useState, createContext, useContext, useCallback } from "react";

const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

const config = {
  success: { bar: "bg-success",  text: "text-success",  bg: "bg-success/10  border-success/20"  },
  error:   { bar: "bg-danger",   text: "text-danger",   bg: "bg-danger/10   border-danger/20"   },
  info:    { bar: "bg-primary",  text: "text-primary",  bg: "bg-primary/10  border-primary/20"  },
  pending: { bar: "bg-warning",  text: "text-warning",  bg: "bg-warning/10  border-warning/20"  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info", duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map((t) => {
          const c = config[t.type] || config.info;
          return (
            <div key={t.id} className={`flex items-start gap-3 border rounded-2xl px-4 py-3.5 shadow-elevated pointer-events-auto animate-slide-in ${c.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.bar} ${t.type === "pending" ? "animate-pulse" : ""}`} />
              <p className={`text-sm font-medium flex-1 ${c.text}`}>{t.message}</p>
              <button onClick={() => dismiss(t.id)} className={`${c.text} opacity-50 hover:opacity-100 text-lg leading-none`}>×</button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
