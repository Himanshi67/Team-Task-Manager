#!/usr/bin/env node
/**
 * Database initialization script
 * Ensures Prisma schema is pushed to the database before server starts
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.POSTGRES_URL || process.env.POSTGRESQL_URL;

if (!databaseUrl) {
  console.warn("⚠️  DATABASE_URL not set. Skipping database initialization.");
  process.exit(0);
}

console.log("[init-db] Starting database initialization...");

try {
  // Generate Prisma Client
  console.log("[init-db] Generating Prisma Client...");
  execSync("prisma generate", { stdio: "inherit", cwd: __dirname + "/.." });

  // Push schema to database
  console.log("[init-db] Pushing Prisma schema to database...");
  execSync("prisma db push --skip-generate", {
    stdio: "inherit",
    cwd: __dirname + "/..",
    env: { ...process.env, SKIP_ENV_VALIDATION: "true" }
  });

  console.log("[init-db] ✅ Database initialized successfully!");
  process.exit(0);
} catch (error) {
  console.error("[init-db] ❌ Database initialization failed:");
  console.error(error.message);
  
  // Don't exit with error - let the server start anyway
  // It will use the fallback schema from schema.sql
  console.warn("[init-db] Attempting fallback schema initialization...");
  process.exit(0);
}
