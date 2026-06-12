import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getContacts, saveContact, toggleFavourite, deleteContact } from "../lib/contacts";
import { useToast } from "../components/Toast";

const EMOJIS = ["👤","👨","👩","🧑","👨‍💼","👩‍💼","🏢","🏦","💼","🎓","🤝","⭐"];

export default function AddressBook() {
  const [contacts, setContacts] = useState([]);
  const [showAdd, setShowAdd]   = useState(false);
  const [search, setSearch]     = useState("");
  const [form, setForm]         = useState({ name: "", address: "", emoji: "👤" });
  const [tab, setTab]           = useState("all");
  const navigate  = useNavigate();
  const { toast } = useToast();

  useEffect(() => { setContacts(getContacts()); }, []);

  function refresh() { setContacts(getContacts()); }

  function handleSave() {
    if (!form.name.trim() || !form.address.trim()) return toast("Name and address required", "error");
    if (!form.address.startsWith("0x")) return toast("Invalid Ethereum address", "error");
    saveContact(form);
    setForm({ name: "", address: "", emoji: "👤" });
    setShowAdd(false);
    refresh();
    toast(`${form.name} saved to address book`, "success");
  }

  function handleToggleFav(id) {
    toggleFavourite(id);
    refresh();
  }

  function handleDelete(id, name) {
    deleteContact(id);
    refresh();
    toast(`${name} removed`, "info", 2000);
  }

  const filtered = contacts
    .filter((c) => tab === "favourites" ? c.favourite : true)
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="max-w-2xl animate-fade-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Address Book</h1>
            <p className="text-text-muted text-sm mt-1">{contacts.length} saved contact{contacts.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
            + Add Contact
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex gap-1 bg-elevated border border-border rounded-xl p-1">
            {["all","favourites"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-xs px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                  tab === t ? "bg-card text-text-primary shadow-card" : "text-text-muted hover:text-text-secondary"
                }`}>{t}</button>
            ))}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..." className="input flex-1 py-2.5 text-sm" />
        </div>

        {/* Add Contact Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-md p-6 animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text-primary text-lg">Add Contact</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-xl bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-all">×</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Display Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Priya's Wallet" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Ethereum Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="0x..." className="input font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((e) => (
                      <button key={e} onClick={() => setForm({ ...form, emoji: e })}
                        className={`w-10 h-10 rounded-xl text-xl transition-all ${form.emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-elevated hover:bg-border"}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button onClick={handleSave} className="btn-primary flex-1 py-3">Save Contact</button>
              </div>
            </div>
          </div>
        )}

        {/* Contact List */}
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-elevated rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl border border-border">📒</div>
            <p className="font-semibold text-text-primary mb-1">{tab === "favourites" ? "No favourites yet" : "No contacts yet"}</p>
            <p className="text-sm text-text-muted mb-6">Save wallet addresses to send quickly</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary px-6 py-2.5 text-sm">Add First Contact</button>
          </div>
        ) : (
          <div className="card space-y-1">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center gap-4 py-3.5 border-b border-border last:border-0 group">
                <div className="w-11 h-11 bg-elevated rounded-2xl flex items-center justify-center text-2xl border border-border flex-shrink-0">
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary text-sm">{c.name}</p>
                    {c.favourite && <span className="text-warning text-xs">★</span>}
                  </div>
                  <p className="font-mono text-xs text-text-muted truncate mt-0.5">{c.address}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => navigate(`/send?to=${c.address}&name=${c.name}`)}
                    className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm hover:bg-primary/20 transition-all" title="Send">↑</button>
                  <button onClick={() => handleToggleFav(c.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${c.favourite ? "bg-warning/10 text-warning" : "bg-elevated text-text-muted hover:text-warning"}`} title="Favourite">★</button>
                  <button onClick={() => handleDelete(c.id, c.name)}
                    className="w-8 h-8 rounded-xl bg-danger/10 text-danger flex items-center justify-center text-sm hover:bg-danger/20 transition-all" title="Delete">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
