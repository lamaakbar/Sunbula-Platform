import { BottomNav, ShellChrome, type ShellUser } from "@/components/layout/shell-chrome";

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <ShellChrome user={user} />
      <div className="lg:pl-72">
        <div className="h-[4.25rem]" aria-hidden="true" />
        <main className="px-4 py-6 pb-28 lg:px-8 lg:pb-10">{children}</main>
      </div>
      <BottomNav user={user} />
    </div>
  );
}
