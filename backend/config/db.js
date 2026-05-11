const { PrismaClient } = require("@prisma/client");

const pooledOrDefaultUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL ||
  "";

const directUrl = process.env.DIRECT_URL || "";
const shouldPreferDirect = process.env.PREFER_DIRECT_URL === "true" && Boolean(directUrl);

const connectionString = shouldPreferDirect ? directUrl : pooledOrDefaultUrl;

if (!connectionString) {
  console.error(
    "⚠️ WARNING: Database URL is missing. Set DATABASE_URL (preferred) or DATABASE_PUBLIC_URL in your deployment variables."
  );
  console.error("Server will start in degraded mode. Auth and data endpoints will fail.");
}

if (connectionString && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = connectionString;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString || "postgresql://user:password@localhost/db"
    }
  }
});

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
