import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { withAuth } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data } = await api.get("/projects", withAuth(token));
        setProjects(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load projects.");
      }
    };

    loadProjects();
  }, [token]);

  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">Projects</h1>
            <p className="mt-2 text-sm text-slate-400">Open your project boards and task lists.</p>
          </div>
          <Link to="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Back to Dashboard
          </Link>
        </div>

        {error ? <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-2xl border border-white/10 bg-[#161B26] p-5 transition hover:-translate-y-0.5 hover:border-blue-500/30"
            >
              <h2 className="text-lg font-semibold text-white">{project.name}</h2>
              <p className="mt-2 text-sm text-slate-400">{project.description || "No description"}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span>Members {project.member_count}</span>
                <span>Tasks {project.task_count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
