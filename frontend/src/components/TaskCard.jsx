const statusStyle = {
  Backlog: "bg-slate-100 text-slate-700",
  Todo: "bg-slate-200 text-slate-800",
  "In-Progress": "bg-amber-200 text-amber-900",
  Done: "bg-emerald-200 text-emerald-900"
};

export default function TaskCard({ task, onStatusChange, onOpen }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium text-slate-900">{task.title}</h3>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${statusStyle[task.status]}`}>
          {task.status}
        </span>
      </div>
      <p className="mb-3 text-sm text-slate-600">Assigned to: {task.assigned_to_name || task.assigned_to}</p>
      <select
        className="w-full rounded border px-2 py-1 text-sm"
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
      >
        <option>Backlog</option>
        <option>Todo</option>
        <option>In-Progress</option>
        <option>Done</option>
      </select>
      {onOpen ? (
        <button
          onClick={() => onOpen(task.id)}
          className="mt-2 w-full rounded border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View Details
        </button>
      ) : null}
    </div>
  );
}
