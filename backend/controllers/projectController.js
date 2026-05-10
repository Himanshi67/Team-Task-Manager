const pool = require("../config/db");

async function withCounts(projects) {
  const enriched = [];

  for (const project of projects) {
    const memberCountRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM project_members WHERE project_id = $1",
      [project.id]
    );

    const taskCountRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM tasks WHERE project_id = $1",
      [project.id]
    );

    enriched.push({
      ...project,
      member_count: memberCountRes.rows[0].count,
      task_count: taskCountRes.rows[0].count
    });
  }

  return enriched;
}

async function getProjects(req, res) {
  const { id, role } = req.user;

  try {
    const query = role === "Admin"
      ? `SELECT id, name, description, created_by, created_at
         FROM projects
         WHERE created_by = $1
         ORDER BY created_at DESC`
      : `SELECT p.id, p.name, p.description, p.created_by, p.created_at
         FROM project_members pm
         JOIN projects p ON p.id = pm.project_id
         WHERE pm.user_id = $1
         ORDER BY p.created_at DESC`;

    const result = await pool.query(query, [id]);
    const projects = await withCounts(result.rows);
    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch projects.", error: error.message });
  }
}

async function createProject(req, res) {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Project name is required." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectRes = await client.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by, created_at`,
      [name.trim(), description || "", req.user.id]
    );

    await client.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [projectRes.rows[0].id, req.user.id]
    );

    await client.query("COMMIT");
    return res.status(201).json(projectRes.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Failed to create project.", error: error.message });
  } finally {
    client.release();
  }
}

async function addProjectMember(req, res) {
  const projectId = Number(req.params.projectId);
  const { userId } = req.body;

  if (!projectId || !userId) {
    return res.status(400).json({ message: "projectId and userId are required." });
  }

  try {
    const projectRes = await pool.query(
      "SELECT id, created_by FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectRes.rowCount === 0) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (projectRes.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Only the project creator can invite members." });
    }

    const userRes = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    await pool.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [projectId, userId]
    );

    return res.status(201).json({ message: "Member added to project." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add project member.", error: error.message });
  }
}

async function getProjectMembers(req, res) {
  const projectId = Number(req.params.projectId);

  try {
    const accessRes = await pool.query(
      `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, req.user.id]
    );

    if (accessRes.rowCount === 0 && req.user.role !== "Admin") {
      return res.status(403).json({ message: "You do not have access to this project." });
    }

    const membersRes = await pool.query(
      `SELECT u.id, u.name, u.email, u.role
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY u.name ASC`,
      [projectId]
    );

    return res.json(membersRes.rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch project members.", error: error.message });
  }
}

module.exports = {
  getProjects,
  createProject,
  addProjectMember,
  getProjectMembers
};
