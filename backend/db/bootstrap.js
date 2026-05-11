const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function assertSchemaReady() {
  const schemaCheck = await pool.query("SELECT to_regclass('public.users')::text AS users_table");

  if (!schemaCheck.rows[0] || !schemaCheck.rows[0].users_table) {
    throw new Error("Database schema is missing. Run `npm run prisma:push` in backend first.");
  }
}

async function applySchemaFallback() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function ensureSchemaAvailable() {
  try {
    await assertSchemaReady();
    return;
  } catch (error) {
    const message = String(error.message || error);

    if (!message.includes("Database schema is missing")) {
      throw error;
    }
  }

  console.warn("[db] Schema tables not found. Applying fallback schema from backend/db/schema.sql ...");
  await applySchemaFallback();
  await assertSchemaReady();
  console.log("[db] Fallback schema applied successfully.");
}

async function seedDemoData() {
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const memberHash = await bcrypt.hash("Member@123", 10);
  const designerHash = await bcrypt.hash("Designer@123", 10);
  const hrHash = await bcrypt.hash("Hr@123", 10);

  const adminRes = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, 'Admin', $4)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, department = EXCLUDED.department
     RETURNING id`,
    ["Demo Admin", "admin@demo.com", adminHash, "Management"]
  );

  const memberRes = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, 'Member', $4)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, department = EXCLUDED.department
     RETURNING id`,
    ["Demo Member", "member@demo.com", memberHash, "Engineering"]
  );

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, 'Member', $4)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, department = EXCLUDED.department`,
    ["Demo Designer", "designer@demo.com", designerHash, "Design"]
  );

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, 'Member', $4)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, department = EXCLUDED.department`,
    ["Demo HR", "hr@demo.com", hrHash, "HR"]
  );

  const adminId = adminRes.rows[0].id;
  const memberId = memberRes.rows[0].id;

  let projectId;
  const projectExisting = await pool.query(
    `SELECT id FROM projects WHERE name = $1 AND created_by = $2 LIMIT 1`,
    ["Website Revamp", adminId]
  );

  if (projectExisting.rowCount > 0) {
    projectId = projectExisting.rows[0].id;
  } else {
    const projectRes = await pool.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ["Website Revamp", "Redesign the marketing site with collaborative task workflow.", adminId]
    );
    projectId = projectRes.rows[0].id;
  }

  await pool.query(
    `INSERT INTO project_members (project_id, user_id)
     VALUES ($1, $2), ($1, $3)
     ON CONFLICT (project_id, user_id) DO NOTHING`,
    [projectId, adminId, memberId]
  );

  const existingTaskCount = await pool.query("SELECT COUNT(*)::int AS count FROM tasks WHERE project_id = $1", [projectId]);

  if (existingTaskCount.rows[0].count === 0) {
    await pool.query(
      `INSERT INTO tasks (title, status, due_date, project_id, assigned_to)
       VALUES ($1, 'Backlog', $4::date, $7, $5),
              ($2, 'In-Progress', $6::date, $7, $3),
              ($8, 'Done', $4::date, $7, $5)`,
      [
        "Create homepage wireframes",
        "Build API integration",
        memberId,
        daysFromNow(2),
        adminId,
        daysFromNow(4),
        projectId,
        "Set up auth flow"
      ]
    );
  }
}

async function initializeDatabase() {
  await ensureSchemaAvailable();
  console.log("Database schema found.");

  if (process.env.SEED_DEMO_DATA === "true") {
    await seedDemoData();
    console.log("Database seeded successfully.");
  }
}

module.exports = {
  initializeDatabase,
  seedDemoData
};
