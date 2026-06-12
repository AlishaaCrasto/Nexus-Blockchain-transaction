import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 ml-20 p-8 animate-fade-up">
        {children}
      </main>
    </div>
  );
}
