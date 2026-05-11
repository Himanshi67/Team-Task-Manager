require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
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
    return res.json({ status: "ok", db: "neon-postgres" });
  } catch (error) {
    return res.status(500).json({ status: "error", db: "disconnected", error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

async function startServer() {
  const maxAttempts = Number(process.env.DB_INIT_RETRIES || 5);
  const retryDelayMs = Number(process.env.DB_INIT_RETRY_DELAY_MS || 4000);

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await initializeDatabase();
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      const errorMessage = error && error.message ? error.message : String(error);

      if (attempt === maxAttempts) {
        break;
      }

      console.warn(
        `[startup] Database init attempt ${attempt}/${maxAttempts} failed: ${errorMessage}. Retrying in ${retryDelayMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  if (lastError) {
    throw lastError;
  }

  const port = process.env.PORT || 5000;
  app.listen(process.env.PORT || 5000, () => {
    console.log(`API running on port ${port}`);
    console.log("Database mode: Prisma + Neon PostgreSQL");
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
