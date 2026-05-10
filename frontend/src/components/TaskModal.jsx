import { useEffect, useState } from "react";
import api, { withAuth } from "../api/client";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleDateString();
}

export default function TaskModal({ taskId, onClose, onUpdated }) {
  const { token, user } = useAuth();
  const [details, setDetails] = useState(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId) {
      return;
    }

    const loadDetails = async () => {
      try {
        const { data } = await api.get(`/tasks/${taskId}/details`, withAuth(token));
        setDetails(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch task details.");
      }
    };

    loadDetails();
  }, [taskId, token]);

  const refreshDetails = async () => {
    const { data } = await api.get(`/tasks/${taskId}/details`, withAuth(token));
    setDetails(data);
    if (onUpdated) {
      await onUpdated();
    }
  };

  const addSubtask = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title: subtaskTitle }, withAuth(token));
      setSubtaskTitle("");
      await refreshDetails();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add subtask.");
    }
  };

  const toggleSubtask = async (subtaskId) => {
    setError("");

    try {
      await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, {}, withAuth(token));
      await refreshDetails();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update subtask.");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post(`/tasks/${taskId}/comments`, { content: commentContent }, withAuth(token));
      setCommentContent("");
      await refreshDetails();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add comment.");
    }
  };

  const deleteComment = async (commentId) => {
    setError("");

    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`, withAuth(token));
      await refreshDetails();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete comment.");
    }
  };

  if (!taskId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task Details</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {details?.task?.title || "Loading..."}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Status: {details?.task?.status || "-"} | Due: {formatDate(details?.task?.due_date)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Close
          </button>
        </div>

        {error ? <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="mb-5 rounded-xl border bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
            <span className="font-medium">Progress</span>
            <span>{details?.progressPercent ?? 0}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${details?.progressPercent ?? 0}%` }}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-xl border p-4">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Subtasks</h3>
            <form onSubmit={addSubtask} className="mb-4 flex gap-2">
              <input
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Add a subtask"
                className="flex-1 rounded-lg border px-3 py-2"
              />
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
                Add
              </button>
            </form>
            <div className="space-y-2">
              {(details?.subtasks || []).map((subtask) => (
                <label key={subtask.id} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={subtask.is_completed}
                    onChange={() => toggleSubtask(subtask.id)}
                  />
                  <span className={subtask.is_completed ? "text-slate-400 line-through" : "text-slate-700"}>
                    {subtask.title}
                  </span>
                </label>
              ))}
              {!details?.subtasks?.length ? <p className="text-sm text-slate-500">No subtasks yet.</p> : null}
            </div>
          </section>

          <section className="rounded-xl border p-4">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Comments</h3>
            <form onSubmit={addComment} className="mb-4 space-y-2">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add a comment"
                rows={3}
                className="w-full rounded-lg border px-3 py-2"
              />
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
                Comment
              </button>
            </form>
            <div className="space-y-3">
              {(details?.comments || []).map((comment) => (
                <div key={comment.id} className="rounded-lg border bg-slate-50 p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">
                      {comment.user_name} ({comment.user_role})
                    </span>
                    {user?.role === "Admin" ? (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="text-slate-700">{comment.content}</p>
                </div>
              ))}
              {!details?.comments?.length ? <p className="text-sm text-slate-500">No comments yet.</p> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
