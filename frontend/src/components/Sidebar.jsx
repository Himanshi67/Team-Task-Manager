export default function Sidebar() {
  return (
    <aside className="rounded-lg border bg-white p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Quick Notes</h2>
      <ul className="space-y-2 text-sm text-slate-700">
        <li>Admins can create projects and invite members.</li>
        <li>Members can view joined projects and update assigned tasks.</li>
        <li>Use project detail to move tasks from Todo to Done.</li>
      </ul>
    </aside>
  );
}
