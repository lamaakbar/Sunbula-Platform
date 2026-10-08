"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { logoutAction } from "@/app/actions/auth";
import { setLocaleAction } from "@/app/actions/locale";
import { BrandMark } from "@/components/brand/BrandMark";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/locale";
import { navigationFor, type NavItem } from "@/lib/nav";
import { messages } from "@/lib/i18n";
import { navLabel } from "@/lib/workflow-copy";
import type { Role } from "@prisma/client";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export type ShellUser = {
  fullName: string;
  role: Role;
  nurseryName: string | null;
};

const ROLE_PREFIX: Record<Role, string> = {
  EMPLOYEE: "/employee",
  SUPERVISOR: "/supervisor",
  HQ: "/hq",
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  locale,
  onClick,
  tone = "dark",
}: {
  item: NavItem;
  pathname: string;
  locale: Locale;
  onClick?: () => void;
  tone?: "dark" | "light";
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition",
        tone === "dark"
          ? active
            ? "bg-white/12 text-white"
            : "text-sage hover:bg-white/8 hover:text-white"
          : active
            ? "bg-light-sage text-forest"
            : "text-muted hover:bg-cream hover:text-forest",
      )}
    >
      <Icon className="h-4 w-4" />
      {navLabel(locale, item.href, item.label)}
    </Link>
  );
}

export function ShellChrome({ user, locale }: { user: ShellUser; locale: Locale }) {
  const pathname = usePathname();
  const mounted = useHydrated();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = navigationFor(user.role);
  const prefix = ROLE_PREFIX[user.role];
  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const copy = messages(locale);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) {
    return (
      <>
        <aside
          suppressHydrationWarning
          className="sidebar-texture hidden lg:fixed lg:inset-y-0 lg:start-0 lg:flex lg:w-72"
          aria-hidden="true"
        />
        <header
          suppressHydrationWarning
          className="fixed top-0 start-0 end-0 z-20 h-[4.25rem] border-b border-sand/80 bg-cream/85 lg:start-72"
          aria-hidden="true"
        />
      </>
    );
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-forest/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label={copy.chrome.closeMenu}
        />
      ) : null}

      <aside className="sidebar-texture hidden lg:fixed lg:inset-y-0 lg:start-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex h-[4.5rem] items-center px-6">
          <BrandMark tone="light" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {nav.primary.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} locale={locale} />
          ))}
          {nav.more.length > 0 && (
            <div className="pt-4">
              <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sage/80">
                {copy.chrome.more}
              </p>
              {nav.more.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} locale={locale} />
              ))}
            </div>
          )}
        </nav>
        <div className="relative mx-4 mb-5 rounded-2xl bg-white/8 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-sm font-semibold text-forest">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
              <p className="truncate text-xs text-sage">{user.nurseryName ?? copy.chrome.allNurseries}</p>
            </div>
          </div>
        </div>
      </aside>

      <aside
        className={cn(
          "sidebar-texture fixed inset-y-0 start-0 z-40 w-72 transition-transform lg:hidden",
          open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between px-5">
          <BrandMark tone="light" />
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-sage" aria-label={copy.chrome.closeMenu}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 px-4 py-4">
          {[...nav.primary, ...nav.more].map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} locale={locale} onClick={() => setOpen(false)} />
          ))}
        </nav>
      </aside>

      <header className="fixed top-0 start-0 end-0 z-20 border-b border-sand/80 bg-cream/85 backdrop-blur-md lg:start-72">
        <div className="flex h-[4.25rem] items-center justify-between px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-forest lg:hidden"
            aria-label={copy.chrome.openMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <form action={setLocaleAction}>
              <input type="hidden" name="locale" value={locale === "ar" ? "en" : "ar"} />
              <button type="submit" className="rounded-xl px-2 py-2 text-sm font-semibold text-forest hover:bg-light-sage">
                {locale === "ar" ? "English" : "العربية"}
              </button>
            </form>
            <Link href={`${prefix}/alerts`} className="rounded-xl p-2 text-forest hover:bg-light-sage" aria-label={copy.chrome.notifications}>
              <Bell className="h-5 w-5" />
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full bg-white py-1.5 ps-1.5 pe-3 text-sm font-medium text-forest ring-1 ring-sand"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-light-sage">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="hidden sm:inline">{user.fullName.split(" ")[0]}</span>
              </button>
              {menuOpen ? (
                <div className="absolute end-0 mt-2 w-48 overflow-hidden rounded-2xl bg-white py-2 shadow-lift ring-1 ring-sand">
                  <Link
                    href={`${prefix}/profile`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-forest hover:bg-cream"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserRound className="h-4 w-4" />
                    {copy.chrome.profile}
                  </Link>
                  <form action={logoutAction}>
                    <button type="submit" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-forest hover:bg-cream">
                      <LogOut className="h-4 w-4" />
                      {copy.chrome.signOut}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export function BottomNav({ user, locale }: { user: ShellUser; locale: Locale }) {
  const pathname = usePathname();
  const mounted = useHydrated();
  const items = navigationFor(user.role).primary.filter((item) => item.mobile).slice(0, 5);

  if (!mounted) {
    return (
      <nav
        suppressHydrationWarning
        className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-sand bg-cream/95 lg:hidden"
        aria-hidden="true"
      />
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-cream/95 px-2 py-2 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-medium",
                  active ? "bg-light-sage text-forest" : "text-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {navLabel(locale, item.href, item.label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
