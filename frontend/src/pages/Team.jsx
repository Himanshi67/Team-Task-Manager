import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { withAuth } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Team() {
  const { token, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const { data } = await api.get("/users", withAuth(token));
        setMembers(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Team members are available to Admin users only.");
      }
    };

    if (user?.role === "Admin") {
      loadMembers();
    }
  }, [token, user?.role]);

  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">Team</h1>
            <p className="mt-2 text-sm text-slate-400">View the team roster and user roles.</p>
          </div>
          <Link to="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Back to Dashboard
          </Link>
        </div>

        {error ? <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          {members.map((member) => (
            <div key={member.id} className="rounded-2xl border border-white/10 bg-[#161B26] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{member.name}</h2>
                  <p className="text-sm text-slate-400">{member.email}</p>
                  <p className="mt-1 text-xs text-slate-500">Department: {member.department || "General"}</p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-200">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
