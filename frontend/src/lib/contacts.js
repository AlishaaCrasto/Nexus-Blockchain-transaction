const KEY = "nexus_contacts";

export function getContacts() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveContact({ name, address, emoji = "👤" }) {
  const contacts = getContacts();
  const existing = contacts.findIndex((c) => c.address.toLowerCase() === address.toLowerCase());
  const contact = { id: `c_${Math.random().toString(36).slice(2,8)}`, name, address, emoji, favourite: false, createdAt: new Date().toISOString() };
  if (existing >= 0) contacts[existing] = { ...contacts[existing], name, emoji };
  else contacts.unshift(contact);
  localStorage.setItem(KEY, JSON.stringify(contacts));
  return contact;
}

export function toggleFavourite(id) {
  const contacts = getContacts().map((c) => c.id === id ? { ...c, favourite: !c.favourite } : c);
  localStorage.setItem(KEY, JSON.stringify(contacts));
}

export function deleteContact(id) {
  localStorage.setItem(KEY, JSON.stringify(getContacts().filter((c) => c.id !== id)));
}

export function getRecentRecipients() {
  const txs = JSON.parse(localStorage.getItem("nexus_transactions") || "[]");
  const seen = new Set();
  return txs
    .filter((t) => t.type === "send" && t.to_address)
    .filter((t) => { if (seen.has(t.to_address)) return false; seen.add(t.to_address); return true; })
    .slice(0, 5)
    .map((t) => {
      const contact = getContacts().find((c) => c.address.toLowerCase() === t.to_address.toLowerCase());
      return { address: t.to_address, name: contact?.name || null, emoji: contact?.emoji || "👤", amount: t.amount };
    });
}
