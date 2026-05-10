import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminSignup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", inviteCode: "", department: "Engineering" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const departments = ["Engineering", "Design", "HR", "Management", "Finance", "Operations", "General"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.inviteCode.trim()) {
      setError("Invite code is required for admin registration.");
      return;
    }

    try {
      const { data } = await api.post("/auth/register-admin", {
        name: form.name,
        email: form.email,
        password: form.password,
        inviteCode: form.inviteCode,
        department: form.department,
      });
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Admin registration failed. Check your invite code and try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Admin Registration</h1>
        <p className="mb-4 text-sm text-slate-600">Create an admin account to manage your organization</p>
        
        {error ? <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}
        
        <input
          className="mb-3 w-full rounded border px-3 py-2 text-black"
          placeholder="Full Name"
          type="text"
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
          className="mb-3 w-full rounded border px-3 py-2 text-black"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        
        <input
          className="mb-4 w-full rounded border border-purple-300 bg-purple-50 px-3 py-2 font-medium text-black"
          placeholder="Invite Code (required)"
          type="text"
          value={form.inviteCode}
          onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
          required
        />
        
        <button className="w-full rounded bg-purple-600 px-3 py-2 text-white hover:bg-purple-700 font-medium">
          Create Admin Account
        </button>
        
        <p className="mt-4 text-center text-sm text-slate-600">
          Want to sign up as a member instead?{" "}
          <Link className="font-medium text-slate-900" to="/signup">
            Sign up as Member
          </Link>
        </p>
        
        <p className="mt-3 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-slate-900" to="/login">
            Log in
          </Link>
        </p>
        
        <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          <Link to="/privacy" className="hover:text-slate-700">
            Privacy Policy
          </Link>
          <span className="mx-2">•</span>
          <Link to="/terms" className="hover:text-slate-700">
            Terms of Service
          </Link>
        </div>
      </form>
    </main>
  );
}
