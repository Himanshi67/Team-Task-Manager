require("dotenv").config();

const pool = require("../config/db");
const { initializeDatabase } = require("../db/bootstrap");

async function run() {
  try {
    await initializeDatabase();
    console.log("Seed complete.");
    console.log("Admin: admin@demo.com / Admin@123");
    console.log("Member: member@demo.com / Member@123");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
