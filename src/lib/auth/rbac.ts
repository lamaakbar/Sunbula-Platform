import { notFound } from "next/navigation";
import type { AppUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

export class ForbiddenError extends Error {
  constructor(message = "You do not have access to this information.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertNurseryScope(user: AppUser, nurseryId: string) {
  if (user.role === "HQ") return;
  if (!user.nurseryId || user.nurseryId !== nurseryId) {
    throw new ForbiddenError();
  }
}

export function assertZoneScope(user: AppUser, zoneId: string, zoneNurseryId: string) {
  assertNurseryScope(user, zoneNurseryId);
  if (user.role === "EMPLOYEE" && !user.assignedZoneIds.includes(zoneId)) {
    throw new ForbiddenError();
  }
}

export async function getAccessibleZone(user: AppUser, zoneId: string) {
  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    include: { nursery: true },
  });
  if (!zone) notFound();
  try {
    assertZoneScope(user, zone.id, zone.nurseryId);
  } catch {
    notFound();
  }
  return zone;
}

export async function getAccessibleCell(user: AppUser, cellId: string) {
  const cell = await prisma.plantCell.findUnique({
    where: { id: cellId },
    include: {
      zone: true,
      nursery: true,
    },
  });
  if (!cell) notFound();
  try {
    assertZoneScope(user, cell.zoneId, cell.nurseryId);
  } catch {
    notFound();
  }
  return cell;
}

export function employeePrimaryZone(user: AppUser) {
  return user.assignedZones[0] ?? null;
}
