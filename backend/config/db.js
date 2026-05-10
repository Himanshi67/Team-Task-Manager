const { Pool } = require("pg");
const { newDb } = require("pg-mem");

const hasDatabaseUrl = typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.trim() !== "";
const useInMemoryDb = process.env.USE_IN_MEMORY_DB === "true" || !hasDatabaseUrl;

let pool;

if (useInMemoryDb) {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pgMem = db.adapters.createPg();
  pool = new pgMem.Pool();
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}

pool.isMemory = useInMemoryDb;

if (pool.isMemory) {
  console.warn(
    "[db] USE_IN_MEMORY_DB is enabled, so users, passwords, and tasks are stored only in memory and will reset when the server restarts. Set DATABASE_URL to a real PostgreSQL database to persist data."
  );
}

module.exports = pool;
