import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/dashboard",    icon: "⊞", label: "Dashboard" },
  { to: "/send",         icon: "↑", label: "Send"      },
  { to: "/receive",      icon: "↓", label: "Receive"   },
  { to: "/address-book", icon: "📒", label: "Contacts" },
  { to: "/security",     icon: "🛡", label: "Security" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("nexus_user") || "{}");

  function logout() {
    localStorage.removeItem("nexus_user");
    localStorage.removeItem("nexus_wallet");
    navigate("/");
  }

  return (
    <aside className="w-20 bg-navy flex flex-col items-center py-6 gap-2 fixed h-full z-10">
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-primary mb-4">
        <span className="text-white font-bold text-lg tracking-tight">N</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 w-full px-2">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-navy-700 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{l.icon}</span>
            <span className="text-[10px] tracking-wide">{l.label}</span>
          </NavLink>
        ))}
        {user.role === "admin" && (
          <NavLink to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${
                isActive ? "bg-secondary/20 text-secondary" : "text-navy-700 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span className="text-lg">⚙</span>
            <span className="text-[10px] tracking-wide">Admin</span>
          </NavLink>
        )}
      </nav>

      {/* User + logout */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-primary">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <button onClick={logout}
          className="flex flex-col items-center gap-1 py-2 w-full rounded-xl text-[10px] text-navy-700 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <span className="text-base">⏻</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
