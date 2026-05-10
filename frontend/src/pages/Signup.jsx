import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "Engineering"
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const departments = ["Engineering", "Design", "HR", "Management", "Finance", "Operations", "General"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-semibold text-slate-900">Create Account</h1>
        {error ? <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}
        <input
          className="mb-3 w-full rounded border px-3 py-2 text-black"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="mb-3 w-full rounded border px-3 py-2 text-black"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="mb-3 w-full rounded border px-3 py-2 text-black"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="mb-4 w-full rounded border px-3 py-2 text-black"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        >
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
        <p className="mb-4 text-xs text-slate-500">New accounts are created as Member users. Admin access is assigned by the system owner.</p>
        <button className="w-full rounded bg-slate-900 px-3 py-2 text-white hover:bg-slate-800">Sign Up</button>
        <p className="mt-3 text-sm text-slate-600">
          Already have an account? <Link className="font-medium text-slate-900" to="/login">Login</Link>
        </p>
        <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          <Link to="/privacy" className="hover:text-slate-700">Privacy Policy</Link>
          <span className="mx-2">•</span>
          <Link to="/terms" className="hover:text-slate-700">Terms of Service</Link>
        </div>
      </form>
    </main>
  );
}
