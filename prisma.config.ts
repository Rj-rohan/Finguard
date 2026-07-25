import { defineConfig } from "prisma/config";

const url = process.env["DATABASE_URL"] || process.env["POSTGRES_URL"] || process.env["DATABASE_PRIVATE_URL"] || "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: url || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
