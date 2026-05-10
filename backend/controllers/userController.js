const pool = require("../config/db");

async function listUsers(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, department, created_at FROM users ORDER BY created_at DESC"
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users.", error: error.message });
  }
}

module.exports = { listUsers };
