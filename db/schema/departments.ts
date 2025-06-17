import { pgTable as table, integer, text } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers";

export const departments = table("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  ...timestamps,
});

export type Department = typeof departments.$inferSelect; 