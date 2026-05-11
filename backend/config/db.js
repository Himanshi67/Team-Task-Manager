const { PrismaClient } = require("@prisma/client");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Add your Neon connection string in backend/.env.");
}

const prisma = new PrismaClient();

function returnsRows(sql) {
  return /^\s*(select|with)\b/i.test(sql) || /\breturning\b/i.test(sql);
}

async function query(sql, params = []) {
  const values = Array.isArray(params) ? params : [params];

  if (returnsRows(sql)) {
    const rows = await prisma.$queryRawUnsafe(sql, ...values);
    return {
      rows: Array.isArray(rows) ? rows : [],
      rowCount: Array.isArray(rows) ? rows.length : 0
    };
  }

  const rowCount = await prisma.$executeRawUnsafe(sql, ...values);
  return { rows: [], rowCount: Number(rowCount) || 0 };
}

async function end() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  query,
  end,
  isMemory: false
};
