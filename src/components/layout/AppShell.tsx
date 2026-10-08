import { BottomNav, ShellChrome, type ShellUser } from "@/components/layout/shell-chrome";
import { getLocale } from "@/lib/locale";

export async function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <div className="min-h-screen">
      <ShellChrome user={user} locale={locale} />
      <div className="lg:ps-72">
        <div className="h-[4.25rem]" aria-hidden="true" />
        <main className="px-4 py-6 pb-28 lg:px-8 lg:pb-10">{children}</main>
      </div>
      <BottomNav user={user} locale={locale} />
    </div>
  );
}
