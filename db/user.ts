"use server";

import { auth } from "@/auth";
import { db } from ".";
import { eq } from "drizzle-orm";
import { users } from "./schema";
import { cookies } from "next/headers";

interface UserCookie {
  id: number;
  name: string | null;
  employeeId: string | null;
  departmentId: number | null;
  branchId: number | null;
}

export async function getCurrentUserFromDb() {
  // try to get user from session first
  const session = await auth();

  // if no session, try to get from cookie
  if (!session?.user) {
    const storedUser = cookies().get("user")?.value;

    if (!storedUser) {
      throw new Error("No authentication found - neither session nor cookie");
    }

    try {
      const user = JSON.parse(storedUser) as UserCookie;
      const userFromDb = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      if (!userFromDb) {
        throw new Error(`User with id ${user.id} not found in database`);
      }

      return userFromDb;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid user cookie format");
      }
      throw error;
    }
  }

  // handle session-based auth (google login)
  const email = session.user.email;

  if (!email) {
    throw new Error("User email not found in session");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error(`User with email ${email} not found in database`);
  }

  return user;
}
