const pool = require("../config/db");

const ALLOWED_STATUS = ["Backlog", "Todo", "In-Progress", "Done"];

function canAccessProject(role, accessRowCount) {
  return role === "Admin" || accessRowCount > 0;
}

async function assertTaskAccess(taskId, req) {
  const taskRes = await pool.query(
    `SELECT t.id, t.title, t.status, t.due_date, t.project_id, t.assigned_to,
            p.created_by
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1`,
    [taskId]
  );

  if (taskRes.rowCount === 0) {
    return { error: { status: 404, message: "Task not found." } };
  }

  const task = taskRes.rows[0];

  const accessRes = await pool.query(
    `SELECT 1
     FROM project_members
     WHERE project_id = $1 AND user_id = $2`,
    [task.project_id, req.user.id]
  );

  if (!canAccessProject(req.user.role, accessRes.rowCount)) {
    return { error: { status: 403, message: "You do not have access to this project." } };
  }

  return { task };
}

function calculateProgress(subtasks) {
  if (!subtasks.length) {
    return 0;
  }

  const completed = subtasks.filter((subtask) => subtask.is_completed).length;
  return Math.round((completed / subtasks.length) * 100);
}

async function createTask(req, res) {
  const { title, projectId, assignedTo, dueDate, status } = req.body;

  if (!title || !projectId || !assignedTo) {
    return res.status(400).json({ message: "title, projectId, and assignedTo are required." });
  }

  const selectedStatus = ALLOWED_STATUS.includes(status) ? status : "Backlog";

  try {
    const membership = await pool.query(
      `SELECT pm.user_id
       FROM project_members pm
       WHERE pm.project_id = $1 AND pm.user_id IN ($2, $3)`,
      [projectId, req.user.id, assignedTo]
    );

    const members = membership.rows.map((r) => r.user_id);

    if (!members.includes(req.user.id)) {
      return res.status(403).json({ message: "You are not a member of this project." });
    }

    if (!members.includes(Number(assignedTo))) {
      return res.status(400).json({ message: "Assigned user must be a project member." });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, status, due_date, project_id, assigned_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, status, due_date, project_id, assigned_to, created_at`,
      [title.trim(), selectedStatus, dueDate || null, projectId, assignedTo]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task.", error: error.message });
  }
}

async function updateTaskStatus(req, res) {
  const taskId = Number(req.params.id);
  const { status } = req.body;

  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${ALLOWED_STATUS.join(", ")}` });
  }

  try {
    const access = await assertTaskAccess(taskId, req);

    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const task = access.task;

    const canUpdate = req.user.role === "Admin" || task.assigned_to === req.user.id;

    if (!canUpdate) {
      return res.status(403).json({ message: "Only admins or assigned members can update task status." });
    }

    const updated = await pool.query(
      `UPDATE tasks
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, title, status, due_date, project_id, assigned_to, updated_at`,
      [status, taskId]
    );

    return res.json(updated.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task status.", error: error.message });
  }
}

