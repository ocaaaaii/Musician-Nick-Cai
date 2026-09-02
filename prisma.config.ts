import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma CLI (migrate/studio/db seed) uses this url. It MUST be the direct
// (non-pooled) Supabase connection - the pooled DATABASE_URL used at runtime
// does not support the DDL Migrate needs. See design.md, Decision 3.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
