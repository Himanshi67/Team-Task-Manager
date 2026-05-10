import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { withAuth } from "../api/client";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", assignedTo: "", dueDate: "" });
  const [members, setMembers] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`, withAuth(token));
      setTasks(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch tasks.");
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/members`, withAuth(token));
      setMembers(data);
    } catch (_err) {
      setMembers([]);
    }
  };

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [projectId]);

  const createTask = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post(
        "/tasks",
        {
          title: form.title,
          projectId: Number(projectId),
          assignedTo: Number(form.assignedTo),
          dueDate: form.dueDate || null
        },
        withAuth(token)
      );
      setForm({ title: "", assignedTo: "", dueDate: "" });
      await loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create task.");
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status }, withAuth(token));
      await loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <button onClick={() => navigate(-1)} className="mb-3 text-sm font-medium text-slate-700 hover:underline">
          Back
        </button>
        {error ? <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}

        <form onSubmit={createTask} className="mb-4 rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Create Task</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              className="rounded border px-3 py-2"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <select
              className="rounded border px-3 py-2"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              required
            >
              <option value="">Assign to user</option>
              {members.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <input
              className="rounded border px-3 py-2"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <button className="mt-3 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Add Task</button>
        </form>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={updateStatus} onOpen={setSelectedTaskId} />
          ))}
        </section>
      </main>
      {selectedTaskId ? (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={loadTasks}
        />
      ) : null}
    </div>
  );
}
