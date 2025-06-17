import { pgTable as table, boolean, integer, text } from "drizzle-orm/pg-core";
import { InferSelectModel, relations } from "drizzle-orm";
import { timestamps } from "./helpers";
import { userRole } from "./enums";
import { branches } from "./branches";
import { departments } from "./departments";

export const users = table("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  employeeId: text("employee_id"),
  name: text("name"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  jobTitle: text("job_title"),
  role: userRole("role"),
  departmentId: integer("department_id").references(() => departments.id),
  branchId: integer("branch_id").references(() => branches.id),
  oldId: integer("old_id"),
  deskNo: text("desk_no"),
  isActive: boolean("is_active").default(true),
  ...timestamps,
});

export type User = typeof users.$inferSelect;

export type UserDetails = User & {
  branch: typeof branches.$inferSelect;
  department: typeof departments.$inferSelect;
};

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  // Add other relations as needed
})); 