import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

// Validation helpers
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return {
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar
  };
}

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "Engineering"
  });
  const [error, setError] = useState("");
  const [passwordCheck, setPasswordCheck] = useState({
    isValid: false,
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const departments = ["Engineering", "Design", "HR", "Management", "Finance", "Operations", "General"];

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setForm({ ...form, password: pwd });
    setPasswordCheck(validatePassword(pwd));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!validateEmail(form.email)) {
      setError("Please provide a valid email address.");
      return;
    }

    // Validate password strength
    if (!passwordCheck.isValid) {
      setError("Password does not meet strength requirements.");
      return;
    }

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
          onChange={handlePasswordChange}
          required
        />
        
        {/* Password strength indicator */}
        {form.password && (
          <div className="mb-3 rounded bg-slate-50 p-3 text-xs">
            <p className="mb-2 font-semibold text-slate-700">Password requirements:</p>
            <div className="space-y-1">
              <p className={passwordCheck.minLength ? "text-green-600" : "text-red-600"}>
                ✓ At least 8 characters
              </p>
              <p className={passwordCheck.hasUppercase ? "text-green-600" : "text-red-600"}>
                ✓ One uppercase letter (A-Z)
              </p>
              <p className={passwordCheck.hasLowercase ? "text-green-600" : "text-red-600"}>
                ✓ One lowercase letter (a-z)
              </p>
              <p className={passwordCheck.hasNumber ? "text-green-600" : "text-red-600"}>
                ✓ One number (0-9)
              </p>
              <p className={passwordCheck.hasSpecialChar ? "text-green-600" : "text-red-600"}>
                ✓ One special character (!@#$%^&*)
              </p>
            </div>
          </div>
        )}

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
        <button className="w-full rounded bg-slate-900 px-3 py-2 text-white hover:bg-slate-800" disabled={!passwordCheck.isValid}>Sign Up</button>
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
