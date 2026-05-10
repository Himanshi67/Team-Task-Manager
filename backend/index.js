require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const pool = require("./config/db");
const { initializeDatabase } = require("./db/bootstrap");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", db: pool.isMemory ? "pg-mem" : "postgres" });
  } catch (error) {
    return res.status(500).json({ status: "error", db: "disconnected", error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

async function startServer() {
  await initializeDatabase();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`API running on port ${port}`);
    console.log(`Database mode: ${pool.isMemory ? "pg-mem (in-memory)" : "PostgreSQL"}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
