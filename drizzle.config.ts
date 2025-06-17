import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: {
    ...enums,
    ...schema,
  },
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
});
