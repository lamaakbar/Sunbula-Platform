import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/current-user";

export default async function EmployeeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole("EMPLOYEE");
  return (
    <AppShell
      user={{ fullName: user.fullName, role: user.role, nurseryName: user.nurseryName }}
    >
      {children}
    </AppShell>
  );
}
