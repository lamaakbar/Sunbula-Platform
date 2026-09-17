"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { clearIntendedRole, createSession, clearSession, setIntendedRole } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/constants";
import { loginSchema } from "@/lib/validations";
import type { Role } from "@prisma/client";

export type LoginState = {
  error?: string;
  mismatch?: boolean;
  actualRole?: Role;
  fullName?: string;
};

export async function chooseRole(role: Role) {
  await setIntendedRole(role);
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
    intendedRole: formData.get("intendedRole"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue?.message ?? "Please check your details." };
  }

  const identifier = parsed.data.identifier.toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Those details were not recognised. Please try again." };
  }

  if (user.accountStatus !== "ACTIVE") {
    return { error: "This account is not active. Please contact SANBALA support." };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    nurseryId: user.nurseryId,
  });
  await clearIntendedRole();

  if (parsed.data.intendedRole !== user.role) {
    return {
      mismatch: true,
      actualRole: user.role,
      fullName: user.fullName,
    };
  }

  redirect(ROLE_HOME[user.role]);
}

export async function continueAsActualRole(role: Role) {
  redirect(ROLE_HOME[role]);
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
