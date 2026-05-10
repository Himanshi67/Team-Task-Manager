import { Link } from "react-router-dom";

export default function Notifications() {
  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">Notifications</h1>
            <p className="mt-2 text-sm text-slate-400">See mentions, updates, and task activity alerts.</p>
          </div>
          <Link to="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#161B26] p-6">
          <p className="text-sm text-slate-400">
            Notifications are currently a placeholder. You can connect real activity events or Socket.io here later.
          </p>
        </div>
      </div>
    </main>
  );
}
