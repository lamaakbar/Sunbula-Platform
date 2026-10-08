import Link from "next/link";
import { ArrowLeft, Building2, HardHat, Trees } from "lucide-react";
import type { Role } from "@prisma/client";
import { SignInForm } from "@/components/auth/SignInForm";
import { BrandMark } from "@/components/brand/BrandMark";
import { BotanicalMark } from "@/components/brand/BotanicalMark";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

const icons = { EMPLOYEE: HardHat, SUPERVISOR: Trees, HQ: Building2 } as const;

function isRole(value: string | undefined): value is Role {
  return value === "EMPLOYEE" || value === "SUPERVISOR" || value === "HQ";
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const locale = await getLocale();
  const copy = messages(locale);
  const { role } = await searchParams;
  const selected = isRole(role) ? role : null;
  const cards: Array<{ role: Role; subtitle: string; description: string }> = [
    { role: "EMPLOYEE", subtitle: copy.welcome.employeeSub, description: copy.welcome.employeeBody },
    { role: "SUPERVISOR", subtitle: copy.welcome.supervisorSub, description: copy.welcome.supervisorBody },
    { role: "HQ", subtitle: copy.welcome.hqSub, description: copy.welcome.hqBody },
  ];

  return (
    <div className="welcome-canvas relative min-h-screen overflow-hidden px-4 py-8 sm:px-10 sm:py-14">
      <BotanicalMark className="pointer-events-none absolute -start-16 top-24 hidden h-72 w-72 text-sage/25 lg:block" variant="canopy" />
      <BotanicalMark className="pointer-events-none absolute -end-10 bottom-0 h-64 w-64 text-leaf/15" />
      <div className="relative">
        {!selected ? (
          <div className="mx-auto max-w-6xl">
            <div className="max-w-xl">
              <BrandMark size="hero" />
              <p className="mt-8 max-w-xl text-lg leading-8 text-muted">{copy.welcome.tagline}</p>
              <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-leaf">{copy.welcome.access}</p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {cards.map((item) => {
                const Icon = icons[item.role];
                return (
                  <Link
                    key={item.role}
                    href={`/?role=${item.role}`}
                    className="card-lift group relative min-h-[280px] overflow-hidden rounded-[2rem] bg-white p-7 text-start ring-1 ring-sand"
                  >
                    <BotanicalMark
                      className="pointer-events-none absolute -bottom-8 -end-6 h-32 w-32 text-sage/25 transition group-hover:text-leaf/30"
                      variant={item.role === "HQ" ? "canopy" : item.role === "SUPERVISOR" ? "sprout" : "seed"}
                    />
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-light-sage text-forest transition group-hover:bg-forest group-hover:text-cream">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-leaf">{item.subtitle}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-forest">{copy.roles[item.role]}</h2>
                    <p className="mt-3 max-w-[16rem] text-sm leading-6 text-muted">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-leaf">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {copy.welcome.back}
              </Link>
              <div className="mt-6">
                <BrandMark size="sm" />
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-tight text-forest">{copy.welcome.welcomeBack}</h2>
              <p className="mt-3 max-w-md text-base leading-7 text-muted">
                {selected === "HQ" ? copy.welcome.signInNetwork : copy.welcome.signInNursery}
              </p>
              <div className="mt-8 rounded-[1.75rem] bg-white/70 p-5 text-sm text-muted ring-1 ring-sand backdrop-blur">
                <p className="font-semibold text-forest">{copy.welcome.demo}</p>
                <p className="mt-2 leading-6">
                  {DEMO_ACCOUNTS[selected].email}
                  <br />
                  {DEMO_ACCOUNTS[selected].password}
                </p>
                {selected === "SUPERVISOR" ? <p className="mt-3">{copy.welcome.eastern}</p> : null}
              </div>
            </div>
            <SignInForm
              role={selected}
              email={DEMO_ACCOUNTS[selected].email}
              password={DEMO_ACCOUNTS[selected].password}
              locale={locale}
            />
          </div>
        )}
      </div>
    </div>
  );
}
