"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { Role } from "@prisma/client";
import { BrandMark } from "@/components/brand/BrandMark";
import { BotanicalMark } from "@/components/brand/BotanicalMark";
import { RoleBadge } from "@/components/data/HealthBadge";
import { logoutAction } from "@/app/actions/auth";
import { allNavItems, navigationFor } from "@/lib/nav";
import { cn } from "@/lib/cn";

type ShellUser = {
  fullName: string;
  role: Role;
  nurseryName: string | null;
};

export function AppShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = navigationFor(user.role);
  const all = allNavItems(user.role);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen" suppressHydrationWarning>
      <aside className="sidebar-texture fixed inset-y-0 left-0 z-30 hidden w-72 flex-col overflow-hidden text-cream lg:flex">
        <BotanicalMark className="pointer-events-none absolute -bottom-8 -right-6 h-44 w-44 text-sage/20" variant="canopy" />
        <div className="relative px-5 py-6">
          <BrandMark light size="lg" />
        </div>
        <nav className="relative flex-1 space-y-1 px-3">
          {all.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== ROLE_PREFIX[user.role] && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                suppressHydrationWarning
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                  active
                    ? "bg-cream/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-sage/90 hover:bg-white/8 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    active ? "bg-sage/25 text-white" : "bg-white/5 text-sage",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="relative m-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/30 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
              <p className="truncate text-xs text-sage">{user.nurseryName ?? "All nurseries"}</p>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn("fixed inset-0 z-40 bg-deep/40 backdrop-blur-[2px] lg:hidden", open ? "block" : "hidden")}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "sidebar-texture fixed inset-y-0 left-0 z-50 w-72 text-cream transition lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <BrandMark light size="lg" />
          <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-white" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 px-3">
          {all.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-sage hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sand/70 bg-cream/80 px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 text-forest lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <BrandMark compact />
            </div>
            <div className="hidden lg:block">
              <RoleBadge role={user.role} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={user.role === "HQ" ? "/hq/alerts" : user.role === "SUPERVISOR" ? "/supervisor/alerts" : "/employee/tasks"}
              className="rounded-xl p-2 text-forest hover:bg-light-sage"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-forest shadow-sm ring-1 ring-sand"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-light-sage text-xs font-semibold">
                  {initials}
                </span>
                <span className="hidden sm:inline">{user.fullName.split(" ")[0]}</span>
                <MoreHorizontal className="h-4 w-4 text-muted" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-sand bg-white p-2 shadow-lg">
                  <p className="px-3 py-2 text-xs text-muted">{user.nurseryName ?? "Network scope"}</p>
                  <form action={logoutAction}>
                    <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-forest hover:bg-light-sage">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 pb-28 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <ul className="grid grid-cols-4 gap-1">
          {nav.primary.filter((item) => item.mobile).map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== ROLE_PREFIX[user.role] && pathname.startsWith(item.href) && item.href !== ROLE_PREFIX[user.role]);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  suppressHydrationWarning
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center rounded-2xl text-[11px] font-medium",
                    active ? "bg-light-sage text-forest" : "text-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex min-h-12 w-full flex-col items-center justify-center rounded-2xl text-[11px] font-medium text-muted"
            >
              <MoreHorizontal className="h-5 w-5" />
              More
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

const ROLE_PREFIX: Record<Role, string> = {
  EMPLOYEE: "/employee",
  SUPERVISOR: "/supervisor",
  HQ: "/hq",
};
