import "server-only";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

const globalForDb = globalThis as typeof globalThis & { fhDbPool?: Pool };

export function getDb(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum dikonfigurasi");
  if (!globalForDb.fhDbPool) {
    globalForDb.fhDbPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
    attachDatabasePool(globalForDb.fhDbPool);
  }
  return globalForDb.fhDbPool;
}
