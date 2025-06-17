import { pgTable as table, integer, text } from "drizzle-orm/pg-core";

export const branches = table("branches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name"),
  code: text("code"),
});

export type Branch = typeof branches.$inferSelect; 