import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/current-user";

export default async function HqLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole("HQ");
  return (
    <AppShell user={{ fullName: user.fullName, role: user.role, nurseryName: "SUNBULA Network" }}>
      {children}
    </AppShell>
  );
}
