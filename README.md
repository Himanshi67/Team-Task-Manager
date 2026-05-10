# Team Task Manager

A full-stack collaboration platform with role-based access control (RBAC), JWT authentication, project membership, and task tracking.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: PostgreSQL-compatible local mode (`pg-mem`) or real PostgreSQL
- Auth: JWT
- Deployment target: Railway

## Project Structure

```text
team-task-manager/
+-- backend/
¦   +-- config/
¦   +-- controllers/
¦   +-- middleware/
¦   +-- models/
¦   +-- routes/
¦   +-- db/
¦   ¦   +-- schema.sql
¦   ¦   +-- bootstrap.js
¦   +-- scripts/
¦   ¦   +-- seed.js
¦   +-- .env.example
¦   +-- package.json
¦   +-- index.js
+-- frontend/
¦   +-- src/
¦   ¦   +-- components/
¦   ¦   +-- pages/
¦   ¦   +-- context/
¦   ¦   +-- api/
¦   ¦   +-- styles/
¦   +-- .env.example
¦   +-- tailwind.config.js
¦   +-- package.json
¦   +-- vite.config.js
+-- README.md
```

## Database Schema

Defined in `backend/db/schema.sql`:

- `users`: `id`, `name`, `email`, `password_hash`, `role`
- `projects`: `id`, `name`, `description`, `created_by`
- `tasks`: `id`, `title`, `status`, `due_date`, `project_id`, `assigned_to`
- `project_members`: `project_id`, `user_id`

### Current Development State: Local In-Memory

- Database: `pg-mem` (in-memory PostgreSQL)
- Auto-bootstrapping: schema + seed data injected on backend start
- Port mapping: frontend `5173`, backend `5000`

### Production Readiness

- Database: Railway managed PostgreSQL
- Connection: via `DATABASE_URL` environment variable
- Health check: `/api/health` monitors DB connectivity

## Local Setup (No Docker)

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Environment files

Backend `.env` (local no-Docker mode):

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d
USE_IN_MEMORY_DB=true
SEED_DEMO_DATA=true
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Seed demo accounts

```bash
cd backend
npm run seed
```

Demo credentials:

- Admin: `admin@demo.com` / `Admin@123`
- Member: `member@demo.com` / `Member@123`

### 4. Run locally in interactive terminals

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Projects

- `GET /api/projects` (Admin: created projects, Member: joined projects)
- `POST /api/projects` (Admin only)
- `POST /api/projects/:projectId/members` (Admin + project creator)
- `GET /api/projects/:projectId/tasks`

### Tasks

- `POST /api/tasks`
- `PATCH /api/tasks/:id`

### Users

- `GET /api/users` (Admin only)

## Railway Deployment Checklist

1. Provision Railway PostgreSQL.
2. Add backend env vars: `DATABASE_URL`, `JWT_SECRET`, `PORT`.
3. Set `USE_IN_MEMORY_DB=false` and `SEED_DEMO_DATA=false` in production.
4. Start backend with `npm start` (schema auto-ensures on boot).
5. Set frontend `VITE_API_BASE_URL` to your deployed backend URL.

## 3-Minute Demo Script

1. Minute 1: show signup/login as Admin.
2. Minute 2: create project, invite member, assign task.
3. Minute 3: login as Member, show restricted view, move task to `Done`.
