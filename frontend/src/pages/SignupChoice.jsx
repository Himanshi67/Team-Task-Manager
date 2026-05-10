import { Link } from "react-router-dom";
import { Shield, Users } from "lucide-react";

export default function SignupChoice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Join Team Task Manager</h1>
          <p className="text-slate-600">Choose your account type to get started</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Member Signup */}
          <Link
            to="/signup"
            className="group rounded-xl border-2 border-slate-200 bg-white p-8 shadow transition hover:border-blue-400 hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-center rounded-lg bg-blue-100 p-4 w-fit mx-auto">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mb-2 text-center text-xl font-semibold text-slate-900">Sign Up as Member</h2>
            <p className="mb-4 text-center text-sm text-slate-600">
              Join your team and start collaborating on tasks and projects
            </p>
            <div className="rounded-lg bg-blue-50 p-3">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center">
                  <span className="mr-2 text-blue-600">✓</span> Create and manage tasks
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-blue-600">✓</span> Collaborate with teammates
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-blue-600">✓</span> Track progress
                </li>
              </ul>
            </div>
            <button className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 group-hover:shadow-md">
              Continue as Member
            </button>
          </Link>

          {/* Admin Signup */}
          <Link
            to="/admin-signup"
            className="group rounded-xl border-2 border-slate-200 bg-white p-8 shadow transition hover:border-purple-400 hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-center rounded-lg bg-purple-100 p-4 w-fit mx-auto">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="mb-2 text-center text-xl font-semibold text-slate-900">Sign Up as Admin</h2>
            <p className="mb-4 text-center text-sm text-slate-600">
              Create an admin account to oversee teams and manage organizational resources
            </p>
            <div className="rounded-lg bg-purple-50 p-3">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center">
                  <span className="mr-2 text-purple-600">✓</span> Manage users & teams
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-purple-600">✓</span> Create projects
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-purple-600">✓</span> System administration
                </li>
              </ul>
            </div>
            <button className="mt-6 w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700 group-hover:shadow-md">
              Continue as Admin
            </button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-slate-900 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          <Link to="/privacy" className="hover:text-slate-700">
            Privacy Policy
          </Link>
          <span className="mx-2">•</span>
          <Link to="/terms" className="hover:text-slate-700">
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
