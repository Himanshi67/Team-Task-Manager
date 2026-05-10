# AGENTS.md — AI Coding Agent Guide

Purpose: provide concise, actionable guidance to AI coding agents working on this Team Task Manager project (Node.js + React + PostgreSQL).

Quick facts
- Backend entry: [backend/index.js](backend/index.js)
- DB schema/bootstrap: [backend/db/schema.sql](backend/db/schema.sql) and [backend/db/bootstrap.js](backend/db/bootstrap.js)
- Main task logic: [backend/controllers/taskController.js](backend/controllers/taskController.js)
- Routes: [backend/routes/taskRoutes.js](backend/routes/taskRoutes.js)
- Frontend: Vite + React at [frontend/package.json](frontend/package.json) and [frontend/src](frontend/src)
- Task UI: [frontend/src/components/TaskModal.jsx](frontend/src/components/TaskModal.jsx)

What you need to know (concise)
- The database schema already contains `tasks.status` with allowed values: `Backlog`, `Todo`, `In-Progress`, `Done`.
- `subtasks` and `comments` tables exist and are indexed; subtasks use `is_completed` boolean and belong to `task_id`.
- `taskController.js` already exposes:
  - `GET /api/tasks/:id/details` — returns `task`, `subtasks`, `comments`, and `progressPercent`.
  - `PATCH /api/tasks/:id/status` — updates task status (also mapped to `PATCH /api/tasks/:id`).
  - Subtask endpoints for add/toggle, comment add/delete, and a `GET /api/tasks/summary` helper.
- Role-based access enforced in controllers: only `Admin` or assigned member can update status; only `Admin` can delete comments.

How to run locally (no-docker)
- Backend: from `team-task-manager/backend` run `npm install` then `npm start` (reads `PORT` and database env vars). See [backend/package.json](backend/package.json).
- Frontend: from `team-task-manager/frontend` run `npm install` then `npm run dev` (Vite).

Implementation Strategy (Kanban, Subtasks, Comments)
- Backend: schema changes are in [backend/db/schema.sql](backend/db/schema.sql). Use `backend/db/bootstrap.js` to apply schema and seed demo data.
- Kanban: update status via `PATCH /api/tasks/:id/status`. Frontend drag-and-drop should call that endpoint.
- Subtasks: stored in `subtasks` table. Progress percent = (completed subtasks / total subtasks) * 100 — computed and returned by `GET /api/tasks/:id/details`.
- Comments & files: use `comments` table for text comments. For attachments, store files in S3/Cloudinary and persist URLs in an `attachments` table (not present yet).

Developer prompt (copy/paste for AI coding tools)
---
I am building a Team Task Manager using React, Node.js, and PostgreSQL. I need to expand the current MVP to include advanced progress tracking and collaboration. Please provide the code for the following:

1) Database Schema (SQL): Update backend/db/bootstrap.js to ensure the following exist (or add them to schema.sql):
   - A `subtasks` table (id, title, is_completed, task_id).
   - A `comments` table (id, content, created_at, user_id, task_id).
   - A `status` enum/column for tasks with values: 'Backlog', 'Todo', 'In-Progress', 'Done'.

2) Backend Logic (taskController.js):
   - Add or verify `GET /api/tasks/:id/details` that joins task, subtasks, and comments.
   - Add `PATCH /api/tasks/:id/status` to update the `status` field (used by Kanban).

3) Frontend Component (React):
   - A `TaskModal.jsx` component that shows a checklist of subtasks and a progress bar.
   - Toggling a subtask updates the backend and refreshes the modal.

4) Dashboard Stats: add a backend helper returning `{ totalTasks: X, completedTasks: Y, overdueTasks: Z }` available at `GET /api/tasks/summary`.

Compatibility & Security
- Keep compatibility with existing seed and any `pg-mem` test setups.
- Enforce role-based access: only `Admin` can delete comments; only `Admin` or assigned user can update a task's status.

Links
- Code references: [backend/db/schema.sql](backend/db/schema.sql), [backend/controllers/taskController.js](backend/controllers/taskController.js), [frontend/src/components/TaskModal.jsx](frontend/src/components/TaskModal.jsx)

Suggestions for next agent customizations
- Create a small skill for `create-kanban-dnd` to scaffold drag-and-drop handlers in the frontend and wire status PATCH requests.
- Create a `file-attachments` instruction that adds `attachments` table and S3/Cloudinary upload helpers.