async function getTaskDetails(req, res) {
  const taskId = Number(req.params.id);

  try {
    const access = await assertTaskAccess(taskId, req);

    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const task = access.task;

    const [subtasksRes, commentsRes] = await Promise.all([
      pool.query(
        `SELECT id, title, is_completed, task_id, created_at
         FROM subtasks
         WHERE task_id = $1
         ORDER BY created_at ASC`,
        [taskId]
      ),
      pool.query(
        `SELECT c.id, c.content, c.created_at, c.user_id, u.name AS user_name, u.role AS user_role
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.task_id = $1
         ORDER BY c.created_at ASC`,
        [taskId]
      )
    ]);

    const subtasks = subtasksRes.rows;

    return res.json({
      task,
      subtasks,
      comments: commentsRes.rows,
      progressPercent: calculateProgress(subtasks)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch task details.", error: error.message });
  }
}

async function addSubtask(req, res) {
  const taskId = Number(req.params.id);
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Subtask title is required." });
  }

  try {
    const access = await assertTaskAccess(taskId, req);

    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const inserted = await pool.query(
      `INSERT INTO subtasks (title, task_id)
       VALUES ($1, $2)
       RETURNING id, title, is_completed, task_id, created_at`,
      [title.trim(), taskId]
    );

    return res.status(201).json(inserted.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add subtask.", error: error.message });
  }
}

async function toggleSubtask(req, res) {
  const taskId = Number(req.params.id);
  const subtaskId = Number(req.params.subtaskId);

  try {
    const access = await assertTaskAccess(taskId, req);

    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const toggled = await pool.query(
      `UPDATE subtasks
       SET is_completed = NOT is_completed
       WHERE id = $1 AND task_id = $2
       RETURNING id, title, is_completed, task_id, created_at`,
      [subtaskId, taskId]
    );

    if (toggled.rowCount === 0) {
      return res.status(404).json({ message: "Subtask not found." });
    }

    return res.json(toggled.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update subtask.", error: error.message });
  }
}

async function addComment(req, res) {
  const taskId = Number(req.params.id);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Comment content is required." });
  }

  try {
    const access = await assertTaskAccess(taskId, req);

    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const inserted = await pool.query(
      `INSERT INTO comments (content, user_id, task_id)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at, user_id, task_id`,
      [content.trim(), req.user.id, taskId]
    );

    return res.status(201).json(inserted.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment.", error: error.message });
  }
}

async function deleteComment(req, res) {
  const taskId = Number(req.params.id);
  const commentId = Number(req.params.commentId);

  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only admins can delete comments." });
  }

  try {
    const deleted = await pool.query(
      `DELETE FROM comments
       WHERE id = $1 AND task_id = $2
       RETURNING id`,
      [commentId, taskId]
    );

    if (deleted.rowCount === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }

    return res.json({ message: "Comment deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete comment.", error: error.message });
  }
}

async function getTaskSummary(req, res) {
  try {
    const countsQuery =
      req.user.role === "Admin"
        ? `SELECT
             COUNT(*)::int AS total_tasks,
             COUNT(*) FILTER (WHERE status = 'Done')::int AS completed_tasks,
             COUNT(*) FILTER (WHERE due_date IS NOT NULL AND due_date < CURRENT_DATE AND status <> 'Done')::int AS overdue_tasks
           FROM tasks`
        : `SELECT
             COUNT(*)::int AS total_tasks,
             COUNT(*) FILTER (WHERE t.status = 'Done')::int AS completed_tasks,
             COUNT(*) FILTER (WHERE t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status <> 'Done')::int AS overdue_tasks
           FROM tasks t
           JOIN project_members pm ON pm.project_id = t.project_id
           WHERE pm.user_id = $1`;

    const result =
      req.user.role === "Admin" ? await pool.query(countsQuery) : await pool.query(countsQuery, [req.user.id]);

    return res.json({
      totalTasks: result.rows[0].total_tasks,
      completedTasks: result.rows[0].completed_tasks,
      overdueTasks: result.rows[0].overdue_tasks
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch task summary.", error: error.message });
  }
}

async function getProjectTasks(req, res) {
  const projectId = Number(req.params.projectId);

  try {
    const accessRes = await pool.query(
      `SELECT 1
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, req.user.id]
    );

    if (accessRes.rowCount === 0 && req.user.role !== "Admin") {
      return res.status(403).json({ message: "You do not have access to this project." });
    }

    const result = await pool.query(
      `SELECT t.id, t.title, t.status, t.due_date, t.project_id, t.assigned_to,
              u.name AS assigned_to_name
       FROM tasks t
       JOIN users u ON u.id = t.assigned_to
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks.", error: error.message });
  }
}

module.exports = {
  createTask,
  updateTaskStatus,
  getProjectTasks,
  getTaskDetails,
  addSubtask,
  toggleSubtask,
  addComment,
  deleteComment,
  getTaskSummary,
  getDashboardStats
};

async function getDashboardStats(req, res) {
  try {
    if (req.user.role === "Admin") {
      const perUser = await pool.query(
        `SELECT u.id, u.name,
                COUNT(t.id)::int AS total_tasks,
                COUNT(t.id) FILTER (WHERE t.status = 'Done')::int AS completed_tasks,
                COUNT(t.id) FILTER (WHERE t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status <> 'Done')::int AS overdue_tasks
         FROM users u
         LEFT JOIN tasks t ON t.assigned_to = u.id
         GROUP BY u.id, u.name
         ORDER BY total_tasks DESC`
      );

      const overall = await pool.query(
        `SELECT
            COUNT(*)::int AS total_tasks,
            COUNT(*) FILTER (WHERE status = 'Done')::int AS completed_tasks,
            COUNT(*) FILTER (WHERE due_date IS NOT NULL AND due_date < CURRENT_DATE AND status <> 'Done')::int AS overdue_tasks
         FROM tasks`
      );

      return res.json({ overall: overall.rows[0], perUser: perUser.rows });
    } else {
      const personal = await pool.query(
        `SELECT
           COUNT(*)::int AS total_tasks,
           COUNT(*) FILTER (WHERE status = 'Done')::int AS completed_tasks,
           COUNT(*) FILTER (WHERE due_date IS NOT NULL AND due_date < CURRENT_DATE AND status <> 'Done')::int AS overdue_tasks
         FROM tasks
         WHERE assigned_to = $1`,
        [req.user.id]
      );

      const byStatus = await pool.query(
        `SELECT status, COUNT(*)::int AS count
         FROM tasks
         WHERE assigned_to = $1
         GROUP BY status`,
        [req.user.id]
      );

      return res.json({ personal: personal.rows[0], byStatus: byStatus.rows });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard stats.", error: error.message });
  }
}
