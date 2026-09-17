import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ROLE_HOME, SESSION_COOKIE } from "@/lib/constants";
import type { Role } from "@prisma/client";

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

function homeFor(role: Role) {
  return ROLE_HOME[role];
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isEmployee = pathname.startsWith("/employee");
  const isSupervisor = pathname.startsWith("/supervisor");
  const isHq = pathname.startsWith("/hq");
  if (!isEmployee && !isSupervisor && !isHq) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const key = secretKey();
  if (!token || !key) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, key);
    const role = payload.role as Role;

    if (isEmployee && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    if (isSupervisor && role !== "SUPERVISOR") {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    if (isHq && role !== "HQ") {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ["/employee/:path*", "/supervisor/:path*", "/hq/:path*"],
};
