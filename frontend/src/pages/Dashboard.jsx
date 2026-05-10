import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api, { withAuth } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  Bell,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Circle,
  MoreHorizontal
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const CHART_COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#1D4ED8", "#2563EB"];

function formatNumber(value) {
  return Number.isFinite(value) ? value.toLocaleString() : "0";
}

function NavItem({ icon, label, active = false }) {
  return (
    <div
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
        active
          ? "bg-[#3B82F6] text-white shadow-lg shadow-blue-950/40"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function StatCard({ label, count, icon, tone = "blue" }) {
  const toneStyles = {
    blue: "from-blue-500/20 to-blue-500/0 text-blue-300",
    cyan: "from-cyan-500/20 to-cyan-500/0 text-cyan-300",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-300",
    rose: "from-rose-500/20 to-rose-500/0 text-rose-300"
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-[#161B26] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br p-3 ${toneStyles[tone]}`}>
        {icon}
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold tracking-tight text-white">{formatNumber(count)}</span>
        <MoreHorizontal className="h-5 w-5 text-slate-500" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalTasks: 0, completedTasks: 0, overdueTasks: 0 });
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    department: "",
    memberIds: [],
    assignAllDepartmentMembers: true
  });
  const [projectMessage, setProjectMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, summaryRes, dashboardRes] = await Promise.all([
          api.get("/projects", withAuth(token)),
          api.get("/tasks/summary", withAuth(token)),
          api.get("/tasks/dashboard", withAuth(token))
        ]);

        setProjects(projectsRes.data);
        setSummary(summaryRes.data);
        setDashboard(dashboardRes.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard.");
      }
    };

    loadData();
  }, [token]);

  useEffect(() => {
    const loadUsers = async () => {
      if (user?.role !== "Admin") {
        return;
      }

      try {
        const { data } = await api.get("/users", withAuth(token));
        setUsers(data);
      } catch (_err) {
        setUsers([]);
      }
    };

    loadUsers();
  }, [token, user?.role]);

  const departmentOptions = useMemo(
    () => Array.from(new Set(users.map((member) => member.department).filter(Boolean))),
    [users]
  );

  const visibleDepartmentMembers = useMemo(() => {
    if (!projectForm.department) {
      return users;
    }

    return users.filter((member) => member.department === projectForm.department);
  }, [users, projectForm.department]);

  useEffect(() => {
    if (user?.role !== "Admin" || departmentOptions.length === 0) {
      return;
    }

    setProjectForm((current) => {
      if (current.department) {
        return current;
      }

      return {
        ...current,
        department: departmentOptions[0]
      };
    });
  }, [departmentOptions, user?.role]);

  useEffect(() => {
    if (!projectForm.assignAllDepartmentMembers) {
      return;
    }

    setProjectForm((current) => ({
      ...current,
      memberIds: visibleDepartmentMembers.map((member) => String(member.id))
    }));
  }, [projectForm.assignAllDepartmentMembers, visibleDepartmentMembers]);

  const chartRows = useMemo(() => {
    if (user?.role === "Admin") {
      return (dashboard?.perUser || []).map((member) => ({
        name: member.name,
        tasks: member.total_tasks,
        completed: member.completed_tasks,
        overdue: member.overdue_tasks
      }));
    }

    return [
      { name: "Backlog", value: dashboard?.byStatus?.find((item) => item.status === "Backlog")?.count || 0 },
      { name: "Todo", value: dashboard?.byStatus?.find((item) => item.status === "Todo")?.count || 0 },
      { name: "In-Progress", value: dashboard?.byStatus?.find((item) => item.status === "In-Progress")?.count || 0 },
      { name: "Done", value: dashboard?.byStatus?.find((item) => item.status === "Done")?.count || 0 }
    ];
  }, [dashboard, user?.role]);

  const donutData = useMemo(() => {
    if (user?.role === "Admin") {
      return [
        { name: "Completed", value: dashboard?.overall?.completed_tasks || 0 },
        { name: "Remaining", value: Math.max((dashboard?.overall?.total_tasks || 0) - (dashboard?.overall?.completed_tasks || 0), 0) }
      ];
    }

    return [
      { name: "Done", value: dashboard?.personal?.completed_tasks || 0 },
      { name: "Remaining", value: Math.max((dashboard?.personal?.total_tasks || 0) - (dashboard?.personal?.completed_tasks || 0), 0) }
    ];
  }, [dashboard, user?.role]);

  const totalTasks = user?.role === "Admin" ? summary.totalTasks : dashboard?.personal?.total_tasks || summary.totalTasks;
  const completedTasks = user?.role === "Admin" ? summary.completedTasks : dashboard?.personal?.completed_tasks || summary.completedTasks;
  const overdueTasks = user?.role === "Admin" ? summary.overdueTasks : dashboard?.personal?.overdue_tasks || summary.overdueTasks;
  const currentUserName = user?.name || "Avery Stone";
  const currentUserRole = user?.role || "Member";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    setProjectMessage("");

    try {
      await api.post(
        "/projects",
        {
          name: projectForm.name,
          description: projectForm.description,
          department: projectForm.department,
          memberIds: projectForm.memberIds.map((memberId) => Number(memberId))
        },
        withAuth(token)
      );

      setProjectForm((current) => ({
        ...current,
        name: "",
        description: ""
      }));

      setProjectMessage("Project created and assigned successfully.");

      const { data } = await api.get("/projects", withAuth(token));
      setProjects(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create project.");
    }
  };

  const handleMemberToggle = (memberId) => {
    setProjectForm((current) => {
      const exists = current.memberIds.includes(String(memberId));
      return {
        ...current,
        assignAllDepartmentMembers: false,
        memberIds: exists
          ? current.memberIds.filter((id) => id !== String(memberId))
          : [...current.memberIds, String(memberId)]
      };
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] font-sans text-white">
      <aside className="fixed inset-y-0 left-0 flex w-72 flex-col border-r border-white/10 bg-[#0B0F19]/95 px-6 py-6 backdrop-blur">
        <div>
          <div className="mb-10 flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6] text-sm font-black text-white shadow-lg shadow-blue-500/30">
              TF
            </div>
            <div>
              <div className="text-white">TeamFlow</div>
              <div className="text-xs font-normal text-slate-500">Delivery command center</div>
            </div>
          </div>

          <nav className="space-y-2">
            <NavLink to="/" end className="block">
              {({ isActive }) => <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive} />}
            </NavLink>
            <NavLink to="/projects" className="block">
              {({ isActive }) => <NavItem icon={<FolderKanban size={20} />} label="Projects" active={isActive} />}
            </NavLink>
            <NavLink to="/team" className="block">
              {({ isActive }) => <NavItem icon={<Users size={20} />} label="Team" active={isActive} />}
            </NavLink>
            <NavLink to="/calendar" className="block">
              {({ isActive }) => <NavItem icon={<Calendar size={20} />} label="Calendar" active={isActive} />}
            </NavLink>
            <NavLink to="/notifications" className="block">
              {({ isActive }) => <NavItem icon={<Bell size={20} />} label="Notifications" active={isActive} />}
            </NavLink>
          </nav>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#161B26] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E2533] text-sm font-semibold text-white">
              {currentUserName
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{currentUserName}</p>
              <p className="text-xs text-slate-400">{currentUserRole}</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1 overflow-y-auto px-8 py-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/5 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Overview</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              A live pulse on delivery, load, and risk for your team.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
            {user?.role === "Admin" ? "Admin performance view" : "Personal performance view"}
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="mb-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Projects"
            count={projects.length}
            icon={<FolderKanban className="h-5 w-5 text-blue-300" />}
            tone="blue"
          />
          <StatCard
            label="Tasks"
            count={totalTasks}
            icon={<LayoutDashboard className="h-5 w-5 text-cyan-300" />}
            tone="cyan"
          />
          <StatCard
            label="Completed"
            count={completedTasks}
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}
            tone="cyan"
          />
          <StatCard
            label="Overdue"
            count={overdueTasks}
            icon={<AlertTriangle className="h-5 w-5 text-amber-300" />}
            tone="amber"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-[#161B26] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Team productivity</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {user?.role === "Admin"
                    ? "Member workload and delivery volume across the team."
                    : "Your status breakdown across all active tasks."}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Recharts
              </div>
            </div>

            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a3140" />
                  <XAxis dataKey={user?.role === "Admin" ? "name" : "name"} stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161B26",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      color: "#fff"
                    }}
                    cursor={{ fill: "rgba(59,130,246,0.08)" }}
                  />
                  <Legend />
                  <Bar
                    dataKey={user?.role === "Admin" ? "tasks" : "value"}
                    name={user?.role === "Admin" ? "Tasks assigned" : "Tasks"}
                    fill="#3B82F6"
                    radius={[8, 8, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#161B26] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Task status</h2>
              <p className="mt-1 text-sm text-slate-400">Distribution of work states at a glance.</p>
            </div>

            <div className="flex h-[360px] flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={entry.name} fill={index === 0 ? "#3B82F6" : "#232B3A"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161B26",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      color: "#fff"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-2 flex w-full items-center justify-center gap-5 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" /> Active
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#232B3A]" /> Remaining
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-[#161B26] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Projects</h2>
                <p className="mt-1 text-sm text-slate-400">Create and assign projects by department.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {projects.length} total
              </span>
            </div>

            {user?.role === "Admin" ? (
              <form onSubmit={handleCreateProject} className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-white/10 bg-[#0B0F19] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                    placeholder="Project name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    required
                  />
                  <select
                    className="rounded-xl border border-white/10 bg-[#0B0F19] px-4 py-3 text-white outline-none"
                    value={projectForm.department}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        department: e.target.value,
                        assignAllDepartmentMembers: true
                      })
                    }
                  >
                    <option value="">All departments</option>
                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[#0B0F19] px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  placeholder="Project description"
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />

                <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={projectForm.assignAllDepartmentMembers}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        assignAllDepartmentMembers: e.target.checked,
                        memberIds: e.target.checked ? visibleDepartmentMembers.map((member) => String(member.id)) : projectForm.memberIds
                      })
                    }
                  />
                  Assign to all members in selected department
                </label>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {visibleDepartmentMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0B0F19] px-4 py-3 text-sm text-slate-300"
                    >
                      <span>
                        {member.name}
                        <span className="ml-2 text-xs text-slate-500">{member.department}</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={projectForm.memberIds.includes(String(member.id))}
                        disabled={projectForm.assignAllDepartmentMembers}
                        onChange={() => handleMemberToggle(member.id)}
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button className="rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-medium text-white hover:bg-blue-500">
                    Create Project
                  </button>
                  {projectMessage ? <p className="text-sm text-emerald-300">{projectMessage}</p> : null}
                </div>
              </form>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-white/7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{project.description || "No description"}</p>
                    </div>
                    <ChevronRight className="mt-1 h-5 w-5 text-slate-500 transition group-hover:text-blue-300" />
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Circle className="h-3 w-3 text-blue-400" /> Members {project.member_count}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Circle className="h-3 w-3 text-slate-500" /> Tasks {project.task_count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#161B26] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Focus</h2>
                <p className="mt-1 text-sm text-slate-400">Quick view for the current user.</p>
              </div>
              <Users className="h-5 w-5 text-slate-500" />
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <span className="text-slate-400">Role</span>
                <span className="font-medium text-white">{user?.role || "Member"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <span className="text-slate-400">Open projects</span>
                <span className="font-medium text-white">{projects.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <span className="text-slate-400">Completed tasks</span>
                <span className="font-medium text-white">{completedTasks}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}