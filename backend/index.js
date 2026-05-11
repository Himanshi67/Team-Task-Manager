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

aapp.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/api/health', async (req, res) => {
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  const hasDatabaseUrl = !!databaseUrl;

  if (!hasDatabaseUrl) {
    return res.status(503).json({
      status: 'degraded',
      db: 'not_configured',
      error: 'DATABASE_URL not set in environment variables',
    });
  }

  return res.status(200).json({
    status: 'ok',
    db: 'configured',
  });
});
  
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", db: "connected" });
  } catch (error) {
    return res.status(503).json({
      status: "degraded",
      db: "error",
      error: error.message || "Database connection failed",
      details: "Database URL is set but connection failed. Check credentials and network access."
    });
  }


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
  const PORT = Number(process.env.PORT) || 8080;

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

  const allowStartWithoutDb = process.env.ALLOW_START_WITHOUT_DB === "true";

  if (lastError && !allowStartWithoutDb) {
    throw lastError;
  }

  if (lastError && allowStartWithoutDb) {
    const errorMessage = lastError && lastError.message ? lastError.message : String(lastError);
    console.warn(`[startup] Continuing without database because ALLOW_START_WITHOUT_DB=true. Last DB error: ${errorMessage}`);
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`API running on port ${PORT}`);
    
    const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.POSTGRES_URL || process.env.POSTGRESQL_URL;
    
    if (!databaseUrl) {
      console.log("❌ Database mode: NONE (DATABASE_URL not set)");
      console.warn("⚠️  No database URL configured. All data will be lost on restart.");
    } else {
      console.log("✓ Database mode: Prisma + Neon PostgreSQL");
      console.log("✓ DATABASE_URL is set");
      
      // Try to verify database connection
      try {
        await pool.query("SELECT 1");
        console.log("✅ Database connection verified");
      } catch (error) {
        console.warn("⚠️  Database connection failed:", error.message);
      }
    }
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
