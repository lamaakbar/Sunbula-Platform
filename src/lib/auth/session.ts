import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import { INTENDED_ROLE_COOKIE, SESSION_COOKIE } from "@/lib/constants";

export type SessionPayload = {
  userId: string;
  role: Role;
  nurseryId: string | null;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET is missing or too short.");
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setSubject(payload.userId)
    .sign(secretKey());
}

export async function decryptSession(token: string) {
  const { payload } = await jwtVerify(token, secretKey());
  return {
    userId: String(payload.userId),
    role: payload.role as Role,
    nurseryId: (payload.nurseryId as string | null) ?? null,
  } satisfies SessionPayload;
}

export async function createSession(payload: SessionPayload) {
  const token = await encryptSession(payload);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await decryptSession(token);
  } catch {
    return null;
  }
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function setIntendedRole(role: Role) {
  const jar = await cookies();
  jar.set(INTENDED_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function getIntendedRole(): Promise<Role | null> {
  const jar = await cookies();
  const value = jar.get(INTENDED_ROLE_COOKIE)?.value;
  if (value === "EMPLOYEE" || value === "SUPERVISOR" || value === "HQ") {
    return value;
  }
  return null;
}

export async function clearIntendedRole() {
  const jar = await cookies();
  jar.delete(INTENDED_ROLE_COOKIE);
}
