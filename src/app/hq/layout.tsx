import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/current-user";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function HqLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole("HQ");
  const copy = messages(await getLocale());
  return (
    <AppShell user={{ fullName: user.fullName, role: user.role, nurseryName: copy.chrome.network }}>
      {children}
    </AppShell>
  );
}
