# Team Task Manager

A full-stack collaboration platform with role-based access control (RBAC), JWT authentication, project membership, and task tracking.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: Neon PostgreSQL
- ORM: Prisma
- Auth: JWT

## Project Structure

```text
team-task-manager/
+-- backend/
|   +-- config/
|   +-- controllers/
|   +-- middleware/
|   +-- routes/
|   +-- db/
|   |   +-- bootstrap.js
|   +-- prisma/
|   |   +-- schema.prisma
|   +-- scripts/
|   |   +-- seed.js
|   +-- .env.example
|   +-- package.json
|   +-- index.js
+-- frontend/
|   +-- src/
|   +-- .env.example
|   +-- package.json
+-- README.md
```

## Database Schema

Defined in `backend/prisma/schema.prisma`:

- `users`
- `projects`
- `project_members`
- `tasks`
- `subtasks`
- `comments`

## Local Setup (Prisma + NeonDB)

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Create Neon database

From Neon dashboard, copy:

- Pooled connection string (`-pooler` host) -> `DATABASE_URL`
- Direct connection string -> `DIRECT_URL`

### 3. Configure environment

Backend `.env`:

```env
PORT=5000
# Use libpq compatibility with sslmode=require to avoid future PostgreSQL warnings.
DATABASE_URL=postgresql://<neon_user>:<neon_password>@<your-project>-pooler.<region>.aws.neon.tech/neondb?uselibpqcompat=true&sslmode=require
DIRECT_URL=postgresql://<neon_user>:<neon_password>@<your-project>.<region>.aws.neon.tech/neondb?uselibpqcompat=true&sslmode=require
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d
SEED_DEMO_DATA=true
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Push Prisma schema

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 5. Seed demo data

```bash
cd backend
npm run seed
```

Demo credentials:

- Admin: `admin@demo.com` / `Admin@123`
- Member: `member@demo.com` / `Member@123`

### 6. Run locally

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

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

- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:projectId/members`
- `GET /api/projects/:projectId/tasks`

### Tasks

- `POST /api/tasks`
- `PATCH /api/tasks/:id`

### Users

- `GET /api/users`

## Deployment Notes

1. Set backend env vars with Neon URLs.
2. Prefer `uselibpqcompat=true&sslmode=require` in `DATABASE_URL` and `DIRECT_URL` to future-proof PostgreSQL SSL behavior.
3. Run `npm --prefix backend run prisma:migrate` (or `npm --prefix backend run prisma:push`) before first boot.
4. Set frontend `VITE_API_BASE_URL` to deployed backend `/api` URL.
