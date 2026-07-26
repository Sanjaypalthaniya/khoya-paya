import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Client generation only needs the schema. Keep the datasource override
  // optional so dependency installation can run before Vercel env vars exist.
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
