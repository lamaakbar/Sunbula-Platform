import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "sanbala_session";
export const INTENDED_ROLE_COOKIE = "sanbala_intended_role";

export const ROLE_HOME: Record<Role, string> = {
  EMPLOYEE: "/employee",
  SUPERVISOR: "/supervisor",
  HQ: "/hq",
};

export const ROLE_LABEL: Record<Role, string> = {
  EMPLOYEE: "Employee",
  SUPERVISOR: "Supervisor",
  HQ: "HQ",
};

export const STALE_READING_HOURS = 48;

export const DEMO_ACCOUNTS = {
  EMPLOYEE: {
    email: "ahmed@sanbala.sa",
    password: "Sanbala.Employee1",
    name: "Ahmed",
  },
  SUPERVISOR: {
    email: "sara@sanbala.sa",
    password: "Sanbala.Supervisor1",
    name: "Sara",
  },
  HQ: {
    email: "hq@sanbala.sa",
    password: "Sanbala.HQ1",
    name: "Management User",
  },
} as const;
