import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/constants";

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: Role;
  nurseryId: string | null;
  nurseryName: string | null;
  assignedZoneIds: string[];
  assignedZones: Array<{ id: string; name: string; code: string }>;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      nursery: { select: { id: true, name: true } },
      zoneAssignments: {
        include: { zone: { select: { id: true, name: true, code: true } } },
      },
    },
  });

  if (!user || user.accountStatus !== "ACTIVE") return null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    role: user.role,
    nurseryId: user.nurseryId,
    nurseryName: user.nursery?.name ?? null,
    assignedZoneIds: user.zoneAssignments.map((item) => item.zoneId),
    assignedZones: user.zoneAssignments.map((item) => item.zone),
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(ROLE_HOME[user.role]);
  }
  return user;
}
