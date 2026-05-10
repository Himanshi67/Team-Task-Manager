import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">Team Task Manager</h1>
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <span>{user?.name} ({user?.role})</span>
          <button
            onClick={logout}
            className="rounded bg-slate-800 px-3 py-1.5 text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
