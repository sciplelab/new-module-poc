import { pgTable as table, integer, bigint, text, decimal } from "drizzle-orm/pg-core";
import { customers } from "./customers";

export const addresses = table("addresses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: bigint({ mode: "number" }).references(() => customers.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  address1: text("address1"),
  address2: text("address2"),
  city: text("city"),
  province: text("province"),
  provinceCode: text("province_code"),
  country: text("country"),
  countryCode: text("country_code"),
  zip: text("zip"),
  phone: text("phone"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
});

export type Address = typeof addresses.$inferSelect; 