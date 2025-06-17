import { pgTable as table, bigint, text, boolean } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers";

export const customers = table("customers", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  state: text("state"),
  verifiedEmail: boolean("verified_email"),
  phone: text("phone"),
  tags: text("tags"),
  currency: text("currency"),
  ...timestamps,
});

export type Customer = typeof customers.$inferSelect; 