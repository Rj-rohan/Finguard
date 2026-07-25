import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis;

function createPrisma() {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db").split(path.sep).join("/");
  // Windows needs file:///C:/... — ensure three slashes before the drive letter
  const url = dbPath.startsWith("/") ? `file://${dbPath}` : `file:///${dbPath}`;
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
